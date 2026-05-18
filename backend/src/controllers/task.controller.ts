import { Request, Response } from "express";
import { findRagTaskById, findRagTaskProgress } from "../models/ragTask.model.js";

export async function getTask(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.taskId as string;

    const task = await findRagTaskById(taskId);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json({
      status: task.status,
      input_prompt: task.inputPrompt,
      finalAnswerMarkdown: task.finalAnswerMarkdown,
      resultJson: task.resultJson,
    });
  } catch (error) {
    console.error("Failed to get task", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTaskEvents(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.taskId as string;

    const task = await findRagTaskProgress(taskId);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const isDone = ["completed", "error", "timeout", "max_steps"].includes(task.status);

    const response: any = {
      done: isDone,
      status: task.status,
      events: [],
    };

    if (task.finalAnswerMarkdown) response.finalAnswerMarkdown = task.finalAnswerMarkdown;
    if (task.resultJson) response.citations = (task.resultJson as any).citations;

    res.json(response);
  } catch (error) {
    console.error("Failed to fetch task events", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
