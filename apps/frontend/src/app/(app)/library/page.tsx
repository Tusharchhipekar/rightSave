"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LibraryCard from "@/features/library/LibraryCard";
import LibraryPagination from "@/features/library/LibraryPagination";
import LibraryToolbar from "@/features/library/LibraryToolbar";
import {
  libraryApi,
  mapContentToCard,
  type CollectionItem,
} from "@/features/library/api";
import Icon from "@/features/landing/Icon";

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Fetch Collections
  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      try {
        const res = await libraryApi.listCollections();
        return res.items;
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        return [] as CollectionItem[];
      }
    },
    staleTime: 30000,
  });

  // Create Collection Mutation
  const createCollectionMutation = useMutation({
    mutationFn: (name: string) => libraryApi.createCollection(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  // Fetch Content or Search from Backend
  const contentQuery = useQuery({
    queryKey: ["content", searchQuery, activeCollectionId, statusFilter, cursor],
    queryFn: async () => {
      const trimmed = searchQuery.trim();
      // Search if >= 2 characters
      if (trimmed.length >= 2) {
        const res = await libraryApi.search(trimmed);
        return {
          items: res.content,
          nextCursor: null,
          total: res.content.length,
        };
      }

      // If viewing a specific collection
      if (activeCollectionId) {
        const res = await libraryApi.listCollectionContent(activeCollectionId, {
          cursor,
          limit: 18,
        });
        return {
          items: res.items,
          nextCursor: res.nextCursor,
          total: res.items.length,
        };
      }

      // Normal content listing from backend
      const res = await libraryApi.listContent({
        status: statusFilter === "all" ? undefined : statusFilter,
        cursor,
        limit: 18,
      });
      return {
        items: res.items,
        nextCursor: res.nextCursor,
        total: res.items.length,
      };
    },
    staleTime: 15000,
    retry: 1,
  });

  const collections = collectionsQuery.data ?? [];
  const rawItems = contentQuery.data?.items ?? [];
  const nextCursor = contentQuery.data?.nextCursor ?? null;

  // Real user data only
  const cards = rawItems.map(mapContentToCard);

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, cursor ?? ""]);
      setCursor(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCursor(prevCursor || undefined);
    }
  };

  return (
    <main className="w-full pt-16 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary-container/10 blur-[130px] rounded-[0.75rem] pointer-events-none"></div>
          <div className="absolute top-24 w-[420px] h-[420px] bg-secondary/5 blur-[120px] rounded-[0.75rem] pointer-events-none"></div>

          <div className="w-full px-margin py-space-lg flex flex-col gap-space-lg max-w-[1720px] mx-auto">
            <LibraryToolbar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              activeCollectionId={activeCollectionId}
              onSelectCollection={(id) => {
                setActiveCollectionId(id);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              collections={collections}
              totalCount={rawItems.length}
              onCreateCollection={async (name) => {
                await createCollectionMutation.mutateAsync(name);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(st) => {
                setStatusFilter(st);
                setCursor(undefined);
                setCursorHistory([]);
              }}
            />

            <section aria-label="Indexed Reel Nodes" className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="filter_center_focus" className="text-secondary text-[20px]" />
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    {searchQuery.trim().length >= 2
                      ? `Search Results for "${searchQuery}"`
                      : activeCollectionId
                      ? `Collection: ${
                          collections.find((c) => c.id === activeCollectionId)?.name ?? "Selected"
                        }`
                      : "Indexed Knowledge Nodes"}
                  </h2>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-label-code text-label-code">
                  <span>
                    {contentQuery.isLoading
                      ? "Loading reels..."
                      : `${rawItems.length} Reel${rawItems.length === 1 ? "" : "s"}`}
                  </span>
                </div>
              </div>

              {/* Loading Skeletons */}
              {contentQuery.isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-surface-container-low p-space-md flex flex-col gap-3 animate-pulse border border-outline-variant/10"
                    >
                      <div className="w-full aspect-[9/10] rounded-xl bg-surface-container-high/60" />
                      <div className="h-5 w-3/4 rounded bg-surface-container-high/70" />
                      <div className="h-4 w-full rounded bg-surface-container-high/50" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-4 w-16 rounded bg-surface-container-high/50" />
                        <div className="h-4 w-20 rounded bg-surface-container-high/50" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {contentQuery.isError && (
                <div className="p-8 rounded-2xl bg-surface-container-low border border-error/20 flex flex-col items-center justify-center text-center gap-4 my-8">
                  <div className="w-12 h-12 rounded-full bg-error/15 text-error flex items-center justify-center">
                    <Icon name="cloud_off" className="text-[28px]" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-md">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Could not load reels from server
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Please check your connection or sign in again.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => contentQuery.refetch()}
                    className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State (No Real Data) */}
              {!contentQuery.isLoading && !contentQuery.isError && cards.length === 0 && (
                <div className="p-12 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-4 my-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                    <Icon name="photo_camera" className="text-[32px]" />
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-lg">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      {searchQuery
                        ? `No reels matching "${searchQuery}"`
                        : activeCollectionId
                        ? "No reels in this collection yet"
                        : "No Saved Reels in Your Library"}
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      {searchQuery
                        ? "Try searching for another keyword or clear the search filter."
                        : activeCollectionId
                        ? "Add reels to this collection to organize your knowledge base."
                        : "Connect your Instagram account to start syncing and indexing your saved reels."}
                    </p>
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Real User Cards Grid */}
              {!contentQuery.isLoading && cards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {cards.map((card) => (
                    <LibraryCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </section>

            <LibraryPagination
              hasMore={!!nextCursor}
              canPrev={cursorHistory.length > 0}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
              isFetching={contentQuery.isFetching}
            />
          </div>
        </div>
      </div>
    </main>
  );
}