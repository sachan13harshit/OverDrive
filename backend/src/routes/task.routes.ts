import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getTask, getTaskEvents } from "../controllers/task.controller.js";

const router: Router = Router();

router.get("/:taskId", requireAuth, getTask);
router.get("/:taskId/events", requireAuth, getTaskEvents);

export default router;
