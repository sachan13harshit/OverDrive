import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types.js";
import { listDriveFilesForUser } from "../services/googleDrive.service.js";
import { ingestFile } from "../services/ingestion.service.js";
import {
  findDriveFile,
  listDriveFilesForUser as listDriveFileRecords,
  createDriveFile,
  updateDriveFile,
  IngestionPhase,
} from "../models/driveFile.model.js";
import { findRawDocumentByFileId } from "../models/rawDocument.model.js";
import { findChunkById, findChunksByFileId } from "../models/chunk.model.js";
import { prisma } from "../lib/prisma.js";

const syncRateLimits = new Map<string, number>();

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
];

export async function syncDrive(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const now = Date.now();

  const lastSyncTime = syncRateLimits.get(user.id) || 0;
  if (now - lastSyncTime < 60000) {
    res.status(429).json({ error: "Rate limit exceeded. Try again in a minute." });
    return;
  }
  syncRateLimits.set(user.id, now);

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
    if (!userRecord?.googleRefreshToken) {
      res.status(401).json({ error: "Google account not connected. Please re-authenticate." });
      return;
    }

    let files = await listDriveFilesForUser(userRecord.googleRefreshToken);

    if (req.query.limit) {
      const limit = parseInt(req.query.limit as string, 10);
      if (!isNaN(limit) && limit > 0) {
        files = files.slice(0, limit);
      }
    }

    let supportedCount = 0;
    let unsupportedCount = 0;

    for (const file of files) {
      let isSupported = SUPPORTED_MIME_TYPES.includes(file.mimeType);

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      const isOversized = file.size !== undefined && file.size > MAX_SIZE_BYTES;
      if (isOversized) isSupported = false;

      if (isSupported) {
        supportedCount++;
      } else {
        unsupportedCount++;
      }

      let isPhase: IngestionPhase = isSupported ? "discovered" : "failed";

      let errorMsg = null;
      if (!isSupported) {
        errorMsg = isOversized
          ? `File exceeds 10MB limit (size: ${file.size} bytes)`
          : `Unsupported MIME type: ${file.mimeType}`;
      }

      const existingRecord = await findDriveFile(user.id, file.fileId);
      const fileModifiedDate = file.modifiedTime ? new Date(file.modifiedTime) : null;

      if (!existingRecord) {
        await createDriveFile({
          userId: user.id,
          fileId: file.fileId,
          name: file.name,
          mimeType: file.mimeType,
          lastModifiedAt: fileModifiedDate,
          supported: isSupported,
          ingestionPhase: isPhase,
          ingestionError: errorMsg,
        });

        if (isSupported) {
          ingestFile(user.id, file.fileId).catch((err) =>
            console.error(`[sync] ingestFile failed for ${file.fileId}:`, err)
          );
        }
      } else {
        if (isSupported) {
          const isStaleByDate =
            fileModifiedDate && existingRecord.lastIngestedAt && fileModifiedDate > existingRecord.lastIngestedAt;
          isPhase = isStaleByDate ? "discovered" : (existingRecord.ingestionPhase as IngestionPhase);
        }

        await updateDriveFile(existingRecord.id, {
          name: file.name,
          mimeType: file.mimeType,
          lastModifiedAt: fileModifiedDate,
          supported: isSupported,
          ingestionPhase: isPhase,
          ingestionError: errorMsg,
        });

        if (isPhase === "discovered" && isSupported) {
          ingestFile(user.id, file.fileId).catch((err) =>
            console.error(`[sync] ingestFile failed for ${file.fileId}:`, err)
          );
        }
      }
    }

    res.json({
      status: "Sync completed successfully.",
      summary: { totalFound: files.length, supportedCount, unsupportedCount },
    });
  } catch (error) {
    console.error("Drive Sync Error:", error);
    res.status(500).json({ error: "Failed to sync Google Drive files." });
  }
}

export async function listFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  try {
    const rows = await listDriveFileRecords(user.id);
    res.json({ files: rows });
  } catch (error) {
    console.error("Fetch Drive Files Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  try {
    const rows = await listDriveFileRecords(user.id);

    let supported = 0, unsupported = 0, indexed = 0, inProgress = 0, failed = 0;

    for (const r of rows) {
      if (!r.supported) {
        unsupported++;
      } else {
        supported++;
        if (r.ingestionPhase === "indexed") indexed++;
        else if (r.ingestionPhase === "failed") failed++;
        else inProgress++;
      }
    }

    res.json({ totals: { supported, unsupported, indexed, inProgress, failed }, files: rows });
  } catch (error) {
    console.error("Drive Progress Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function retryFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const fileId = req.params.fileId as string;

  if (!fileId) {
    res.status(400).json({ error: "fileId parameter is required" });
    return;
  }

  try {
    const record = await findDriveFile(user.id, fileId);

    if (!record) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    if (record.ingestionPhase !== "failed") {
      res.status(400).json({ error: "Only failed files can be retried manually." });
      return;
    }

    const existingRawDoc = await findRawDocumentByFileId(fileId);
    const hadRawText = !!existingRawDoc;

    if (hadRawText) {
      await updateDriveFile(record.id, { ingestionPhase: "chunk_pending", retryCount: 0, ingestionError: null });
      ingestFile(user.id, fileId).catch((err) => console.error(`[retry] ingestFile failed for ${fileId}:`, err));
      res.status(200).json({ message: "Re-ingestion started (raw text preserved)", fileId, retryPhase: "vectorize" });
    } else {
      await updateDriveFile(record.id, { ingestionPhase: "discovered", retryCount: 0, ingestionError: null });
      ingestFile(user.id, fileId).catch((err) => console.error(`[retry] ingestFile failed for ${fileId}:`, err));
      res.status(200).json({ message: "Re-ingestion started from scratch", fileId, retryPhase: "fetch" });
    }
  } catch (err: any) {
    console.error("Error retrying file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getChunkContext(req: AuthenticatedRequest, res: Response): Promise<void> {
  const chunkId = req.params.chunkId as string;

  if (!chunkId) {
    res.status(400).json({ error: "chunkId parameter is required" });
    return;
  }

  try {
    const originChunk = await findChunkById(chunkId);

    if (!originChunk) {
      res.status(404).json({ error: "Chunk not found" });
      return;
    }

    const fileRecord = await prisma.driveFile.findFirst({ where: { fileId: originChunk.fileId } });

    if (!fileRecord) {
      res.status(404).json({ error: "Associated file not found" });
      return;
    }

    if (fileRecord.userId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: Not your file" });
      return;
    }

    const localNeighbors = await findChunksByFileId(originChunk.fileId);

    const targetIndices = [originChunk.chunkIndex - 1, originChunk.chunkIndex, originChunk.chunkIndex + 1];
    const relevant = localNeighbors
      .filter((n) => targetIndices.includes(n.chunkIndex))
      .sort((a, b) => a.chunkIndex - b.chunkIndex);

    const enrichedText = relevant.map((r) => r.text).join("\n...\n");

    res.status(200).json({
      chunkId,
      fileId: fileRecord.fileId,
      fileName: fileRecord.name,
      mimeType: fileRecord.mimeType,
      text: enrichedText,
    });
  } catch (err: any) {
    console.error("Error fetching chunk:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
