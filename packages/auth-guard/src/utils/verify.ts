import jwt from "jsonwebtoken";
import { auth } from "@repo/types";

const secret = process.env.JWT_ACCESS_SECRET;

if (!secret) {
  throw new Error("JWT_ACCESS_SECRET is not set");
}

export class AuthError extends Error {
  constructor(message = "Invalid token") {
    super(message);
    this.name = "AuthError";
  }
}

export function verifyAccessToken(token: string): auth.JwtPayload {
  const decoded = jwt.verify(token, secret as string, {
    algorithms: ["HS256"],
  });

  const parsed = auth.JwtPayloadSchema.safeParse(decoded);

  if (!parsed.success || parsed.data.type !== "access") {
    throw new AuthError();
  }

  return parsed.data;
}