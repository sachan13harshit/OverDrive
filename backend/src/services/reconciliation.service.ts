import { findStuckDriveFiles, updateDriveFile, IngestionPhase } from "../models/driveFile.model.js";
import { ingestFile } from "./ingestion.service.js";

const STUCK_PHASES: IngestionPhase[] = ["fetching", "chunk_pending", "vectorizing"];
const STUCK_THRESHOLD_MS = Number(process.env.STUCK_INGESTION_TIMEOUT_MS) || 5 * 60 * 1000;

export async function reconcileStuckIngestions(): Promise<void> {
  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS);

  const stuckFiles = await findStuckDriveFiles(STUCK_PHASES, cutoff);

  if (stuckFiles.length === 0) return;

  console.warn(`[reconcile] Found ${stuckFiles.length} file(s) stuck past ${STUCK_THRESHOLD_MS}ms — re-driving.`);

  for (const file of stuckFiles) {
    const currentRetries = file.retryCount || 0;

    if (currentRetries >= 2) {
      console.error(`[reconcile] ${file.fileId} exhausted retries while stuck (phase=${file.ingestionPhase}). Marking failed.`);
      await updateDriveFile(file.id, {
        ingestionPhase: "failed",
        ingestionError: "Ingestion stalled (process likely restarted mid-run) and exhausted retries.",
      });
      continue;
    }

    console.warn(`[reconcile] Re-driving ${file.fileId} (was stuck in '${file.ingestionPhase}', attempt ${currentRetries + 1}/3).`);
    await updateDriveFile(file.id, { retryCount: currentRetries + 1, lastRetryAt: new Date() });

    ingestFile(file.userId, file.fileId).catch((err) => {
      console.error(`[reconcile] Re-driven ingestion for ${file.fileId} threw:`, err);
    });
  }
}

export function startReconciliationSweep(intervalMs = 2 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    reconcileStuckIngestions().catch((err) => console.error("[reconcile] Sweep failed:", err));
  }, intervalMs);
}
