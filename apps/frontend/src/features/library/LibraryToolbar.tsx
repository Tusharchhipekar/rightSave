"use client";

import { useState } from "react";
import Icon from "@/features/landing/Icon";
import type { CollectionItem } from "./api";

type LibraryToolbarProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  collections: CollectionItem[];
  totalCount: number;
  onCreateCollection?: (name: string) => Promise<void>;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
};

export default function LibraryToolbar({
  searchQuery,
  onSearchChange,
  activeCollectionId,
  onSelectCollection,
  collections,
  totalCount,
  onCreateCollection,
  statusFilter = "all",
  onStatusFilterChange,
}: LibraryToolbarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim() || creating || !onCreateCollection) return;
    setCreating(true);
    try {
      await onCreateCollection(newCollectionName.trim());
      setNewCollectionName("");
      setShowCreateDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm font-label-code-sm text-label-code-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5 hover:text-on-surface cursor-pointer transition-colors font-semibold">
              <Icon name="sync_saved_locally" className="text-[15px] text-primary" />
              RightSave
            </span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-medium">Personal Library</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary ml-space-xs animate-ping"></span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Your Reel Library
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Status filter dropdown */}
          {onStatusFilterChange && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low shadow-xs border border-outline-variant/30">
              {(["all", "ready", "processing"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusFilterChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-label-code-sm font-medium transition-all ${
                    statusFilter === st
                      ? "bg-primary-container text-on-primary-container font-semibold shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-body-sm font-semibold shadow-lg shadow-primary-container/20 hover:shadow-primary/30 transition-all cursor-pointer"
            type="button"
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>New Collection</span>
          </button>
        </div>
      </header>

      {/* New Collection Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Create New Collection
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g. Next.js SaaS, Home Interior, Workouts"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline border border-outline-variant/30 text-body-md focus:outline-none focus:border-primary"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface text-body-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim() || creating}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary text-body-sm font-semibold disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-space-md bg-surface-container-low/70 backdrop-blur-md p-space-md rounded-2xl shadow-md border border-outline-variant/20">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none">
            <Icon name="manage_search" className="text-primary text-[20px]" />
          </div>
          <input
            className="w-full pl-11 pr-24 py-3 rounded-xl bg-surface-container text-on-surface placeholder:text-outline text-body-md font-body-md shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)] focus:outline-none focus:bg-surface-container-high transition-all"
            placeholder="Search within library (e.g. 'high protein recipes' or 'Postgres setup')..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-space-md flex items-center text-outline hover:text-on-surface"
              title="Clear search"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          )}
        </div>

        {/* Collection filter pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap shadow-xs transition-all cursor-pointer ${
              activeCollectionId === null
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => onSelectCollection(null)}
            type="button"
          >
            <Icon name="all_inclusive" className="text-[14px]" />
            <span>All Reels</span>
            <span className="px-1.5 rounded-[0.75rem] bg-on-primary-container/20 text-on-primary-container font-label-code-sm text-label-code-sm">
              {totalCount}
            </span>
          </button>

          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() =>
                onSelectCollection(
                  activeCollectionId === col.id ? null : col.id,
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                activeCollectionId === col.id
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
              type="button"
            >
              <Icon name="folder" className="text-[14px] text-secondary" />
              <span>{col.name}</span>
              <span className="text-on-surface-variant font-label-code-sm text-label-code-sm">
                {col.contentCount}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}