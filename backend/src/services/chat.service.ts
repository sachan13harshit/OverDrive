import { createChatRoom, findChatRoomById } from "../models/chatRoom.model.js";
import { listChatMessagesForChat, createUserMessage } from "../models/chatMessage.model.js";

export async function createChat(userId: string, title?: string) {
  return createChatRoom(userId, title);
}

export async function getChatWithMessages(chatId: string, limit: number = 50) {
  const chat = await findChatRoomById(chatId);
  if (!chat) throw new Error("Chat not found");

  const messages = await listChatMessagesForChat(chatId, limit);

  return { chat, messages };
}

export async function appendUserMessage(chatId: string, userId: string, content: string) {
  const message = await createUserMessage(chatId, userId, content);
  return { messageId: message.id };
}
