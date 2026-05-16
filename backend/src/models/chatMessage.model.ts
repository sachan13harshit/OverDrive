import { prisma } from "../lib/prisma.js";

export function listChatMessagesForChat(chatId: string, limit: number = 50) {
  return prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { sequence: "asc" },
    take: limit,
  });
}

export async function createUserMessage(chatId: string, userId: string, content: string) {
  const maxSeqResult = await prisma.chatMessage.aggregate({
    where: { chatId },
    _max: { sequence: true },
  });

  const nextSequence = (maxSeqResult._max.sequence ?? 0) + 1;

  return prisma.chatMessage.create({
    data: { chatId, userId, role: "user", content, sequence: nextSequence },
  });
}
