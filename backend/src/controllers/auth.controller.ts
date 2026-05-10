import { Request, Response } from "express";
import { findUserById } from "../models/user.model.js";
import { getGoogleAuthorizeUrl, exchangeGoogleCodeForSession } from "../services/auth.service.js";
import { AuthenticatedRequest } from "../types/auth.types.js";

export async function getMe(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  try {
    const user = await findUserById(authReq.user!.id);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error("/auth/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function redirectToGoogle(req: Request, res: Response): void {
  res.redirect(getGoogleAuthorizeUrl());
}

export async function handleGoogleCallback(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send("No authentication code provided.");
    return;
  }

  try {
    const sessionToken = await exchangeGoogleCodeForSession(code);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/?token=${sessionToken}`);
  } catch (error) {
    console.error("Google OAuth API Error:", error);
    res.status(500).send("Authentication failed");
  }
}
