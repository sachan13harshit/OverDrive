import { getEmbedding } from "./embedding.service.js";
import { searchChunksByEmbedding } from "../models/chunk.model.js";
import { prisma } from "../lib/prisma.js";
import { DriveCitation } from "../types/rag.types.js";

export async function driveRetrieveTool(input: { query: string; userId: string; topK?: number }): Promise<{
  formattedSnippet: string;
  citations: DriveCitation[];
}> {
  console.log(`[drive_retrieve] Starting search for userId=${input.userId}, query="${input.query.substring(0, 80)}"`);

  const queryEmbedding = await getEmbedding(input.query);
  console.log(`[drive_retrieve] Embedded query (dim=${queryEmbedding.length})`);

  const topK = input.topK || 20;
  let searchResults;
  try {
    searchResults = await searchChunksByEmbedding(queryEmbedding, input.userId, topK, 0.4);
    console.log(`[drive_retrieve] pgvector returned ${searchResults.length} hits (topK=${topK}, threshold=0.4, userId=${input.userId})`);
  } catch (searchErr: any) {
    console.error(`[drive_retrieve] pgvector search FAILED:`, searchErr?.message || searchErr);
    throw searchErr;
  }

  if (searchResults.length === 0) {
    return { formattedSnippet: "No relevant documents found in Google Drive.", citations: [] };
  }

  const fileIds = Array.from(new Set(searchResults.map((c) => c.fileId)));
  const driveFileRows = await prisma.driveFile.findMany({
    where: { fileId: { in: fileIds } },
    select: { fileId: true, name: true, mimeType: true },
  });
  const fileMetaMap = new Map(driveFileRows.map((f) => [f.fileId, f]));

  const fileGroups = new Map<string, Array<{ chunkId: string; fileName: string; mimeType: string; score: number; text: string }>>();

  for (const c of searchResults) {
    const meta = fileMetaMap.get(c.fileId);
    if (!fileGroups.has(c.fileId)) fileGroups.set(c.fileId, []);
    fileGroups.get(c.fileId)!.push({
      chunkId: c.id,
      fileName: meta?.name || "Unknown File",
      mimeType: meta?.mimeType || "text/plain",
      score: c.score,
      text: c.text,
    });
  }

  const formattedSnippetParts: string[] = [];
  const citations: DriveCitation[] = [];

  for (const [fileId, contexts] of fileGroups.entries()) {
    contexts.sort((a, b) => b.score - a.score);

    const highestScore = contexts[0]?.score || 0;
    const sampleContext = contexts[0]!;
    const topChunks = contexts.slice(0, 2);
    const combinedText = topChunks.map((c, idx) => `[Relevant Snippet ${idx + 1}]\n${c.text}`).join("\n\n");

    formattedSnippetParts.push(`[Source File: ${sampleContext.fileName} (ID: ${fileId})]\n${combinedText}`);

    citations.push({
      type: "drive",
      chunkId: topChunks.map((c) => c.chunkId).join(","),
      fileId,
      fileName: sampleContext.fileName,
      mimeType: sampleContext.mimeType,
      score: highestScore,
    });
  }

  const cappedCitations = citations.slice(0, 5);
  const cappedFormattedSnippetParts = formattedSnippetParts.slice(0, 5);

  console.log(`[drive_retrieve] Returning ${cappedCitations.length} grouped file citations`);

  return { formattedSnippet: cappedFormattedSnippetParts.join("\n\n---\n\n"), citations: cappedCitations };
}
