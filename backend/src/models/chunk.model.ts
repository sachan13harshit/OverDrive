import { prisma } from "../lib/prisma.js";

export type ChunkInsert = {
  id: string;
  userId: string;
  fileId: string;
  chunkIndex: number;
  text: string;
  hash: string;
  embedding: number[];
};

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function insertChunksWithEmbeddings(chunks: ChunkInsert[]): Promise<void> {
  for (const chunk of chunks) {
    await prisma.$executeRaw`
      INSERT INTO chunks (id, user_id, file_id, chunk_index, text, hash, vectorized, embedding, created_at, updated_at)
      VALUES (${chunk.id}::uuid, ${chunk.userId}::uuid, ${chunk.fileId}, ${chunk.chunkIndex}, ${chunk.text}, ${chunk.hash}, true, ${toVectorLiteral(chunk.embedding)}::vector, now(), now())
    `;
  }
}

export function deleteChunksForFile(userId: string, fileId: string) {
  return prisma.chunk.deleteMany({ where: { userId, fileId } });
}

export function findChunkById(id: string) {
  return prisma.chunk.findUnique({ where: { id } });
}

export function findChunksByFileId(fileId: string) {
  return prisma.chunk.findMany({
    where: { fileId },
    select: { text: true, chunkIndex: true },
  });
}
