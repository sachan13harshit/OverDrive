import { prisma } from "../lib/prisma.js";

export function listChatMessagesForChat(chatId: string, limit: number = 50) {
  return prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { sequence: "asc" },
    take: limit,
  });
}

export function listAllChatMessagesForChat(chatId: string) {
  return prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { sequence: "asc" },
  });
}

async function nextSequenceFor(chatId: string): Promise<number> {
  const maxSeqResult = await prisma.chatMessage.aggregate({
    where: { chatId },
    _max: { sequence: true },
  });
  return (maxSeqResult._max.sequence ?? 0) + 1;
}

export async function createUserMessage(chatId: string, userId: string, content: string) {
  const sequence = await nextSequenceFor(chatId);
  return prisma.chatMessage.create({
    data: { chatId, userId, role: "user", content, sequence },
  });
}

export async function createAssistantMessage(chatId: string, userId: string, content: string, ragTaskId: string) {
  const sequence = await nextSequenceFor(chatId);
  return prisma.chatMessage.create({
    data: { chatId, userId, role: "assistant", content, sequence, ragTaskId },
  });
}
