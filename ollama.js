import fetch from 'node-fetch';

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = "llama3"; // You can use any installed model

export async function chatWithOllama(prompt) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false
    }),
  });
  const data = await response.json();
  return data.response || "Sorry, I have no answer.";
}