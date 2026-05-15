import { get_encoding } from "tiktoken";
import crypto from "crypto";
import { getBatchEmbeddings } from "./embedding.service.js";
import { findDriveFileByFileId, updateDriveFile } from "../models/driveFile.model.js";
import { findRawDocumentByFileId } from "../models/rawDocument.model.js";
import { deleteChunksForFile, insertChunksWithEmbeddings, ChunkInsert } from "../models/chunk.model.js";

function chunkText(text: string, maxTokens: number = 800, overlapTokens: number = 100): string[] {
  const enc = get_encoding("cl100k_base");
  const tokens = enc.encode(text);
  const chunksArr: string[] = [];

  if (tokens.length === 0) return [];

  let i = 0;
  while (i < tokens.length) {
    const chunkTokens = tokens.slice(i, i + maxTokens);
    const chunkTextStr = enc.decode(chunkTokens);
    chunksArr.push(new TextDecoder().decode(chunkTextStr));
    i += maxTokens - overlapTokens;
  }

  enc.free();
  return chunksArr;
}

export async function vectorizeFile(userId: string, fileId: string): Promise<void> {
  const fileRecord = await findDriveFileByFileId(fileId);

  if (!fileRecord) {
    console.warn(`[vectorize] DB record not found for ${fileId}, skipping.`);
    return;
  }

  await updateDriveFile(fileRecord.id, { ingestionPhase: "vectorizing" });

  const rawDoc = await findRawDocumentByFileId(fileId);

  if (!rawDoc) throw new Error("Raw document text not found for vectorization.");

  await deleteChunksForFile(userId, fileId);

  const textChunks = chunkText(rawDoc.text, 800, 100);

  if (textChunks.length === 0) throw new Error("File resulted in 0 chunks (empty document).");

  console.log(`[vectorize] ${textChunks.length} chunks for ${fileId}. Generating embeddings...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
    const batchChunks = textChunks.slice(i, i + BATCH_SIZE);
    const textsToEmbed = batchChunks.map((c) => `Title: ${fileRecord.name}\n\n${c}`);

    const embeddings = await getBatchEmbeddings(textsToEmbed);

    const dbChunkRecords: ChunkInsert[] = [];

    for (let j = 0; j < batchChunks.length; j++) {
      const chunkIndex = i + j;
      const chunkTextValue = batchChunks[j]!;
      const embedding = embeddings[j];
      const chunkHash = crypto.createHash("sha256").update(chunkTextValue).digest("hex");

      if (!embedding) throw new Error("Missing embedding from OpenAI");

      dbChunkRecords.push({
        id: crypto.randomUUID(),
        userId,
        fileId,
        chunkIndex,
        text: chunkTextValue,
        hash: chunkHash,
        embedding,
      });
    }

    await insertChunksWithEmbeddings(dbChunkRecords);
  }

  await updateDriveFile(fileRecord.id, {
    ingestionPhase: "indexed",
    hash: rawDoc.hash,
    lastIngestedAt: new Date(),
    retryCount: 0,
    ingestionError: null,
  });

  console.log(`[vectorize] Indexed ${textChunks.length} chunks for ${fileId}.`);
}
