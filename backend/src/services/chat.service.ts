import { prisma } from "../lib/prisma.js";
import { createChatRoom, findChatRoomById } from "../models/chatRoom.model.js";
import { listChatMessagesForChat } from "../models/chatMessage.model.js";

export async function createChat(userId: string, title?: string) {
  return createChatRoom(userId, title);
}

export async function getChatWithMessages(chatId: string, limit: number = 50) {
  const chat = await findChatRoomById(chatId);
  if (!chat) throw new Error("Chat not found");

  const messages = await listChatMessagesForChat(chatId, limit);

  const taskIds = messages.map((m) => m.ragTaskId).filter(Boolean) as string[];
  const tasks: Record<string, any> = {};
  if (taskIds.length > 0) {
    const taskRows = await prisma.ragTask.findMany({ where: { chatId } });
    taskRows.forEach((t) => {
      tasks[t.id] = t;
    });
  }

  return { chat, messages, tasks };
}

export async function appendUserMessageWithTask(chatId: string, userId: string, content: string) {
  return prisma.$transaction(async (tx) => {
    const maxSeqResult = await tx.chatMessage.aggregate({
      where: { chatId },
      _max: { sequence: true },
    });

    const nextSequence = (maxSeqResult._max.sequence ?? 0) + 1;

    const message = await tx.chatMessage.create({
      data: { chatId, userId, role: "user", content, sequence: nextSequence },
    });

    const task = await tx.ragTask.create({
      data: {
        userId,
        chatId,
        chatMessageId: message.id,
        inputPrompt: content,
        status: "pending",
      },
    });

    return { messageId: message.id, taskId: task.id };
  });
}
