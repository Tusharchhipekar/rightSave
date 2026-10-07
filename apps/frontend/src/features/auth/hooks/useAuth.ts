"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAccessToken } from "@/shared/lib/api-client";
import { authApi, type SigninInput, type SignupInput } from "../api";
import { useAuthStore } from "../store";

// On first load: refresh cookie -> access token -> /auth/me.
export function useBootstrapSession() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (useAuthStore.getState().status !== "loading") return;

    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        useAuthStore.getState().clear();
        return;
      }
      try {
        const { user } = await authApi.me();
        useAuthStore.getState().setSession(token, user);
      } catch {
        useAuthStore.getState().clear();
      }
    })();
  }, []);

  return status;
}

export function useSignin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: SigninInput) => authApi.signin(input),
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data.accessToken, data.user);
      router.replace("/library");
    },
  });
}

export function useSignup() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data.accessToken, data.user);
      router.replace("/library");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.clear();
      router.replace("/");
    },
  });
}