"use client";

import { useState } from "react";

type Props = {
  onLogin: (email: string, password: string) => Promise<unknown>;
};

export function DemoLoginButton({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = process.env.NEXT_PUBLIC_DEMO_EMAIL;
  const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
  if (!email || !password) return null; // hidden unless the demo account is configured

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch {
      setError("Demo login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Demo Login"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}