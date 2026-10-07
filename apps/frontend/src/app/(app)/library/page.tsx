import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-on-surface">
      <h1 className="font-headline-lg text-headline-lg">Library</h1>
      <p className="text-on-surface-variant">Your saved reels will appear here.</p>
      <div className="flex gap-4 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Home
        </Link>
        <Link href="/logout" className="underline underline-offset-4">
          Log out
        </Link>
      </div>
    </main>
  );
}
