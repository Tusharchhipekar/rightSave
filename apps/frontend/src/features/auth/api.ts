import { authClient } from "@/shared/lib/api-client";
import type { AuthUser } from "./store";

export type AuthResponse = { accessToken: string; user: AuthUser };
export type SigninInput = { identifier: string; password: string };
export type SignupInput = {
  username: string;
  fullName: string;
  email: string;
  password: string;
};

export const authApi = {
  signin: (input: SigninInput) =>
    authClient<AuthResponse>("/auth/signin", { method: "POST", body: input }),

  signup: (input: SignupInput) =>
    authClient<AuthResponse>("/auth/signup", { method: "POST", body: input }),

  logout: () =>
    authClient<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => authClient<{ user: AuthUser }>("/auth/me"),
};