// lib/embedding.ts
import fetch from "node-fetch";

export async function getEmbedding(apiKey: string, text: string): Promise<number[]> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text }] },
      }),
    }
  );

  const data:any = await response.json();

  if (data.error) {
    console.error("Embedding API Error:", data.error);
    throw new Error(data.error.message || "Embedding API Error");
  }

  return data.embedding?.values || [];
}
