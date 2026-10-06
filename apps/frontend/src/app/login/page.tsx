"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { useBootstrapSession } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const status = useBootstrapSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/library");
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <AuthForm />
      </div>
    </main>
  );
}