import { prisma } from "../lib/prisma.js";

export function createChatRoom(userId: string, title?: string) {
  return prisma.chatRoom.create({
    data: { userId, title: title?.substring(0, 80) || null },
  });
}

export function findChatRoomById(id: string) {
  return prisma.chatRoom.findUnique({ where: { id } });
}

export function listChatRoomsForUser(userId: string) {
  return prisma.chatRoom.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateChatRoomTitle(id: string, userId: string, title: string) {
  await prisma.chatRoom.updateMany({
    where: { id, userId },
    data: { title: title.substring(0, 80) },
  });
  return prisma.chatRoom.findUnique({ where: { id } });
}
