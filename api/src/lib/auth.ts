import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const COOKIE = "veloura_admin";
const SESSION_DAYS = 7;

/** Constant-time comparison that doesn't leak length either. */
function sameText(attempt: string, expected: string) {
  const a = createHash("sha256").update(attempt).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Usernames ignore letter case; passwords don't. Both are always checked, so timing gives nothing away. */
export function credentialsMatch(username: string, password: string) {
  const userOk = sameText(username.trim().toLowerCase(), config.adminUsername.toLowerCase());
  const passOk = sameText(password, config.adminPassword);
  return userOk && passOk;
}

export function startSession(res: Response) {
  const token = jwt.sign({ role: "admin" }, config.sessionSecret, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function endSession(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

export function isAdmin(req: Request) {
  const token = req.cookies?.[COOKIE];
  if (!token) return false;
  try {
    jwt.verify(token, config.sessionSecret);
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Please sign in again." });
    return;
  }
  next();
}
