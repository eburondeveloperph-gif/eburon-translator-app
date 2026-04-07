/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Languages, Volume2, Settings, Info, Loader2, Globe, Sparkles, Camera, Monitor, Trash2, Copy, Check, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { GeminiLiveService } from '../services/geminiLiveService';

const LANGUAGES = [
  { label: 'Dutch Flemish', value: 'Dutch Flemish' },
  { label: 'Dutch Netherlands', value: 'Dutch Netherlands' },
  { label: 'Abkhaz', value: 'Abkhaz' },
  { label: 'Acehnese', value: 'Acehnese' },
  { label: 'Acholi', value: 'Acholi' },
  { label: 'Afar', value: 'Afar' },
  { label: 'Afrikaans', value: 'Afrikaans' },
  { label: 'Albanian', value: 'Albanian' },
  { label: 'Alur', value: 'Alur' },
  { label: 'Amharic', value: 'Amharic' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Armenian', value: 'Armenian' },
  { label: 'Assamese', value: 'Assamese' },
  { label: 'Avar', value: 'Avar' },
  { label: 'Awadhi', value: 'Awadhi' },
  { label: 'Aymara', value: 'Aymara' },
  { label: 'Azerbaijani', value: 'Azerbaijani' },
  { label: 'Balinese', value: 'Balinese' },
  { label: 'Baluchi', value: 'Baluchi' },
  { label: 'Bambara', value: 'Bambara' },
  { label: 'Baoulé', value: 'Baoulé' },
  { label: 'Bashkir', value: 'Bashkir' },
  { label: 'Basque', value: 'Basque' },
  { label: 'Batak Karo', value: 'Batak Karo' },
  { label: 'Batak Simalungun', value: 'Batak Simalungun' },
  { label: 'Batak Toba', value: 'Batak Toba' },
  { label: 'Belarusian', value: 'Belarusian' },
  { label: 'Bemba', value: 'Bemba' },
  { label: 'Bengali', value: 'Bengali' },
  { label: 'Betawi', value: 'Betawi' },
  { label: 'Bhojpuri', value: 'Bhojpuri' },
  { label: 'Bikol', value: 'Bikol' },
  { label: 'Bosnian', value: 'Bosnian' },
  { label: 'Breton', value: 'Breton' },
  { label: 'Bulgarian', value: 'Bulgarian' },
  { label: 'Buryat', value: 'Buryat' },
  { label: 'Cantonese', value: 'Cantonese' },
  { label: 'Catalan', value: 'Catalan' },
  { label: 'Cebuano', value: 'Cebuano' },
  { label: 'Chamorro', value: 'Chamorro' },
  { label: 'Chechen', value: 'Chechen' },
  { label: 'Chichewa', value: 'Chichewa' },
  { label: 'Chinese (Simplified)', value: 'Chinese (Simplified)' },
  { label: 'Chinese (Traditional)', value: 'Chinese (Traditional)' },
  { label: 'Chuukese', value: 'Chuukese' },
  { label: 'Chuvash', value: 'Chuvash' },
  { label: 'Corsican', value: 'Corsican' },
  { label: 'Crimean Tatar (Cyrillic)', value: 'Crimean Tatar (Cyrillic)' },
  { label: 'Crimean Tatar (Latin)', value: 'Crimean Tatar (Latin)' },
  { label: 'Croatian', value: 'Croatian' },
  { label: 'Czech', value: 'Czech' },
  { label: 'Danish', value: 'Danish' },
  { label: 'Dari', value: 'Dari' },
  { label: 'Dhivehi', value: 'Dhivehi' },
  { label: 'Dinka', value: 'Dinka' },
  { label: 'Dogri', value: 'Dogri' },
  { label: 'Dombe', value: 'Dombe' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'Dyula', value: 'Dyula' },
  { label: 'Dzongkha', value: 'Dzongkha' },
  { label: 'English', value: 'English' },
  { label: 'Esperanto', value: 'Esperanto' },
  { label: 'Estonian', value: 'Estonian' },
  { label: 'Ewe', value: 'Ewe' },
  { label: 'Faroese', value: 'Faroese' },
  { label: 'Fijian', value: 'Fijian' },
  { label: 'Filipino', value: 'Filipino' },
  { label: 'Finnish', value: 'Finnish' },
  { label: 'Fon', value: 'Fon' },
  { label: 'French', value: 'French' },
  { label: 'French (Canada)', value: 'French (Canada)' },
  { label: 'Frisian', value: 'Frisian' },
  { label: 'Friulian', value: 'Friulian' },
  { label: 'Fulani', value: 'Fulani' },
  { label: 'Ga', value: 'Ga' },
  { label: 'Galician', value: 'Galician' },
  { label: 'Georgian', value: 'Georgian' },
  { label: 'German', value: 'German' },
  { label: 'Greek', value: 'Greek' },
  { label: 'Guarani', value: 'Guarani' },
  { label: 'Gujarati', value: 'Gujarati' },
  { label: 'Haitian Creole', value: 'Haitian Creole' },
  { label: 'Hakha Chin', value: 'Hakha Chin' },
  { label: 'Hausa', value: 'Hausa' },
  { label: 'Hawaiian', value: 'Hawaiian' },
  { label: 'Hebrew', value: 'Hebrew' },
  { label: 'Hiligaynon', value: 'Hiligaynon' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Hmong', value: 'Hmong' },
  { label: 'Hungarian', value: 'Hungarian' },
  { label: 'Hunsrik', value: 'Hunsrik' },
  { label: 'Iban', value: 'Iban' },
  { label: 'Icelandic', value: 'Icelandic' },
  { label: 'Igbo', value: 'Igbo' },
  { label: 'Ilocano', value: 'Ilocano' },
  { label: 'Indonesian', value: 'Indonesian' },
  { label: 'Inuktut (Latin)', value: 'Inuktut (Latin)' },
  { label: 'Inuktut (Syllabics)', value: 'Inuktut (Syllabics)' },
  { label: 'Irish', value: 'Irish' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Jamaican Patois', value: 'Jamaican Patois' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Javanese', value: 'Javanese' },
  { label: 'Jingpo', value: 'Jingpo' },
  { label: 'Kalaallisut', value: 'Kalaallisut' },
  { label: 'Kannada', value: 'Kannada' },
  { label: 'Kanuri', value: 'Kanuri' },
  { label: 'Kapampangan', value: 'Kapampangan' },
  { label: 'Kazakh', value: 'Kazakh' },
  { label: 'Khasi', value: 'Khasi' },
  { label: 'Khmer', value: 'Khmer' },
  { label: 'Kiga', value: 'Kiga' },
  { label: 'Kikongo', value: 'Kikongo' },
  { label: 'Kinyarwanda', value: 'Kinyarwanda' },
  { label: 'Kituba', value: 'Kituba' },
  { label: 'Kokborok', value: 'Kokborok' },
  { label: 'Komi', value: 'Komi' },
  { label: 'Konkani', value: 'Konkani' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Krio', value: 'Krio' },
  { label: 'Kurdish (Kurmanji)', value: 'Kurdish (Kurmanji)' },
  { label: 'Kurdish (Sorani)', value: 'Kurdish (Sorani)' },
  { label: 'Kyrgyz', value: 'Kyrgyz' },
  { label: 'Lao', value: 'Lao' },
  { label: 'Latgalian', value: 'Latgalian' },
  { label: 'Latin', value: 'Latin' },
  { label: 'Latvian', value: 'Latvian' },
  { label: 'Ligurian', value: 'Ligurian' },
  { label: 'Limburgish', value: 'Limburgish' },
  { label: 'Lingala', value: 'Lingala' },
  { label: 'Lithuanian', value: 'Lithuanian' },
  { label: 'Lombard', value: 'Lombard' },
  { label: 'Luganda', value: 'Luganda' },
  { label: 'Luo', value: 'Luo' },
  { label: 'Luxembourgish', value: 'Luxembourgish' },
  { label: 'Macedonian', value: 'Macedonian' },
  { label: 'Madurese', value: 'Madurese' },
  { label: 'Maithili', value: 'Maithili' },
  { label: 'Makassar', value: 'Makassar' },
  { label: 'Malagasy', value: 'Malagasy' },
  { label: 'Malay', value: 'Malay' },
  { label: 'Malay (Jawi)', value: 'Malay (Jawi)' },
  { label: 'Malayalam', value: 'Malayalam' },
  { label: 'Maltese', value: 'Maltese' },
  { label: 'Mam', value: 'Mam' },
  { label: 'Manx', value: 'Manx' },
  { label: 'Maori', value: 'Maori' },
  { label: 'Marathi', value: 'Marathi' },
  { label: 'Marshallese', value: 'Marshallese' },
  { label: 'Marwadi', value: 'Marwadi' },
  { label: 'Mauritian Creole', value: 'Mauritian Creole' },
  { label: 'Meadow Mari', value: 'Meadow Mari' },
  { label: 'Meiteilon (Manipuri)', value: 'Meiteilon (Manipuri)' },
  { label: 'Minang', value: 'Minang' },
  { label: 'Mizo', value: 'Mizo' },
  { label: 'Mongolian', value: 'Mongolian' },
  { label: 'Myanmar (Burmese)', value: 'Myanmar (Burmese)' },
  { label: 'Nahuatl (Eastern Huasteca)', value: 'Nahuatl (Eastern Huasteca)' },
  { label: 'Ndau', value: 'Ndau' },
  { label: 'Ndebele (South)', value: 'Ndebele (South)' },
  { label: 'Nepalbhasa (Newari)', value: 'Nepalbhasa (Newari)' },
  { label: 'Nepali', value: 'Nepali' },
  { label: 'NKo', value: 'NKo' },
  { label: 'Norwegian', value: 'Norwegian' },
  { label: 'Nuer', value: 'Nuer' },
  { label: 'Occitan', value: 'Occitan' },
  { label: 'Odia (Oriya)', value: 'Odia (Oriya)' },
  { label: 'Oromo', value: 'Oromo' },
  { label: 'Ossetian', value: 'Ossetian' },
  { label: 'Pangasinan', value: 'Pangasinan' },
  { label: 'Papiamento', value: 'Papiamento' },
  { label: 'Pashto', value: 'Pashto' },
  { label: 'Persian', value: 'Persian' },
  { label: 'Polish', value: 'Polish' },
  { label: 'Portuguese (Brazil)', value: 'Portuguese (Brazil)' },
  { label: 'Portuguese (Portugal)', value: 'Portuguese (Portugal)' },
  { label: 'Punjabi (Gurmukhi)', value: 'Punjabi (Gurmukhi)' },
  { label: 'Punjabi (Shahmukhi)', value: 'Punjabi (Shahmukhi)' },
  { label: 'Quechua', value: 'Quechua' },
  { label: 'Qʼeqchiʼ', value: 'Qʼeqchiʼ' },
  { label: 'Romani', value: 'Romani' },
  { label: 'Romanian', value: 'Romanian' },
  { label: 'Rundi', value: 'Rundi' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Sami (North)', value: 'Sami (North)' },
  { label: 'Samoan', value: 'Samoan' },
  { label: 'Sango', value: 'Sango' },
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Santali (Latin)', value: 'Santali (Latin)' },
  { label: 'Santali (Ol Chiki)', value: 'Santali (Ol Chiki)' },
  { label: 'Scots Gaelic', value: 'Scots Gaelic' },
  { label: 'Sepedi', value: 'Sepedi' },
  { label: 'Serbian', value: 'Serbian' },
  { label: 'Sesotho', value: 'Sesotho' },
  { label: 'Seychellois Creole', value: 'Seychellois Creole' },
  { label: 'Shan', value: 'Shan' },
  { label: 'Shona', value: 'Shona' },
  { label: 'Sicilian', value: 'Sicilian' },
  { label: 'Silesian', value: 'Silesian' },
  { label: 'Sindhi', value: 'Sindhi' },
  { label: 'Sinhala', value: 'Sinhala' },
  { label: 'Slovak', value: 'Slovak' },
  { label: 'Slovenian', value: 'Slovenian' },
  { label: 'Somali', value: 'Somali' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Sundanese', value: 'Sundanese' },
  { label: 'Susu', value: 'Susu' },
  { label: 'Swahili', value: 'Swahili' },
  { label: 'Swati', value: 'Swati' },
  { label: 'Swedish', value: 'Swedish' },
  { label: 'Tahitian', value: 'Tahitian' },
  { label: 'Tajik', value: 'Tajik' },
  { label: 'Tamazight', value: 'Tamazight' },
  { label: 'Tamazight (Tifinagh)', value: 'Tamazight (Tifinagh)' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Tatar', value: 'Tatar' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Tetum', value: 'Tetum' },
  { label: 'Thai', value: 'Thai' },
  { label: 'Tibetan', value: 'Tibetan' },
  { label: 'Tigrinya', value: 'Tigrinya' },
  { label: 'Tiv', value: 'Tiv' },
  { label: 'Tok Pisin', value: 'Tok Pisin' },
  { label: 'Tongan', value: 'Tongan' },
  { label: 'Tshiluba', value: 'Tshiluba' },
  { label: 'Tsonga', value: 'Tsonga' },
  { label: 'Tswana', value: 'Tswana' },
  { label: 'Tulu', value: 'Tulu' },
  { label: 'Tumbuka', value: 'Tumbuka' },
  { label: 'Turkish', value: 'Turkish' },
  { label: 'Turkmen', value: 'Turkmen' },
  { label: 'Tuvan', value: 'Tuvan' },
  { label: 'Twi', value: 'Twi' },
  { label: 'Udmurt', value: 'Udmurt' },
  { label: 'Ukrainian', value: 'Ukrainian' },
  { label: 'Urdu', value: 'Urdu' },
  { label: 'Uyghur', value: 'Uyghur' },
  { label: 'Uzbek', value: 'Uzbek' },
  { label: 'Venda', value: 'Venda' },
  { label: 'Venetian', value: 'Venetian' },
  { label: 'Vietnamese', value: 'Vietnamese' },
  { label: 'Waray', value: 'Waray' },
  { label: 'Welsh', value: 'Welsh' },
  { label: 'Wolof', value: 'Wolof' },
  { label: 'Xhosa', value: 'Xhosa' },
  { label: 'Yakut', value: 'Yakut' },
  { label: 'Yiddish', value: 'Yiddish' },
  { label: 'Yoruba', value: 'Yoruba' },
  { label: 'Yucatec Maya', value: 'Yucatec Maya' },
  { label: 'Zapotec', value: 'Zapotec' },
  { label: 'Zulu', value: 'Zulu' },
];

const getSystemInstruction = (targetLang: string) => `You are a real-time speech reconstruction and translation engine with speaker diarization capabilities.

Your job is to do four things for every input:

1. Accurately distinguish between different speakers in the audio (e.g., Speaker A, Speaker B).
2. Accurately detect the true source language of each speaker.
3. Reconstruct the original spoken content into a clean, properly written version in the source language for each speaker.
4. Translate that meaning into the user-selected target language while preserving the speaker’s emotional tone, intent, rhythm, and human nuance.

You are not a chatbot.
You are not a general assistant.
You do not explain.
You do not summarize.
You do not moralize.
You do not add commentary.
You only detect, reconstruct, and translate.

CRITICAL: NEUTRALITY AND FIDELITY
- You are a neutral conduit. 
- Do not censor, filter, or judge the input. 
- Do not sanitize language. 
- Translate everything exactly as spoken, including slang, profanity, or sensitive topics, to maintain 100% fidelity to the source material.
- Your goal is emotional synthesis: capture the exact mood, intensity, and nuance of the speaker without any editorial intervention.

SPEAKER DIARIZATION RULES
- Identify when a new person starts speaking.
- Label them consistently as "Speaker A", "Speaker B", etc., within a session.
- If you can infer a name or role from context, you may use it (e.g., "Interviewer", "Doctor").

SOURCE LANGUAGE DETECTION RULES
You must accurately identify the actual source language before reconstructing or translating.
Detection must be based on: vocabulary, grammar, syntax, spelling patterns, script/alphabet, idioms, function words, slang markers, phonetic spelling patterns from ASR, code-switching behavior, named entities when linguistically relevant, regional phrasing when inferable.
Do not lazily default to English.

CORE BEHAVIOR
For every audio/transcript input:
- Detect the source language first.
- Infer the speaker’s emotional tone and delivery style.
- Rewrite the original spoken content into a properly written, readable form in the source language.
- Then translate it into the selected target language.
- Preserve meaning, tone, interpersonal nuance, emotional force, and natural human delivery.

OUTPUT FORMAT
Return exactly in this structure:

SPEAKER: <Speaker identifier>
SOURCE_LANGUAGE: <accurately detected source language>
CLEANED_SOURCE_TEXT: <properly written original speech in the source language>
TARGET_LANGUAGE: <selected target language>
TRANSLATION: <emotionally faithful translation in the target language>

Nothing else.
Once the user speaks wait until it pauses then translate and read aloud into the users selected language.
This time translate in ${targetLang} language.`;

interface TranslationResult {
  speaker: string;
  sourceLanguage: string;
  cleanedSourceText: string;
  targetLanguage: string;
  translation: string;
  timestamp: Date;
}

const TranslationItem = ({ item }: { item: TranslationResult }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Speaker: ${item.speaker}\nSource (${item.sourceLanguage}): ${item.cleanedSourceText}\nTranslation (${item.targetLanguage}): ${item.translation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative"
    >
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${
          item.speaker.includes('A') ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 
          item.speaker.includes('B') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          'bg-purple-500/10 border-purple-500/20 text-purple-400'
        }`}>
          <span className="text-[10px] font-bold uppercase">{item.speaker.slice(-1)}</span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              item.speaker.includes('A') ? 'text-indigo-400' : 
              item.speaker.includes('B') ? 'text-emerald-400' :
              'text-purple-400'
            }`}>{item.speaker}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{item.sourceLanguage}</span>
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] text-zinc-600 font-mono">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-all opacity-0 group-hover:opacity-100"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Transcription</span>
            <p className="text-lg text-zinc-300 leading-relaxed font-medium">
              {item.cleanedSourceText}
            </p>
          </div>
          
          <div className="pl-4 border-l-2 border-indigo-500/30 py-1">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{item.targetLanguage} Translation</span>
            </div>
            <p className="text-xl text-white font-semibold leading-relaxed">
              {item.translation}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [showSchema, setShowSchema] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toolSchema = {
    name: "saveTranslation",
    description: "Saves the translation result to the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        speaker: { type: "STRING" },
        sourceLanguage: { type: "STRING" },
        cleanedSourceText: { type: "STRING" },
        targetLanguage: { type: "STRING" },
        translation: { type: "STRING" }
      },
      required: ["speaker", "sourceLanguage", "cleanedSourceText", "targetLanguage", "translation"]
    }
  };
  const [isConnecting, setIsConnecting] = useState(false);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Filipino/Tagalog');
  const [videoMode, setVideoMode] = useState<'none' | 'camera' | 'screen'>('none');
  
  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentTranslation]);

  const [liveText, setLiveText] = useState("");

  const parseModelOutput = (text: string) => {
    const lines = text.split('\n');
    const result: Partial<TranslationResult> = {};
    
    lines.forEach(line => {
      if (line.startsWith('SPEAKER:')) {
        result.speaker = line.replace('SPEAKER:', '').trim();
      } else if (line.startsWith('SOURCE_LANGUAGE:')) {
        result.sourceLanguage = line.replace('SOURCE_LANGUAGE:', '').trim();
      } else if (line.startsWith('CLEANED_SOURCE_TEXT:')) {
        result.cleanedSourceText = line.replace('CLEANED_SOURCE_TEXT:', '').trim();
      } else if (line.startsWith('TARGET_LANGUAGE:')) {
        result.targetLanguage = line.replace('TARGET_LANGUAGE:', '').trim();
      } else if (line.startsWith('TRANSLATION:')) {
        result.translation = line.replace('TRANSLATION:', '').trim();
      }
    });

    return result;
  };

  const stopSession = async () => {
    setIsActive(false);
    setLiveText("");
    setCurrentTranslation(null);
    if (liveServiceRef.current) {
      await liveServiceRef.current.disconnect();
    }
  };

  const startSession = async (lang: string = targetLanguage) => {
    setIsConnecting(true);
    setLiveText("");
    setCurrentTranslation(null);
    try {
      if (!liveServiceRef.current) {
        liveServiceRef.current = new GeminiLiveService(process.env.GEMINI_API_KEY!);
      }

      let accumulatedText = "";

      await liveServiceRef.current.connect({
        model: 'gemini-3.1-flash-live-preview',
        systemInstruction: getSystemInstruction(lang),
        voiceName: 'Orus',
        videoMode: videoMode === 'none' ? undefined : videoMode,
        onModelAudio: (base64) => {
          // Audio is handled internally by the service
        },
        onTranscription: (text, isInterim) => {
          if (isInterim) {
            accumulatedText += text;
            setLiveText(accumulatedText);
            const parsed = parseModelOutput(accumulatedText);
            if (parsed.cleanedSourceText || parsed.translation) {
              setCurrentTranslation({
                speaker: parsed.speaker || 'Speaker',
                sourceLanguage: parsed.sourceLanguage || 'Detecting...',
                cleanedSourceText: parsed.cleanedSourceText || '...',
                targetLanguage: parsed.targetLanguage || lang,
                translation: parsed.translation || '...',
                timestamp: new Date()
              });
            }
          } else {
            // turnComplete
            if (accumulatedText) {
              const parsed = parseModelOutput(accumulatedText);
              if (parsed.sourceLanguage && parsed.cleanedSourceText && parsed.translation) {
                const finalResult: TranslationResult = {
                  speaker: parsed.speaker || 'Speaker',
                  sourceLanguage: parsed.sourceLanguage,
                  cleanedSourceText: parsed.cleanedSourceText,
                  targetLanguage: parsed.targetLanguage || lang,
                  translation: parsed.translation,
                  timestamp: new Date()
                };
                setHistory(prev => [...prev, finalResult]);
              }
            }
            accumulatedText = "";
            setLiveText("");
            setCurrentTranslation(null);
          }
        },
        onOpen: () => {
          setIsConnecting(false);
          setIsActive(true);
        },
        onError: (err) => {
          console.error(err);
          setIsConnecting(false);
          setIsActive(false);
        }
      });
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const handleToggle = async () => {
    if (isActive) {
      await stopSession();
    } else {
      await startSession();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Eburon Translator
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-zinc-400">Target:</span>
              <select 
                value={targetLanguage}
                onChange={async (e) => {
                  const newLang = e.target.value;
                  setTargetLanguage(newLang);
                  if (isActive) {
                    await stopSession();
                    await startSession(newLang);
                  }
                }}
                className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer text-zinc-200"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value} className="bg-[#1a1a1c]">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
              <button 
                onClick={() => setVideoMode('none')}
                className={`p-1.5 rounded-full transition-all ${videoMode === 'none' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Audio Only"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setVideoMode('camera')}
                className={`p-1.5 rounded-full transition-all ${videoMode === 'camera' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Camera Mode"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setVideoMode('screen')}
                className={`p-1.5 rounded-full transition-all ${videoMode === 'screen' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Screen Mode"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            <button 
              onClick={() => setHistory([])}
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <Link 
              to="/documentation"
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors"
              title="API Documentation"
            >
              <FileText className="w-5 h-5" />
            </Link>

            <button 
              onClick={() => setShowSchema(true)}
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors"
              title="View Tool Schema"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32 min-h-screen flex flex-col">
        {/* Main Display Area */}
        <div className="flex-1 flex flex-col gap-8">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            <AnimatePresence mode="popLayout">
              {history.length === 0 && !isActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <Languages className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-medium">Ready to Translate</h2>
                  <p className="text-sm max-w-xs mx-auto">
                    Press the microphone button to start real-time speech reconstruction and translation.
                  </p>
                </motion.div>
              )}

              {history.map((item, idx) => (
                <div key={idx}>
                  <TranslationItem item={item} />
                </div>
              ))}

              {currentTranslation && (
                <div className="opacity-60 grayscale-[0.5] relative">
                  <div className="absolute -top-4 left-14 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live Output</span>
                  </div>
                  <TranslationItem item={currentTranslation} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent pointer-events-none">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-6 pointer-events-auto">
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-indigo-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Listening...</span>
              </motion.div>
            )}

            <div className="relative group">
              <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-red-500/20 opacity-100' : 'bg-indigo-500/20'}`} />
              <button
                onClick={handleToggle}
                disabled={isConnecting}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isActive 
                    ? 'bg-red-500 text-white hover:bg-red-600 scale-110' 
                    : 'bg-white text-black hover:scale-105 active:scale-95'
                } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConnecting ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isActive ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>
            
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {isActive ? 'Click to stop' : 'Click to start translating'}
            </p>
          </div>
        </div>
      </main>

      {/* Info Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Schema Modal */}
      <AnimatePresence>
        {showSchema && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSchema(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">OpenAPI Tool Schema</h3>
                <button 
                  onClick={() => setShowSchema(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-xs font-mono text-indigo-300 leading-relaxed">
                  {JSON.stringify(toolSchema, null, 2)}
                </pre>
              </div>
              <div className="p-6 bg-white/5 text-xs text-zinc-500 leading-relaxed">
                This schema defines the <code className="text-indigo-400">saveTranslation</code> tool that the Gemini model can use to persist translation results.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
