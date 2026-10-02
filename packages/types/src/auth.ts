// packages/types/src/auth.ts
import { z } from "zod";
import { authProvider, id } from "./common";

const email = z.string().trim().toLowerCase().pipe(z.email());

export const SignupApiRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(8).max(128),
  email,
  fullName: z.string().trim().min(1).optional(),
});

export const SigninApiRequestSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1).max(128),
});

export const OAuthCallbackParamsSchema = z.object({
  provider: authProvider.exclude(["credentials"]),
});

export const OAuthCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export const AuthUserSchema = z.object({
  id,
  username: z.string(),
  fullName: z.string().nullable(),
  email: z.email(),
  avatarUrl: z.string().nullable(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: AuthUserSchema,
});

export const JwtPayloadSchema = z.object({
  sub: id,
  type: z.enum(["access", "refresh"]),
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
});

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type SignupApi = z.infer<typeof SignupApiRequestSchema>;
export type SigninApi = z.infer<typeof SigninApiRequestSchema>;
export type OAuthCallbackParams = z.infer<typeof OAuthCallbackParamsSchema>;
export type OAuthCallbackQuery = z.infer<typeof OAuthCallbackQuerySchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;