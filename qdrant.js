import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import dotenv from 'dotenv';
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "personal_data";

export const qdrantClient = new QdrantClient({ url: QDRANT_URL });

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY // or use Ollama embedding endpoint
});

export async function upsertDocuments(docs) {
  // Each doc: { text: "...", type: "achievement"|"about" }
  const points = [];
  for (const doc of docs) {
    const vector = await embeddings.embedQuery(doc.text);
    points.push({
      id: Math.floor(Math.random() * 1e9),
      vector,
      payload: doc
    });
  }
  await qdrantClient.upsert(COLLECTION_NAME, { points });
}

export async function queryDocuments(query, limit=3) {
  const vector = await embeddings.embedQuery(query);
  const search = await qdrantClient.search(COLLECTION_NAME, {
    vector,
    limit
  });
  return search;
}