import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { qdrantClient, upsertDocuments, queryDocuments } from './qdrant.js';
import { chatWithOllama } from './ollama.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ---- Load achievements and about-me for the frontend ----
let aboutMe = "Hi, I'm Rohan!";
let achievements = [];

try {
  const data = JSON.parse(fs.readFileSync('./data/initial_data.json', 'utf8'));
  aboutMe = data.aboutMe;
  achievements = data.achievements;
} catch (e) {
  // Fallback if file missing
}

// ---- Serve Achievements and About Info ----
app.get('/api/about', (req, res) => {
  res.json({ aboutMe });
});
app.get('/api/achievements', (req, res) => {
  res.json({ achievements });
});

// ---- Chat Endpoint ----
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  // Retrieve relevant info from Qdrant
  const context = await queryDocuments(message);

  // Construct prompt for LLM
  const prompt = `
You are Rohan, a helpful assistant who knows all about Rohan's achievements and interests.

Context:
${context.map(c => c.payload.text).join('\n')}

User: ${message}
Rohan:
  `.trim();

  // Call Ollama LLM
  const reply = await chatWithOllama(prompt);

  res.json({ reply });
});

// ---- Add new data to Qdrant ----
app.post('/api/add', async (req, res) => {
  const { text, type } = req.body;
  await upsertDocuments([{ text, type }]);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});