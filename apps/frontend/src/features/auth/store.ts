import { create } from "zustand";

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  status: "loading",
  setSession: (accessToken, user) =>
    set({ accessToken, user, status: "authenticated" }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}));