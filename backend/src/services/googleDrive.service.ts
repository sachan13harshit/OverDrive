import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";

export type DriveFileMetadata = {
  fileId: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: number;
};

function getOAuthClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function getDriveClientForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.googleRefreshToken) {
    throw new Error("User has no Google OAuth Refresh Token saved in the Database.");
  }

  return google.drive({ version: "v3", auth: getOAuthClient(user.googleRefreshToken) });
}

export async function listDriveFilesForUser(refreshToken: string): Promise<DriveFileMetadata[]> {
  const drive = google.drive({ version: "v3", auth: getOAuthClient(refreshToken) });

  try {
    const res = await drive.files.list({
      q: "trashed = false",
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
      spaces: "drive",
      pageSize: 100,
    });

    const files = res.data.files || [];

    return files.map((file) => ({
      fileId: file.id as string,
      name: file.name as string,
      mimeType: file.mimeType as string,
      modifiedTime: file.modifiedTime as string,
      size: file.size ? parseInt(file.size, 10) : undefined,
    }));
  } catch (error) {
    console.error("Google Drive API List Error:", error);
    throw error;
  }
}
