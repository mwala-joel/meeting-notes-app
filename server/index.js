import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const upload = multer();

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:4200', process.env.FRONTEND_URL].filter(Boolean),
  }),
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/transcribe-meeting', upload.single('audio'), async (req, res) => {
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const audioFile = req.file;

  const elevenLabsBody = new FormData();

  const audioBlob = new Blob([audioFile.buffer], {
    type: audioFile.mimetype,
  });

  elevenLabsBody.append('file', audioBlob, 'recording.webm');
  elevenLabsBody.append('model_id', 'scribe_v2');

  const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': elevenLabsApiKey,
    },
    body: elevenLabsBody,
  });

  const elevenLabsData = await elevenLabsResponse.json();
  const transcript = elevenLabsData.text;

  const prompt = `
You are helping create clean notes from a small meeting transcript.

Transcript:
${transcript}

Return the response in this exact format:

TITLE: short meeting title

NOTES:
- main point one
- main point two
- action item if any
`;

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const geminiData = await geminiResponse.json();

  const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const title = getTitleFromGeminiText(geminiText);
  const notes = getNotesFromGeminiText(geminiText);

  res.json({
    title,
    notes,
    transcript,
  });
});

function getTitleFromGeminiText(text) {
  const titleLine = text.split('\n').find((line) => line.startsWith('TITLE:'));

  return titleLine?.replace('TITLE:', '').trim() || 'Untitled Meeting';
}

function getNotesFromGeminiText(text) {
  const notesIndex = text.indexOf('NOTES:');

  if (notesIndex === -1) {
    return text;
  }

  return text.slice(notesIndex).replace('NOTES:', '').trim();
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
