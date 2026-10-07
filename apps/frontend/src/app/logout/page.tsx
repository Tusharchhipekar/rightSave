"use client";

import Link from "next/link";
import { Button } from "@/shared/components/Button";
import { useBootstrapSession, useLogout } from "@/features/auth/hooks/useAuth";

export default function LogoutPage() {
  const status = useBootstrapSession();
  const logout = useLogout();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-surface-container p-6 text-on-surface">
        <h1 className="text-2xl font-semibold">Log out</h1>
        {status === "loading" ? (
          <p className="text-sm text-on-surface-variant">Checking your session…</p>
        ) : status === "unauthenticated" ? (
          <>
            <p className="text-sm text-on-surface-variant">You are not signed in.</p>
            <Link
              href="/login"
              className="block text-center text-sm underline underline-offset-4"
            >
              Go to log in
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant">
              Sign out of your RightSave account.
            </p>
            <Button
              type="button"
              className="w-full"
              loading={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Log out
            </Button>
          </>
        )}
        <Link
          href="/"
          className="block text-center text-sm text-on-surface-variant underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
