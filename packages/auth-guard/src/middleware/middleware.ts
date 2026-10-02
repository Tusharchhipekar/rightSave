// packages/auth/src/middleware.ts
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { auth } from "@repo/types";
import { verifyAccessToken } from "../utils/verify";

export type AuthenticatedUser = { id: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const fail = (res: Response, message: string, code: string) => {
  const body: auth.ApiError = { message, code };
  res.status(401).json(body);
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    fail(res, "Missing access token", "NO_TOKEN");
    return;
  }

  const token = header.slice(7).trim();

  if (!token) {
    fail(res, "Missing access token", "NO_TOKEN");
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      fail(res, "Access token expired", "TOKEN_EXPIRED");
      return;
    }
    fail(res, "Invalid access token", "INVALID_TOKEN");
  }
};