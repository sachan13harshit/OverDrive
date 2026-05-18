export type DriveCitation = {
  type: "drive";
  chunkId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  score: number;
};

export type RagEventType = "start" | "retrieving" | "generating" | "finish";

export type RagEvent = {
  id: string;
  taskId: string;
  type: RagEventType;
  timestamp: number;
  title?: string;
  finalAnswerMarkdown?: string;
  citations?: DriveCitation[];
};

export type RagEventInput = Omit<RagEvent, "id">;
