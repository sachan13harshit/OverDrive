import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-typing" });

export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[getEmbedding] No OPENAI_API_KEY — returning zero vector.");
    return new Array(1536).fill(0);
  }
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0]!.embedding;
}

export async function getBatchEmbeddings(texts: string[]): Promise<(number[] | undefined)[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return texts.map((_, i) => response.data[i]?.embedding);
}
