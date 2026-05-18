import { prisma } from "../lib/prisma.js";

export function findRagTaskById(id: string) {
  return prisma.ragTask.findUnique({ where: { id } });
}

export function findRagTaskProgress(id: string) {
  return prisma.ragTask.findUnique({
    where: { id },
    select: { status: true, finalAnswerMarkdown: true, resultJson: true },
  });
}

export function markRagTaskRunning(id: string) {
  return prisma.ragTask.update({ where: { id }, data: { status: "running" } });
}

export function failRagTask(id: string, finalAnswerMarkdown: string) {
  return prisma.ragTask.update({
    where: { id },
    data: { status: "error", finalAnswerMarkdown, completedAt: new Date() },
  });
}
