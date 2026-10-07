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
    <main className="relative flex min-h-screen w-full items-center justify-center bg-surface px-4 py-12 overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-container/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[400px] h-[400px] bg-secondary-container/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <AuthForm />
      </div>
    </main>
  );
}