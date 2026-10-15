import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PERSONA_PROMPTS: Record<string, string> = {
  nova: `Eres el Asistente DarismirAI, un asistente personal de voz muy cariñoso, claro, inteligente y paciente para personas de cualquier edad (incluyendo adultos mayores y personas que no entienden de tecnología).
REGLA PRINCIPAL: Habla con calidez, sencillez extrema y ve directo al grano. Preséntate como Asistente DarismirAI si te preguntan tu nombre. Nunca uses palabras técnicas ni explicaciones largas.
Tus respuestas van a ser LEÍDAS EN VOZ ALTA por el teléfono, así que escribe frases fluidas, cortas y agradables al oído.
Si el usuario adjunta una foto, video, audio o documento, analízalo con detalle y explícale con sencillez lo que ves o escuchas.
Si el usuario te pide recordar algo (como tomar medicina o una cita), guárdalo de inmediato con amabilidad.`,

  darismir: `Eres el Asistente DarismirAI, un asistente personal de inteligencia artificial de última generación. Cálido, veloz, sumamente útil y claro en tus explicaciones verbales.`,

  atlas: `Eres Atlas de DarismirAI, un asistente conciso, paciente y ultra directo. Explicaciones claras en 1 o 2 frases sin rodeos. Analiza imágenes, videos y documentos con precisión ejecutiva.`,

  aura: `Eres Aura de DarismirAI, una acompañante amable, tranquila y motivadora. Hablas con serenidad, cariño y paciencia.`,

  spark: `Eres Spark de DarismirAI, un asistente alegre y cordial que ayuda con entusiasmo y palabras sencillas.`
};

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', assistant: 'Asistente DarismirAI' });
});

// Assistant Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, persona = 'nova', image, attachment, userLocation } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'No se encontró GEMINI_API_KEY en las variables de entorno.',
      });
    }

    const systemInstruction = `${PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.nova}
Información de contexto:
- Fecha y hora actual del dispositivo: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' })}
${userLocation ? `- Ubicación aproximada: ${userLocation}` : ''}

REGLAS DE FORMATO Y ACCIONES DE SMARTPHONE:
1. Si el usuario te pide recordar algo ("recuérdame comprar leche a las 6pm", "avísame mañana a las 9"), incluye al final de tu respuesta un bloque JSON con la etiqueta [ACTION:REMINDER] con este formato:
[ACTION:REMINDER]{"title": "Comprar leche", "time": "18:00", "date": "hoy", "priority": "normal"}[/ACTION:REMINDER]

2. Si el usuario te pide guardar una nota o apuntar algo ("anota esta idea...", "guarda la nota..."), incluye al final:
[ACTION:NOTE]{"title": "Título sugerido", "content": "Detalle de la nota", "category": "General|Trabajo|Personal"}[/ACTION:NOTE]

3. Si el usuario te pide programar un temporizador o alarma:
[ACTION:TIMER]{"minutes": 15, "label": "Cocinar pasta"}[/ACTION:TIMER]

4. Ofrece siempre 2 o 3 sugerencias de seguimiento rápidas para que el usuario pueda pulsar con un toque en su pantalla, usando:
[QUICK_REPLIES]["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"][/QUICK_REPLIES]
`;

    // Format chat history for Gemini
    const contents: any[] = [];

    if (Array.isArray(messages)) {
      for (const m of messages) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        const parts: any[] = [{ text: m.content || 'Por favor analiza este contenido.' }];

        const attach = m.attachment || m.image;
        if (attach && attach.data) {
          parts.unshift({
            inlineData: {
              mimeType: attach.mimeType || 'image/jpeg',
              data: attach.data,
            },
          });
        }
        contents.push({ role, parts });
      }
    }

    // Direct attachment on request
    const directAttach = attachment || image;
    if (directAttach && directAttach.data && contents.length > 0) {
      const lastMsg = contents[contents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts.unshift({
          inlineData: {
            mimeType: directAttach.mimeType || 'image/jpeg',
            data: directAttach.data,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const fullText = response.text || '';

    // Extract structured actions
    const actions: any[] = [];
    let cleanReply = fullText;

    // Check for reminder action
    const reminderMatch = cleanReply.match(/\[ACTION:REMINDER\]([\s\S]*?)\[\/ACTION:REMINDER\]/);
    if (reminderMatch) {
      try {
        const parsed = JSON.parse(reminderMatch[1]);
        actions.push({ type: 'reminder', data: parsed });
        cleanReply = cleanReply.replace(reminderMatch[0], '').trim();
      } catch (e) {
        console.warn('Failed parsing reminder JSON:', e);
      }
    }

    // Check for note action
    const noteMatch = cleanReply.match(/\[ACTION:NOTE\]([\s\S]*?)\[\/ACTION:NOTE\]/);
    if (noteMatch) {
      try {
        const parsed = JSON.parse(noteMatch[1]);
        actions.push({ type: 'note', data: parsed });
        cleanReply = cleanReply.replace(noteMatch[0], '').trim();
      } catch (e) {
        console.warn('Failed parsing note JSON:', e);
      }
    }

    // Check for timer action
    const timerMatch = cleanReply.match(/\[ACTION:TIMER\]([\s\S]*?)\[\/ACTION:TIMER\]/);
    if (timerMatch) {
      try {
        const parsed = JSON.parse(timerMatch[1]);
        actions.push({ type: 'timer', data: parsed });
        cleanReply = cleanReply.replace(timerMatch[0], '').trim();
      } catch (e) {
        console.warn('Failed parsing timer JSON:', e);
      }
    }

    // Check for quick replies
    let quickReplies: string[] = [];
    const qrMatch = cleanReply.match(/\[QUICK_REPLIES\]([\s\S]*?)\[\/QUICK_REPLIES\]/);
    if (qrMatch) {
      try {
        quickReplies = JSON.parse(qrMatch[1]);
        cleanReply = cleanReply.replace(qrMatch[0], '').trim();
      } catch (e) {
        console.warn('Failed parsing quick replies JSON:', e);
      }
    }

    res.json({
      reply: cleanReply,
      actions,
      quickReplies,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'Error al comunicarse con Nova AI',
    });
  }
});

// Text-to-Speech Endpoint using Gemini 3.8 Flash Lite TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'No GEMINI_API_KEY configured' });
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .slice(0, 800); // Limit length per TTS chunk for optimal latency

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, natural, helpful mobile assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.status(500).json({ error: 'No audio returned by TTS model' });
    }
  } catch (error: any) {
    console.warn('TTS model fallback needed:', error?.message);
    res.status(500).json({
      error: error?.message || 'TTS generation failed',
      fallback: true,
    });
  }
});

// Audio Transcription Endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioData,
            },
          },
          {
            text: 'Transcribe this voice audio accurately in Spanish. Return only the transcribed text.',
          },
        ],
      },
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error?.message || 'Error en transcripción' });
  }
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nova AI Mobile Server running on http://0.0.0.0:${PORT}`);
});
