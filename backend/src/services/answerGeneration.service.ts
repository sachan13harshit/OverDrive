import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-typing" });

const RAG_SYSTEM_PROMPT = `You are a helpful assistant answering questions using the user's Google Drive documents.
Answer ONLY using the context provided below. Cite file names naturally in your answer where relevant.
If the context does not contain enough information to answer the question, say so plainly instead of guessing.`;

export async function generateRagAnswer(params: {
  query: string;
  context: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "This is a dummy AI response for local testing.";
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: RAG_SYSTEM_PROMPT },
    ...params.history,
    { role: "user", content: `Context from Drive:\n${params.context}\n\nQuestion: ${params.query}` },
  ];

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("OpenAI API request timed out after 30 seconds")), 30000)
  );

  const completionPromise = openai.chat.completions.create({
    model: process.env.PLANNING_MODEL || "gpt-4o-mini",
    messages,
  });

  const completion = await Promise.race([completionPromise, timeoutPromise]);
  return (completion as any).choices[0]?.message?.content || "I couldn't generate an answer.";
}
