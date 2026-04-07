import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

export interface LiveAPIConfig {
  model: string;
  systemInstruction: string;
  voiceName?: string;
  videoMode?: 'camera' | 'screen';
  onTranscription?: (text: string, isInterim: boolean) => void;
  onModelAudio?: (base64Audio: string) => void;
  onInterrupted?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private videoStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private videoInterval: any = null;
  private audioQueue: Int16Array[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(config: LiveAPIConfig) {
    if (this.session) {
      await this.disconnect();
    }

    this.audioContext = new AudioContext({ sampleRate: 24000 });
    
    const sessionPromise = this.ai.live.connect({
      model: config.model,
      callbacks: {
        onopen: () => {
          console.log("Live API connection opened");
          config.onOpen?.();
          this.startMicStreaming();
          if (config.videoMode) {
            this.startVideoStreaming(config.videoMode);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle model output (audio and text)
          if (message.serverContent?.modelTurn?.parts) {
            let textPart = "";
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                this.handleModelAudio(part.inlineData.data);
                config.onModelAudio?.(part.inlineData.data);
              }
              if (part.text) {
                textPart += part.text;
              }
            }
            if (textPart) {
              config.onTranscription?.(textPart, true);
            }
          }

          if (message.serverContent?.turnComplete) {
            config.onTranscription?.("", false);
          }

          if (message.serverContent?.interrupted) {
            console.log("Model interrupted");
            this.stopPlayback();
            config.onInterrupted?.();
          }

          if (message.toolCall) {
            console.log("Tool call received:", message.toolCall);
            // Handle tool calls if needed
            if (this.session) {
              this.session.sendToolResponse({
                functionResponses: message.toolCall.functionCalls.map(fc => ({
                  id: fc.id,
                  name: fc.name,
                  response: { success: true }
                }))
              });
            }
          }
        },
        onclose: () => {
          console.log("Live API connection closed");
          config.onClose?.();
          this.disconnect();
        },
        onerror: (error) => {
          console.error("Live API error:", error);
          config.onError?.(error);
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voiceName || "Orus" }
          }
        },
        systemInstruction: config.systemInstruction,
        tools: [{
          functionDeclarations: [{
            name: "saveTranslation",
            description: "Saves the translation result to the database.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                sourceLanguage: { type: Type.STRING },
                cleanedSourceText: { type: Type.STRING },
                targetLanguage: { type: Type.STRING },
                translation: { type: Type.STRING }
              },
              required: ["speaker", "sourceLanguage", "cleanedSourceText", "targetLanguage", "translation"]
            }
          }]
        }]
      },
    });

    this.session = await sessionPromise;
  }

  private async startMicStreaming() {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext!.createMediaStreamSource(this.micStream);
      
      // Use 16kHz for input as per Python script
      const inputContext = new AudioContext({ sampleRate: 16000 });
      const inputSource = inputContext.createMediaStreamSource(this.micStream);
      
      this.processor = inputContext.createScriptProcessor(2048, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = this.floatTo16BitPCM(inputData);
        const base64Data = this.arrayBufferToBase64(int16Data.buffer);
        
        if (this.session) {
          this.session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      inputSource.connect(this.processor);
      this.processor.connect(inputContext.destination);
    } catch (err) {
      console.error("Error starting mic streaming:", err);
    }
  }

  private handleModelAudio(base64Data: string) {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    this.audioQueue.push(int16Array);
    this.processAudioQueue();
  }

  private async processAudioQueue() {
    if (this.isPlaying || this.audioQueue.length === 0 || !this.audioContext) return;

    this.isPlaying = true;
    
    while (this.audioQueue.length > 0) {
      const int16Array = this.audioQueue.shift()!;
      const float32Array = this.int16ToFloat32(int16Array);
      
      const buffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      const startTime = Math.max(this.audioContext.currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + buffer.duration;
      
      // We don't await the end of the buffer to allow gapless playback
      // but we need to manage the queue
      await new Promise(resolve => setTimeout(resolve, (buffer.duration * 1000) - 10));
    }
    
    this.isPlaying = false;
  }

  private stopPlayback() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    // In a real app we might want to stop the current source node, but it's complex with gapless
  }

  async disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.stopPlayback();
  }

  private async startVideoStreaming(mode: 'camera' | 'screen') {
    try {
      if (mode === 'camera') {
        this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      } else {
        this.videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      const video = document.createElement('video');
      video.srcObject = this.videoStream;
      await video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      this.videoInterval = setInterval(() => {
        if (!ctx || !this.session) return;
        
        // Resize for model
        canvas.width = 640;
        canvas.height = 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        this.session.sendRealtimeInput({
          video: { data: base64Data, mimeType: 'image/jpeg' }
        });
      }, 1000); // 1 FPS as per Python script's sleep(1.0)
    } catch (err) {
      console.error("Error starting video streaming:", err);
    }
  }

  private floatTo16BitPCM(float32Array: Float32Array): Int16Array {
    const buffer = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buffer;
  }

  private int16ToFloat32(int16Array: Int16Array): Float32Array {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
