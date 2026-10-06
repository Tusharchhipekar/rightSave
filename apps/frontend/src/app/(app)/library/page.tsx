"use client";

import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/Button";

export default function LibraryPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Library</h1>
      <p className="text-neutral-400">
        Signed in as {user?.username}. Placeholder until the library batch.
      </p>
      <Button variant="ghost" onClick={() => logout.mutate()}>
        Log out
      </Button>
    </main>
  );
}