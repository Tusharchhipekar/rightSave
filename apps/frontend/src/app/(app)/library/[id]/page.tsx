"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ReelInsights from "@/features/library/ReelInsights";
import ReelPlayer from "@/features/library/ReelPlayer";
import ReelTopBar from "@/features/library/ReelTopBar";
import {
  libraryApi,
  formatRelativeTime,
  type ContentDetail,
} from "@/features/library/api";
import type { ReelDetail } from "@/features/library/types";
import { ApiError } from "@/shared/lib/api-client";
import Icon from "@/features/landing/Icon";

type PageProps = {
  params: Promise<{ id: string }>;
};

function buildTakeaways(detail: ContentDetail) {
  const takeaways = [];
  if (detail.ocrText) {
    takeaways.push({
      time: "OCR",
      title: "Extracted Text",
      body: [detail.ocrText.slice(0, 300)],
      active: true,
    });
  }
  if (detail.visionCaption) {
    takeaways.push({
      time: "Vision",
      title: "Visual Scene Analysis",
      body: [detail.visionCaption.slice(0, 300)],
    });
  }
  if (detail.transcript) {
    takeaways.push({
      time: "Audio",
      title: "Spoken Transcript",
      body: [detail.transcript.slice(0, 400)],
    });
  }
  if (takeaways.length === 0) {
    takeaways.push({
      time: "Indexed",
      title: "Saved Reel Node",
      body: [
        detail.caption ||
          "This reel was saved and indexed into your personal RightSave knowledge base.",
      ],
      active: true,
    });
  }
  return takeaways;
}

export default function ReelDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const contentQuery = useQuery({
    queryKey: ["content-detail", id],
    queryFn: async () => {
      try {
        return await libraryApi.getContent(id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    retry: (count, err) =>
      !(err instanceof ApiError && err.status === 404) && count < 1,
    staleTime: 30000,
  });

  const backendData = contentQuery.data;

  let reel: ReelDetail | null = null;
  if (backendData) {
    reel = {
      id: backendData.id,
      cluster:
        backendData.tags?.[0] ||
        (backendData.type ? backendData.type.toUpperCase() : "INSTAGRAM REEL"),
      saved: formatRelativeTime(backendData.createdAt),
      instagramUrl: backendData.sourceUrl || "https://instagram.com",
      image: backendData.thumbnailUrl || "",
      ocr: {
        label: "Visual Intelligence",
        text:
          backendData.ocrText ||
          backendData.visionCaption ||
          "Semantic text & visuals indexed",
      },
      title:
        backendData.caption && backendData.caption.trim()
          ? backendData.caption.split("\n")[0].slice(0, 80)
          : "Saved Instagram Reel",
      summary:
        backendData.summary ||
        backendData.visionCaption ||
        backendData.caption ||
        "No detailed summary available yet.",
      takeaways: buildTakeaways(backendData),
    };
  }

  if (contentQuery.isLoading) {
    return (
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="w-full px-margin py-space-xl flex flex-col gap-space-lg max-w-[1720px] mx-auto animate-pulse">
          <div className="h-16 rounded-2xl bg-surface-container-low" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-5 aspect-[9/16] rounded-2xl bg-surface-container-low" />
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="h-44 rounded-2xl bg-surface-container-low" />
              <div className="h-72 rounded-2xl bg-surface-container-low" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (contentQuery.isError) {
    return (
      <main className="w-full pt-24 bg-surface min-h-screen flex items-center justify-center px-4">
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center text-center gap-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center">
            <Icon name="cloud_off" className="text-[28px]" />
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">Could not load reel</h2>
          <p className="text-body-sm text-on-surface-variant">
            Check your connection or sign in again.
          </p>
          <button
            type="button"
            onClick={() => contentQuery.refetch()}
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!reel) {
    return (
      <main className="w-full pt-24 bg-surface min-h-screen flex items-center justify-center px-4">
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center text-center gap-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center">
            <Icon name="search_off" className="text-[28px]" />
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">Reel Not Found</h2>
          <p className="text-body-sm text-on-surface-variant">
            This reel could not be found in your library.
          </p>
          <Link
            href="/library"
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            Back to Library
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full pt-16 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="relative w-full px-margin pb-space-xl flex flex-col gap-space-lg max-w-[1720px] mx-auto">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-primary/5 rounded-[0.75rem] blur-3xl pointer-events-none -z-10"></div>
          <ReelTopBar
            cluster={reel.cluster}
            saved={reel.saved}
            instagramUrl={reel.instagramUrl}
            contentId={reel.id}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <ReelPlayer image={reel.image} ocr={reel.ocr} />
            <ReelInsights
              title={reel.title}
              summary={reel.summary}
              takeaways={reel.takeaways}
              contentId={backendData?.id}
            />
          </div>
        </div>
      </div>
    </main>
  );
}