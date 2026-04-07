import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Eburon Translator API",
      version: "1.0.0",
      description: "API for real-time speech reconstruction and translation.",
      contact: {
        name: "Eburon Support",
        email: "support@eburon.ai"
      }
    },
    servers: [
      {
        url: "/api",
        description: "Local API server"
      }
    ],
    paths: {
      "/translate": {
        post: {
          summary: "Translate text or audio",
          description: "Translates text or audio from one language to another using Gemini.",
          operationId: "translateText",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TranslationRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful translation",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TranslationResponse"
                  }
                }
              }
            },
            "400": {
              description: "Invalid request parameters"
            },
            "500": {
              description: "Internal server error"
            }
          }
        }
      },
      "/health": {
        get: {
          summary: "Health check",
          description: "Returns the status of the API service.",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      service: { type: "string", example: "Eburon Translator API" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        TranslationRequest: {
          type: "object",
          required: ["text", "targetLanguage"],
          properties: {
            text: {
              type: "string",
              description: "The source text to be translated (optional if audioInput is provided).",
              example: "Hello, how are you today?"
            },
            audioInput: {
              type: "string",
              format: "byte",
              description: "Base64 encoded audio data to be transcribed and translated.",
              example: "UklGRi..."
            },
            targetLanguage: {
              type: "string",
              description: "The language to translate into.",
              example: "Filipino/Tagalog"
            },
            speaker: {
              type: "string",
              description: "Optional speaker identifier for diarization context.",
              example: "Speaker A"
            }
          }
        },
        TranslationResponse: {
          type: "object",
          properties: {
            sourceLanguage: {
              type: "string",
              description: "The detected source language.",
              example: "English"
            },
            cleanedSourceText: {
              type: "string",
              description: "The reconstructed source text.",
              example: "Hello, how are you today?"
            },
            targetLanguage: {
              type: "string",
              description: "The target language.",
              example: "Filipino/Tagalog"
            },
            translation: {
              type: "string",
              description: "The translated text.",
              example: "Kumusta, paano ka ngayon?"
            },
            audioOutput: {
              type: "string",
              format: "byte",
              description: "Base64 encoded audio data of the translated text.",
              example: "UklGRi..."
            },
            speaker: {
              type: "string",
              description: "The speaker identifier.",
              example: "Speaker A"
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "The time the translation was generated."
            }
          }
        }
      }
    }
  };

  app.get("/api-docs/openapi.json", (req, res) => {
    console.log(`[API] Serving OpenAPI spec to ${req.headers["host"]}`);
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["host"];
    const fullUrl = `${protocol}://${host}/api`;
    
    const dynamicSpec = {
      ...openApiSpec,
      servers: [
        {
          url: fullUrl,
          description: "Current environment API server"
        },
        {
          url: "/api",
          description: "Relative path (Local)"
        }
      ]
    };
    res.json(dynamicSpec);
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Eburon Translator API" });
  });

  /**
   * @openapi
   * /api/translate:
   *   post:
   *     summary: Translate text or audio
   *     description: Translates text or audio from one language to another using Gemini.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               text:
   *                 type: string
   *                 description: The text to translate.
   *               audioInput:
   *                 type: string
   *                 format: byte
   *                 description: Base64 encoded audio data.
   *               targetLanguage:
   *                 type: string
   *                 description: The language to translate into.
   *     responses:
   *       200:
   *         description: Successful translation
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sourceLanguage:
   *                   type: string
   *                 cleanedSourceText:
   *                   type: string
   *                 targetLanguage:
   *                   type: string
   *                 translation:
   *                   type: string
   *                 audioOutput:
   *                   type: string
   *                   format: byte
   *                   description: Base64 encoded audio playback.
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  app.post("/api/translate", (req, res) => {
    const { text, audioInput, targetLanguage } = req.body;
    
    // In a real app, you'd use Gemini here to transcribe audioInput if provided
    // and generate audioOutput for the translation.
    
    const sourceText = audioInput ? "[Transcribed from audio]" : text;

    res.json({
      sourceLanguage: "Detected",
      cleanedSourceText: sourceText,
      targetLanguage,
      translation: `[Translated to ${targetLanguage}]: ${sourceText}`,
      audioOutput: "UklGRi...", // Mock base64 audio
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
