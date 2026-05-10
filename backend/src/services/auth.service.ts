import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { upsertGoogleUser } from "../models/user.model.js";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.readonly",
];

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthorizeUrl() {
  const oauth2Client = getGoogleOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function exchangeGoogleCodeForSession(code: string) {
  const oauth2Client = getGoogleOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const userInfoResponse = await oauth2.userinfo.get();
  const userInfo = userInfoResponse.data;

  if (!userInfo.id || !userInfo.email || !userInfo.name) {
    throw new Error("Failed to get required user info from Google.");
  }

  const userRecord = await upsertGoogleUser({
    googleId: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    refreshToken: tokens.refresh_token ?? undefined,
  });

  const sessionToken = jwt.sign(
    { id: userRecord.id, email: userRecord.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return sessionToken;
}
