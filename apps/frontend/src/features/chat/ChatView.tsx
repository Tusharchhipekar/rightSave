"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import Icon from "@/features/landing/Icon";
import {
  libraryApi,
  type ChatMessage,
  type ConversationDetail,
} from "@/features/library/api";
import { ApiError } from "@/shared/lib/api-client";

const SUGGESTIONS = [
  "What did I save about recipes?",
  "Summarize my most recent saves",
  "Which reels mention tools or apps I should try?",
];

type Source =
  | { type: "saved"; contentId: string }
  | { type: "web"; url: string; title?: string };

function parseSources(raw: unknown): Source[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is Source =>
      !!s &&
      typeof s === "object" &&
      ((s as Source).type === "saved" || (s as Source).type === "web"),
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SourceChips({ raw }: { raw: unknown }) {
  const sources = parseSources(raw);
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sources.map((s, i) =>
        s.type === "saved" ? (
          <Link
            key={`${s.contentId}-${i}`}
            href={`/library/${s.contentId}`}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-label-code-sm hover:bg-primary/20 transition-colors"
          >
            <Icon name="bookmark" className="text-[14px]" />
            Saved reel
          </Link>
        ) : (
          <a
            key={`${s.url}-${i}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-label-code-sm hover:text-on-surface transition-colors max-w-[220px]"
          >
            <Icon name="public" className="text-[14px] shrink-0" />
            <span className="truncate">{s.title || hostname(s.url)}</span>
          </a>
        ),
      )}
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-primary-container text-on-primary-container text-body-sm whitespace-pre-wrap">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-sm leading-relaxed">
        <div className="[&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline">
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
        <SourceChips raw={m.sources} />
      </div>
    </div>
  );
}

export default function ChatView({
  conversationId,
}: {
  conversationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const convQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => libraryApi.getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 30000,
    retry: (count, err) =>
      !(err instanceof ApiError && err.status === 404) && count < 1,
  });

  const messages = convQuery.data?.messages ?? [];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      libraryApi.chat({ message, conversationId }),
    onSuccess: (res, message) => {
      const now = new Date().toISOString();
      const stamp = Date.now();
      const userMsg: ChatMessage = {
        id: `u-${stamp}`,
        role: "user",
        content: message,
        sources: null,
        toolsUsed: null,
        createdAt: now,
      };
      const aiMsg: ChatMessage = {
        id: `a-${stamp}`,
        role: "assistant",
        content: res.answer,
        sources: res.sources ?? null,
        toolsUsed: res.toolsUsed ?? null,
        createdAt: now,
      };
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", res.conversationId],
        (prev) => ({
          id: res.conversationId,
          title: prev?.title ?? message.slice(0, 60),
          messages: [...(prev?.messages ?? []), userMsg, aiMsg],
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setPending(null);
      if (!conversationId) router.replace(`/chat/${res.conversationId}`);
    },
    onError: (err: Error, message) => {
      setPending(null);
      setInput(message);
      setError(err.message || "Could not get an answer. Please try again.");
    },
  });

  const loadingHistory = !!conversationId && convQuery.isLoading;
  const busy = sendMutation.isPending || loadingHistory;

  const send = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setError(null);
    setInput("");
    setPending(message);
    sendMutation.mutate(message);
  };

  if (conversationId && convQuery.isError) {
    const notFound =
      convQuery.error instanceof ApiError && convQuery.error.status === 404;
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center text-center gap-4 max-w-md">
          <Icon
            name={notFound ? "search_off" : "cloud_off"}
            className="text-[32px] text-error"
          />
          <h2 className="text-headline-md font-bold text-on-surface">
            {notFound ? "Chat not found" : "Could not load chat"}
          </h2>
          {notFound ? (
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm"
            >
              Start a new chat
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => convQuery.refetch()}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-body-sm cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const empty = messages.length === 0 && !pending && !loadingHistory;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-space-md md:px-space-lg py-space-lg"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-space-md">
          {loadingHistory && (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-10 w-1/2 ml-auto rounded-2xl bg-surface-container-low" />
              <div className="h-24 w-3/4 rounded-2xl bg-surface-container-low" />
            </div>
          )}

          {empty && (
            <div className="flex flex-col items-center text-center gap-space-md py-space-xl">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="auto_awesome" className="text-[30px]" />
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Ask your saved reels
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-md">
                I search everything you saved and answer from it. I use the web
                only when your library is not enough.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-body-sm border border-outline-variant/20 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}

          {pending && (
            <>
              <div className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-primary-container text-on-primary-container text-body-sm whitespace-pre-wrap">
                  {pending}
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface-variant text-body-sm w-fit animate-pulse">
                <Icon
                  name="progress_activity"
                  className="text-primary text-[18px] animate-spin"
                />
                Searching your library...
              </div>
            </>
          )}

        </div>
      </div>

      <div className="px-space-md md:px-space-lg pb-space-md pt-space-xs">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/30 text-error text-body-sm flex items-center gap-2">
              <Icon name="error" className="text-[18px] shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => send()}
                className="font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={busy}
              placeholder="Ask anything about your saved reels..."
              className="flex-1 px-4 py-3 rounded-xl bg-surface-container text-on-surface placeholder:text-outline text-body-sm shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={!input.trim() || busy}
              className="px-4 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium text-body-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {sendMutation.isPending ? (
                <Icon name="progress_activity" className="text-[18px] animate-spin" />
              ) : (
                <Icon name="send" className="text-[18px]" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}