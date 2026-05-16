import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listChats, updateChatTitle, createChatHandler, getChat, postMessage } from "../controllers/chat.controller.js";

const router: Router = Router();

router.get("/", requireAuth, listChats);
router.patch("/:chatId", requireAuth, updateChatTitle);
router.post("/", requireAuth, createChatHandler);
router.get("/:chatId", requireAuth, getChat);
router.post("/:chatId/messages", requireAuth, postMessage);

export default router;
