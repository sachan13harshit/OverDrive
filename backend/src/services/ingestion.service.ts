import crypto from "crypto";
import { getDriveClientForUser } from "./googleDrive.service.js";
import { extractTextFromBuffer } from "./textExtraction.service.js";
import { vectorizeFile } from "./vectorization.service.js";
import { findDriveFileByFileId, updateDriveFile } from "../models/driveFile.model.js";
import { upsertRawDocument } from "../models/rawDocument.model.js";

export async function ingestFile(userId: string, fileId: string): Promise<void> {
  const fileRecord = await findDriveFileByFileId(fileId);

  if (!fileRecord) {
    console.warn(`[ingest] DB record not found for ${fileId}, skipping.`);
    return;
  }

  try {
    await updateDriveFile(fileRecord.id, { ingestionPhase: "fetching", ingestionError: null });

    const drive = await getDriveClientForUser(userId);
    let fileBuffer: Buffer | null = null;
    let effectiveMimeType = fileRecord.mimeType;

    if (fileRecord.mimeType.startsWith("application/vnd.google-apps.")) {
      const exportMimeMap: Record<string, string> = {
        "application/vnd.google-apps.document": "text/plain",
        "application/vnd.google-apps.spreadsheet": "text/csv",
        "application/vnd.google-apps.presentation": "text/plain",
      };
      const targetMime = exportMimeMap[fileRecord.mimeType] || "text/plain";
      const response = await drive.files.export({ fileId, mimeType: targetMime }, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(response.data as ArrayBuffer);
      effectiveMimeType = targetMime;
    } else {
      const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(response.data as ArrayBuffer);
    }

    let rawText = await extractTextFromBuffer(fileBuffer, effectiveMimeType);
    fileBuffer = null;

    let finalErrorMsg = null;
    if (rawText.length > 100000) {
      rawText = rawText.slice(0, 100000);
      finalErrorMsg = "Warning: File truncated due to 100k character size limit.";
    }

    const hash = crypto.createHash("sha256").update(rawText).digest("hex");

    await upsertRawDocument({ userId, fileId, mimeType: effectiveMimeType, text: rawText, hash });

    await updateDriveFile(fileRecord.id, {
      ingestionPhase: "chunk_pending",
      hash,
      ingestionError: finalErrorMsg,
      retryCount: 0,
    });

    await vectorizeFile(userId, fileId);
  } catch (err: any) {
    const errMsg = err.message?.substring(0, 1000) || "Unknown Error";
    const isPermanent =
      err.response?.status && err.response.status >= 400 && err.response.status < 500;
    const currentRetries = fileRecord.retryCount || 0;

    if (isPermanent || currentRetries >= 2) {
      console.error(`[ingest] Terminal failure for ${fileId}. Permanent=${isPermanent}, Retries=${currentRetries}. Error: ${errMsg}`);
      await updateDriveFile(fileRecord.id, { ingestionPhase: "failed", ingestionError: errMsg });
    } else {
      console.warn(`[ingest] Retryable failure for ${fileId}. Attempt ${currentRetries + 1}/3. Error: ${errMsg}`);
      await updateDriveFile(fileRecord.id, {
        retryCount: currentRetries + 1,
        lastRetryAt: new Date(),
        ingestionError: errMsg,
      });

      const backoffMs = Math.pow(2, currentRetries + 1) * 1000;
      setTimeout(() => {
        ingestFile(userId, fileId).catch((retryErr) => {
          console.error(`[ingest] Scheduled retry for ${fileId} threw:`, retryErr);
        });
      }, backoffMs);
    }
  }
}
