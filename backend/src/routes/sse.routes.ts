import { Router } from "express";
import { streamTaskEvents } from "../controllers/sse.controller.js";

const router: Router = Router();

router.get("/rag/:taskId", streamTaskEvents);

export default router;
