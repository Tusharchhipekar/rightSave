"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Icon from "@/features/landing/Icon";
import { libraryApi, formatRelativeTime } from "@/features/library/api";

export default function ChatSidebar() {
  const pathname = usePathname();

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => (await libraryApi.listConversations()).items,
    staleTime: 15000,
  });

  const items = query.data ?? [];

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col gap-space-sm p-space-md border-r border-outline-variant/20 bg-surface-container-lowest/40 min-h-0">
      <Link
        href="/chat"
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-body-sm transition-all ${
          pathname === "/chat"
            ? "bg-primary text-on-primary"
            : "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary"
        }`}
      >
        <Icon name="add" className="text-[18px]" />
        New chat
      </Link>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-1">
        {query.isLoading &&
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-surface-container-low animate-pulse"
            />
          ))}

        {query.isError && (
          <button
            type="button"
            onClick={() => query.refetch()}
            className="px-3 py-2 rounded-xl bg-surface-container text-error text-body-sm text-left cursor-pointer"
          >
            Could not load chats. Retry
          </button>
        )}

        {!query.isLoading && !query.isError && items.length === 0 && (
          <p className="px-2 py-3 text-body-sm text-on-surface-variant">
            No chats yet. Ask something about your saved reels.
          </p>
        )}

        {items.map((c) => {
          const active = pathname === `/chat/${c.id}`;
          return (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                active
                  ? "bg-surface-container-high text-on-surface"
                  : "hover:bg-surface-container text-on-surface-variant"
              }`}
            >
              <span className="text-body-sm font-medium truncate text-on-surface">
                {c.title || "Untitled chat"}
              </span>
              <span className="flex items-center justify-between gap-2 text-label-code-sm text-outline">
                <span className="truncate">{c.lastMessageText ?? ""}</span>
                {c.lastMessageAt && (
                  <span className="shrink-0">
                    {formatRelativeTime(c.lastMessageAt)}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}