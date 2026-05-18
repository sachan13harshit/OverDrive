import { DriveCitation, RagEventInput } from "../types/rag.types.js";
import { driveRetrieveTool } from "./driveRetrieval.service.js";
import { generateRagAnswer } from "./answerGeneration.service.js";

const NO_RESULTS_ANSWER = "I couldn't find anything about that in your Drive documents.";

export async function runRagQuery(args: {
  taskId: string;
  userId: string;
  inputPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  appendEvent: (event: RagEventInput) => Promise<void>;
}): Promise<{ finalAnswerMarkdown: string; citations: DriveCitation[] }> {
  const { taskId, userId, inputPrompt, history, appendEvent } = args;

  await appendEvent({
    taskId,
    type: "retrieving",
    timestamp: Date.now(),
    title: "Searching your Drive...",
  });

  const results = await driveRetrieveTool({ query: inputPrompt, userId });

  if (results.citations.length === 0) {
    return { finalAnswerMarkdown: NO_RESULTS_ANSWER, citations: [] };
  }

  await appendEvent({
    taskId,
    type: "generating",
    timestamp: Date.now(),
    title: "Writing answer...",
  });

  const finalAnswerMarkdown = await generateRagAnswer({
    query: inputPrompt,
    context: results.formattedSnippet,
    history,
  });

  return { finalAnswerMarkdown, citations: results.citations };
}
