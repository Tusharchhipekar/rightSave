"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/features/landing/Icon";

type Props = { cluster: string; saved: string; instagramUrl: string };

export default function ReelTopBar({ cluster, saved, instagramUrl }: Props) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="w-full bg-surface-container-low/90 backdrop-blur-md rounded-2xl p-space-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex flex-col gap-space-xs min-w-0">
        <div className="flex items-center flex-wrap gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5 text-primary font-semibold">
            <Icon name="sync_saved_locally" className="text-[17px]" />
            <span>RightSave</span>
          </span>
          <span className="text-outline">/</span>
          <span className="text-on-surface truncate">Active Cluster: {cluster}</span>
        </div>
        <div className="flex items-center flex-wrap gap-x-space-md gap-y-1 text-body-sm font-body-sm text-outline">
          <span className="w-1 h-1 rounded-full bg-outline"></span>
          <span>{saved}</span>
          <span className="w-1 h-1 rounded-full bg-outline"></span>
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-space-xs self-start md:self-auto shrink-0">
        <a
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-body-sm text-body-sm shadow-xs"
          href={instagramUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon name="open_in_new" className="text-[16px]" />
          <span>Instagram</span>
        </a>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-body-sm text-body-sm shadow-xs ml-space-xs"
          onClick={() => router.back()}
          title="Exit Fullscreen Mode"
          type="button"
        >
          <Icon name="close" className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}