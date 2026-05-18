import { prisma } from "../lib/prisma.js";
import { runRagQuery } from "./ragQuery.service.js";
import { appendRagEvent } from "./ragEvents.service.js";
import { RagEventInput } from "../types/rag.types.js";
import { markRagTaskRunning, failRagTask } from "../models/ragTask.model.js";
import { listAllChatMessagesForChat } from "../models/chatMessage.model.js";

export async function runRagTask(taskId: string) {
  try {
    const task = await markRagTaskRunning(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const historyRows = await listAllChatMessagesForChat(task.chatId);

    const lastUserMsg = historyRows[historyRows.length - 1];
    const previousHistoryRows = historyRows.slice(0, -1);

    const history: Array<{ role: "user" | "assistant"; content: string }> = previousHistoryRows.map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
    }));

    const userMessageContent = lastUserMsg?.content || task.inputPrompt || "";

    const emit = async (event: Omit<RagEventInput, "taskId" | "timestamp">) => {
      await appendRagEvent(taskId, { taskId, timestamp: Date.now(), ...event });
    };

    console.log(`[RagTask:${taskId}] STARTED. Prompt: "${userMessageContent}"`);

    await emit({ type: "start", title: "Processing your question..." });

    const { finalAnswerMarkdown, citations } = await runRagQuery({
      taskId,
      userId: task.userId,
      inputPrompt: userMessageContent,
      history,
      appendEvent: async (ev) => { await appendRagEvent(taskId, ev); },
    });

    console.log(`[RagTask:${taskId}] Done. Citations found: ${citations.length}`);

    const usedChunkIds = Array.from(new Set(citations.map((c) => c.chunkId)));

    await emit({ type: "finish", finalAnswerMarkdown, citations });

    await prisma.$transaction(async (tx) => {
      const maxSeqResult = await tx.chatMessage.aggregate({
        where: { chatId: task.chatId },
        _max: { sequence: true },
      });

      const nextSequence = (maxSeqResult._max.sequence ?? 0) + 1;

      await tx.chatMessage.create({
        data: {
          chatId: task.chatId,
          userId: task.userId,
          role: "assistant",
          content: finalAnswerMarkdown,
          sequence: nextSequence,
          ragTaskId: taskId,
        },
      });

      await tx.ragTask.update({
        where: { id: taskId },
        data: {
          status: "completed",
          finalAnswerMarkdown,
          usedChunkIds,
          resultJson: { citations },
          completedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error("RAG Task Execution Failed:", error);

    await failRagTask(taskId, "I encountered an internal error while processing your request.");

    await appendRagEvent(taskId, {
      taskId,
      type: "finish",
      timestamp: Date.now(),
      finalAnswerMarkdown: "Internal error occurred.",
    }).catch(console.error);
  }
}
