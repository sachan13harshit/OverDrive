import { prisma } from "../lib/prisma.js";

export function findRawDocumentByFileId(fileId: string) {
  return prisma.rawDocument.findFirst({ where: { fileId } });
}

export async function upsertRawDocument(data: {
  userId: string;
  fileId: string;
  mimeType: string;
  text: string;
  hash: string;
}) {
  const existing = await findRawDocumentByFileId(data.fileId);

  if (!existing) {
    return prisma.rawDocument.create({ data });
  }

  return prisma.rawDocument.update({
    where: { id: existing.id },
    data: { text: data.text, hash: data.hash },
  });
}
