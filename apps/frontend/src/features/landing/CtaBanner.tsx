"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useBootstrapSession } from "@/features/auth/hooks/useAuth";

export default function CtaBanner() {
  const status = useBootstrapSession();
  const isAuthed = status === "authenticated";

  return (
    <section className="px-margin pt-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="relative rounded-3xl bg-surface-container-high p-8 md:p-14 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest text-secondary font-label-code-sm text-label-code-sm w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Ready in under 60 seconds
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-4 tracking-tight">
            Start searching what you saved today.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Reclaim hundreds of hours of high-value ideas, workflows, and blueprints gathering dust
            in your Instagram profile.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link
            href={isAuthed ? "/library" : "/login"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-md font-semibold shadow-[0_4px_24px_rgba(128,131,255,0.4)] hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
          >
            <Icon name="sync_saved_locally" className="text-[20px]" />
            <span>Index My Instagram Free</span>
          </Link>
        </div>
      </div>
    </section>
  );
}