"use client";

import Link from "next/link";
import Icon from "./Icon";
import SearchDemo from "./SearchDemo";
import { useBootstrapSession } from "@/features/auth/hooks/useAuth";

export default function Hero() {
  const status = useBootstrapSession();
  const isAuthed = status === "authenticated";
  const targetHref = isAuthed ? "/library" : "/login";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Atmospheric glow layer */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-96 -left-20 w-[420px] h-[420px] bg-secondary-container/10 blur-[140px] rounded-full pointer-events-none" />

      <section className="relative px-margin pt-12 pb-16 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Metric badge */}
        <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface shadow-md">
          <span className="text-secondary font-label-code-sm text-label-code-sm">⚡</span>
          <span className="font-label-code-sm text-label-code-sm tracking-wide text-on-surface-variant">
            Over <span className="text-secondary font-semibold">2.4M</span> saved Reels processed
            with zero manual tagging
          </span>
        </div>

        <h1 className="font-display-hero text-display-hero text-on-surface mt-6 max-w-4xl tracking-tight leading-none">
          You don&apos;t have a saving problem. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary bg-clip-text text-transparent">
            You have a finding problem.
          </span>
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-6 font-normal">
          RightSave turns your saved Instagram Reels into a personal AI-powered search engine.
          Search by what you vaguely remember — not by endless, frustrating scrolling.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-space-md mt-8">
          <Link
            href={targetHref}
            className="group relative px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-md font-semibold shadow-[0_4px_24px_rgba(128,131,255,0.45)] hover:shadow-[0_4px_32px_rgba(128,131,255,0.65)] hover:bg-primary transition-all flex items-center gap-2"
          >
            <span>Search My Reels</span>
            <Icon
              name="arrow_forward"
              className="text-[18px] group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
          <Link
            href={targetHref}
            className="px-6 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-headline-sm text-body-md font-medium hover:bg-surface-bright transition-all flex items-center gap-2"
          >
            <span>Start Free Trial</span>
          </Link>
        </div>

        <SearchDemo />
      </section>
    </div>
  );
}