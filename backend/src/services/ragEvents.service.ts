import { EventEmitter } from "events";
import { RagEvent, RagEventInput } from "../types/rag.types.js";

export const ragEventEmitter = new EventEmitter();
ragEventEmitter.setMaxListeners(100);

const eventStore = new Map<string, RagEvent[]>();

export function appendRagEvent(taskId: string, event: RagEventInput): Promise<void> {
  if (!eventStore.has(taskId)) eventStore.set(taskId, []);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storedEvent: RagEvent = { ...event, id };
  eventStore.get(taskId)!.push(storedEvent);
  ragEventEmitter.emit(`task:${taskId}`, storedEvent);
  return Promise.resolve();
}

export function getRagEvents(taskId: string): RagEvent[] {
  return eventStore.get(taskId) || [];
}
