import { apiClient } from "@/shared/lib/api-client";
import type { LibraryCardData } from "./types";

export type ContentStatus = "pending" | "processing" | "ready" | "failed";

export type ContentItem = {
  id: string;
  type: "reel" | "post" | "screenshot" | "tweet" | "notion_page" | string;
  mediaType: "image" | "video" | "carousel" | null;
  ingestSource: string;
  sourceUrl: string;
  creatorUsername: string | null;
  caption: string | null;
  tags: string[];
  hashtags: string[];
  thumbnailUrl: string | null;
  status: ContentStatus;
  createdAt: string;
};

export type ContentDetail = ContentItem & {
  summary: string | null;
  transcript: string | null;
  ocrText: string | null;
  visionCaption: string | null;
  duplicateOfId: string | null;
  updatedAt: string;
};

export type CollectionItem = {
  id: string;
  name: string;
  createdAt: string;
  contentCount: number;
};

export type SearchResponse = {
  query: string;
  semantic: boolean;
  folders: CollectionItem[];
  content: ContentItem[];
};

export type ChatMessagePayload = {
  message: string;
  contentId?: string;
  conversationId?: string;
};

export type ChatResponse = {
  conversationId: string;
  answer: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolsUsed?: any;
};

export type ConversationItem = {
  id: string;
  title: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: unknown;
  toolsUsed: unknown;
  createdAt: string;
};

export type ConversationDetail = {
  id: string;
  title: string | null;
  messages: ChatMessage[];
};

export type InstagramStatus = {
  linked: boolean;
  username: string | null;
  connectedAt: string | null;
};

export type InstagramLinkCode = {
  code: string;
  expiresInSeconds: number;
};

export const libraryApi = {
  listContent: (params?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    const qs = query.toString();
    return apiClient<{ items: ContentItem[]; nextCursor: string | null }>(
      `/content${qs ? `?${qs}` : ""}`,
    );
  },

  getContent: (id: string) => apiClient<ContentDetail>(`/content/${id}`),

  deleteContent: (id: string) =>
    apiClient<void>(`/content/${id}`, { method: "DELETE" }),

  search: (q: string, type?: string, limit?: number) => {
    const query = new URLSearchParams({ q });
    if (type) query.set("type", type);
    if (limit) query.set("limit", String(limit));
    return apiClient<SearchResponse>(`/search?${query.toString()}`);
  },

  listCollections: () => apiClient<{ items: CollectionItem[] }>("/collections"),

  createCollection: (name: string) =>
    apiClient<CollectionItem>("/collections", {
      method: "POST",
      body: { name },
    }),

  renameCollection: (id: string, name: string) =>
    apiClient<CollectionItem>(`/collections/${id}`, {
      method: "PATCH",
      body: { name },
    }),

  deleteCollection: (id: string) =>
    apiClient<void>(`/collections/${id}`, { method: "DELETE" }),

  listCollectionContent: (
    collectionId: string,
    params?: { limit?: number; cursor?: string },
  ) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    const qs = query.toString();
    return apiClient<{ items: ContentItem[]; nextCursor: string | null }>(
      `/collections/${collectionId}/content${qs ? `?${qs}` : ""}`,
    );
  },

  addToCollection: (collectionId: string, contentId: string) =>
    apiClient<void>(`/collections/${collectionId}/content`, {
      method: "POST",
      body: { contentId },
    }),

  removeFromCollection: (collectionId: string, contentId: string) =>
    apiClient<void>(`/collections/${collectionId}/content/${contentId}`, {
      method: "DELETE",
    }),

  chat: (payload: ChatMessagePayload) =>
    apiClient<ChatResponse>("/chat", {
      method: "POST",
      body: payload,
    }),

  listConversations: () =>
    apiClient<{ items: ConversationItem[] }>("/chat/conversations"),

  getConversation: (id: string) =>
    apiClient<ConversationDetail>(`/chat/conversations/${id}/messages`),

  getInstagramStatus: () => apiClient<InstagramStatus>("/instagram/status"),

  createInstagramLinkCode: () =>
    apiClient<InstagramLinkCode>("/instagram/link-code", { method: "POST" }),
};

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function mapContentToCard(item: ContentItem): LibraryCardData {
  const initials = item.creatorUsername
    ? item.creatorUsername.slice(0, 2).toUpperCase()
    : "RS";
  const handle = item.creatorUsername
    ? `@${item.creatorUsername}`
    : "@rightsave";

  const chips: [label: string, className: string][] = [];
  chips.push([
    item.type.toUpperCase(),
    "bg-surface-container-high text-primary",
  ]);
  if (item.status === "ready") {
    chips.push(["INDEXED", "bg-secondary/15 text-secondary font-medium"]);
  } else if (item.status === "processing") {
    chips.push([
      "PROCESSING",
      "bg-tertiary/15 text-tertiary font-medium animate-pulse",
    ]);
  } else {
    chips.push([
      item.status.toUpperCase(),
      "bg-surface-container-high text-outline",
    ]);
  }

  for (const tag of item.tags.slice(0, 2)) {
    chips.push([tag, "bg-surface-container-high text-on-surface-variant"]);
  }
  for (const ht of item.hashtags.slice(0, 2)) {
    chips.push([`#${ht}`, "bg-surface-container-high text-on-surface-variant"]);
  }

  const title =
    item.caption && item.caption.trim()
      ? item.caption.split("\n")[0].slice(0, 70)
      : `Saved ${item.type} Node`;

  const takeaway =
    item.caption && item.caption.trim()
      ? item.caption.length > 70
        ? item.caption.slice(70, 210).trim() + "..."
        : item.caption
      : "Indexed reel content ready for semantic search, transcript review, and AI query.";

  return {
    id: item.id,
    alt: item.caption ? item.caption.slice(0, 60) : "Saved reel preview",
    image: item.thumbnailUrl || undefined,
    creator: {
      initials,
      handle,
      audio: item.mediaType ? `${item.mediaType.toUpperCase()}` : "Reel Audio",
    },
    title,
    hover: "group-hover:text-primary",
    accent: "text-primary",
    takeaway,
    chips,
    saved: formatRelativeTime(item.createdAt),
    footIcon: item.status === "ready" ? "auto_awesome" : "schedule",
    footText:
      item.status === "ready" ? "Semantic Ready" : `Status: ${item.status}`,
    footColor: item.status === "ready" ? "text-secondary" : "text-outline",
  };
}
