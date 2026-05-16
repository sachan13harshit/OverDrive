import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types.js";
import { createChat, getChatWithMessages, appendUserMessage } from "../services/chat.service.js";
import { listChatRoomsForUser, updateChatRoomTitle } from "../models/chatRoom.model.js";

export async function listChats(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const chats = await listChatRoomsForUser(authReq.user!.id);
    res.json({ chats });
  } catch (error) {
    console.error("Failed to list chats", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateChatTitle(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const chatId = req.params.chatId as string;
    const { title } = req.body as { title: string };
    if (!title) {
      res.status(400).json({ error: "title required" });
      return;
    }
    const updated = await updateChatRoomTitle(chatId, authReq.user!.id, title);
    res.json(updated);
  } catch (error) {
    console.error("Failed to update chat", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createChatHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { initialMessage } = req.body as { initialMessage?: string };

    const title = initialMessage ? initialMessage.substring(0, 60) : undefined;
    const chat = await createChat(authReq.user!.id, title);

    if (initialMessage) {
      const result = await appendUserMessage(chat.id, authReq.user!.id, initialMessage.trim());
      res.json({ ...chat, initialMessageId: result.messageId });
      return;
    }

    res.json(chat);
  } catch (error) {
    console.error("Failed to create chat", error);
    res.status(400).json({ error: "Invalid request" });
  }
}

export async function getChat(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.params.chatId as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const data = await getChatWithMessages(chatId, limit);
    res.json(data);
  } catch (error) {
    console.error("Failed to get chat", error);
    res.status(404).json({ error: "Chat not found" });
  }
}

export async function postMessage(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.params.chatId as string;
    const { content } = req.body as { content?: string };
    if (!content || !content.trim()) {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const authReq = req as AuthenticatedRequest;

    const result = await appendUserMessage(chatId, authReq.user!.id, content);
    res.json(result);
  } catch (error) {
    console.error("Failed to append message", error);
    res.status(400).json({ error: "Invalid request" });
  }
}
