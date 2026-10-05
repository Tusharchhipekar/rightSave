import { config } from "../config/config";

const BASE = "https://api.mistral.ai/v1";
const EMBED_DIMS = 1024;
const MAX_EMBED_CHARS = 24000;

export class UpstreamError extends Error {
  constructor(
    public service: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatOptions = {
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
};

async function post<T>(
  path: string,
  body: unknown,
  timeoutMs: number,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.mistral.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(
      "mistral",
      res.status,
      `mistral ${res.status}: ${text.slice(0, 200)}`,
    );
  }
  return (await res.json()) as T;
}

export async function embedText(text: string): Promise<number[]> {
  const data = await post<{ data?: { embedding: number[] }[] }>(
    "/embeddings",
    {
      model: config.mistral.embedModel,
      input: [text.slice(0, MAX_EMBED_CHARS)],
    },
    15_000,
  );
  const emb = data.data?.[0]?.embedding;
  if (!emb || emb.length !== EMBED_DIMS) {
    throw new Error(
      `embedding has ${emb?.length ?? 0} dims, expected ${EMBED_DIMS}`,
    );
  }
  return emb;
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  const data = await post<{
    choices?: { message?: { content?: string | { text?: string }[] } }[];
  }>(
    "/chat/completions",
    {
      model: config.mistral.chatModel,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 800,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    },
    60_000,
  );

  const raw = data.choices?.[0]?.message?.content;
  const content = Array.isArray(raw)
    ? raw.map((c) => c.text ?? "").join("")
    : raw;
  if (!content || !content.trim()) {
    throw new Error("mistral returned an empty completion");
  }
  return content.trim();
}