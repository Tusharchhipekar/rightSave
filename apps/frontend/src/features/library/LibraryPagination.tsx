"use client";

import Icon from "@/features/landing/Icon";

type LibraryPaginationProps = {
  hasMore?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  canPrev?: boolean;
  isFetching?: boolean;
};

export default function LibraryPagination({
  hasMore = false,
  onNext,
  onPrev,
  canPrev = false,
  isFetching = false,
}: LibraryPaginationProps) {
  if (!hasMore && !canPrev) return null;

  return (
    <section className="flex flex-col md:flex-row items-center gap-space-md pt-space-md pb-space-lg justify-center">
      <div className="flex items-center gap-space-sm font-label-code text-label-code justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!canPrev || isFetching}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-body-sm transition-colors ${
              canPrev && !isFetching
                ? "bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                : "bg-surface-container-low text-outline opacity-50 cursor-not-allowed"
            }`}
            type="button"
          >
            <Icon name="chevron_left" className="text-[18px]" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!hasMore || isFetching}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-body-sm transition-colors ${
              hasMore && !isFetching
                ? "bg-primary-container text-on-primary-container font-semibold hover:bg-primary hover:text-on-primary cursor-pointer shadow-xs"
                : "bg-surface-container-low text-outline opacity-50 cursor-not-allowed"
            }`}
            type="button"
          >
            <span>Next</span>
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}