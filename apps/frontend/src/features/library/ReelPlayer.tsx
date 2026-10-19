/* eslint-disable @next/next/no-img-element */
import Icon from "@/features/landing/Icon";
import type { ReelDetail } from "./types";

export default function ReelPlayer({
  image,
  ocr,
}: Pick<ReelDetail, "image" | "ocr">) {
  return (
    <div className="lg:col-span-5 w-full flex flex-col gap-space-md">
      <div className="relative w-full aspect-[9/16] max-h-[820px] rounded-2xl overflow-hidden bg-surface-container-lowest shadow-2xl flex flex-col justify-between group border border-outline-variant/20">
        {image ? (
          <img
            alt="Reel snapshot"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-95 contrast-105"
            src={image}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-linear-to-b from-surface-container to-surface-container-lowest flex flex-col items-center justify-center gap-3 text-outline">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-lg border border-outline-variant/30">
              <Icon name="image" className="text-[36px]" />
            </div>
            <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
              Reel Snapshot
            </span>
          </div>
        )}

        {/* Top badge */}
        <div className="relative z-10 p-space-md flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-code-sm text-[11px] border border-outline-variant/30 flex items-center gap-1.5 shadow-sm">
            <Icon name="photo_camera" className="text-secondary text-[14px]" />
            <span>Reel Snapshot</span>
          </span>
        </div>

        {/* Bottom subtle gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent pointer-events-none"></div>

        {/* OCR or frame overlay */}
        <div className="relative z-10 p-space-md mt-auto">
          {ocr && ocr.text && (
            <div className="p-space-sm rounded-xl bg-surface-container-low/90 backdrop-blur-xl shadow-lg flex items-start gap-2 max-w-sm border border-outline-variant/30">
              <Icon name="document_scanner" className="text-primary text-[18px] shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="font-label-code-sm text-[10px] text-tertiary uppercase tracking-wider">
                  {ocr.label}
                </span>
                <span className="font-label-code text-label-code text-on-surface line-clamp-3">
                  {ocr.text}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}