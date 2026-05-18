import { Request, Response } from "express";
import { ragEventEmitter, getRagEvents } from "../services/ragEvents.service.js";
import { RagEvent } from "../types/rag.types.js";

export function streamTaskEvents(req: Request, res: Response): void {
  try {
    const taskId = req.params.taskId as string;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`data: ${JSON.stringify({ message: "connected" })}\n\n`);

    const pastEvents = getRagEvents(taskId);
    for (const event of pastEvents) {
      res.write(`id: ${event.id}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    const lastPast = pastEvents[pastEvents.length - 1];
    if (lastPast?.type === "finish") {
      res.write(`event: finish\ndata: {}\n\n`);
      res.end();
      return;
    }

    const handler = (event: RagEvent) => {
      res.write(`id: ${event.id}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);

      if (event.type === "finish") {
        res.write(`event: finish\ndata: {}\n\n`);
        res.end();
        ragEventEmitter.off(`task:${taskId}`, handler);
      }
    };

    ragEventEmitter.on(`task:${taskId}`, handler);

    req.on("close", () => {
      ragEventEmitter.off(`task:${taskId}`, handler);
    });
  } catch (error) {
    console.error("SSE stream failed", error);
    res.status(500).end();
  }
}
