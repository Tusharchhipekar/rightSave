"use client";

import { use } from "react";
import ChatView from "@/features/chat/ChatView";

export default function ExistingChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ChatView key={id} conversationId={id} />;
}