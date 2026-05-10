import { prisma } from "../lib/prisma.js";

export type GoogleUserInfo = {
  googleId: string;
  email: string;
  name: string;
  refreshToken?: string;
};

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
}

export function findUserByGoogleId(googleId: string) {
  return prisma.user.findUnique({ where: { googleId } });
}

export function upsertGoogleUser(info: GoogleUserInfo) {
  return prisma.user.upsert({
    where: { googleId: info.googleId },
    update: {
      email: info.email,
      name: info.name,
      ...(info.refreshToken && { googleRefreshToken: info.refreshToken }),
    },
    create: {
      googleId: info.googleId,
      email: info.email,
      name: info.name,
      ...(info.refreshToken && { googleRefreshToken: info.refreshToken }),
    },
  });
}
