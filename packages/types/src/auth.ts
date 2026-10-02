import { z } from "zod";
import { authProvider } from "./common";

export const SignupApiRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  email: z.string().email(),
  fullName: z.string().min(1).optional(),
});

export const SigninApiRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const RefreshTokenApiRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const OAuthCallbackParamsSchema = z.object({
  provider: authProvider.exclude(["credentials"]),
});

export const OAuthCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export type SignupApi = z.infer<typeof SignupApiRequestSchema>;
export type SigninApi = z.infer<typeof SigninApiRequestSchema>;
export type RefreshTokenApi = z.infer<typeof RefreshTokenApiRequestSchema>;
export type OAuthCallbackParams = z.infer<typeof OAuthCallbackParamsSchema>;
export type OAuthCallbackQuery = z.infer<typeof OAuthCallbackQuerySchema>;