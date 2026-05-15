import { prisma } from "../lib/prisma.js";

export type IngestionPhase = "discovered" | "failed" | "fetching" | "chunk_pending" | "vectorizing" | "indexed";

export function findDriveFile(userId: string, fileId: string) {
  return prisma.driveFile.findFirst({ where: { userId, fileId } });
}

export function findDriveFileByFileId(fileId: string) {
  return prisma.driveFile.findFirst({ where: { fileId } });
}

export function findDriveFileById(id: string) {
  return prisma.driveFile.findUnique({ where: { id } });
}

export function listDriveFilesForUser(userId: string) {
  return prisma.driveFile.findMany({ where: { userId } });
}

export function createDriveFile(data: {
  userId: string;
  fileId: string;
  name: string;
  mimeType: string;
  lastModifiedAt: Date | null;
  supported: boolean;
  ingestionPhase: IngestionPhase;
  ingestionError: string | null;
}) {
  return prisma.driveFile.create({ data });
}

export function updateDriveFile(id: string, data: Record<string, unknown>) {
  return prisma.driveFile.update({ where: { id }, data });
}

export function findStuckDriveFiles(stuckPhases: IngestionPhase[], cutoff: Date) {
  return prisma.driveFile.findMany({
    where: { ingestionPhase: { in: stuckPhases }, updatedAt: { lt: cutoff } },
  });
}
