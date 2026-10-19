"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/features/landing/Icon";
import { libraryApi, type ChatResponse } from "./api";

type ReelAskBarProps = {
  contentId?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources?: any;
};

const SUGGESTIONS = [
  "Summarize key takeaways",
  "What tools or libraries are mentioned?",
  "What are the step-by-step instructions?",
];

export default function ReelAskBar({ contentId }: ReelAskBarProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend ?? input).trim();
    if (!question || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res: ChatResponse = await libraryApi.chat({
        message: question,
        contentId,
        conversationId,
      });

      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          sources: res.sources,
        },
      ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[ReelAskBar] chat failed:", err);
      setError(err?.message || "Failed to get AI answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col gap-space-sm p-space-lg rounded-2xl bg-surface-container-low shadow-md border border-outline-variant/30">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
        <div className="flex items-center gap-space-xs">
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Icon name="auto_awesome" className="text-[18px]" />
          </div>
          <h3 className="font-headline-sm text-body-md text-on-surface font-semibold">
            Ask AI About This Reel
          </h3>
        </div>
        <span className="font-label-code-sm text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Grounded In Video & OCR
        </span>
      </div>

      {messages.length > 0 && (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 my-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-3 rounded-xl max-w-[90%] text-body-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary-container text-on-primary-container font-medium"
                    : "bg-surface-container text-on-surface border border-outline-variant/30"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center gap-1.5 text-secondary text-label-code-sm font-semibold mb-1">
                    <Icon name="smart_toy" className="text-[14px]" />
                    <span>RightSave Intelligence</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container text-on-surface-variant max-w-xs animate-pulse">
              <Icon name="progress_activity" className="text-primary text-[18px] animate-spin" />
              <span className="text-body-sm">Synthesizing answer from reel...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/30 text-error text-body-sm flex items-center gap-2">
          <Icon name="error" className="text-[18px] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 my-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-label-code-sm font-medium transition-colors border border-outline-variant/20"
            >
              💡 {s}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full flex items-center gap-2 mt-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask anything (e.g. 'What framework did they use?')..."
            className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-container text-on-surface placeholder:text-outline text-body-sm font-body-sm shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)] focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium text-body-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <Icon name="progress_activity" className="text-[18px] animate-spin" />
          ) : (
            <Icon name="send" className="text-[18px]" />
          )}
          <span className="hidden sm:inline">Ask</span>
        </button>
      </div>
    </div>
  );
}
