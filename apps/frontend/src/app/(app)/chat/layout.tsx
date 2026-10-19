import type { ReactNode } from "react";
import ChatSidebar from "@/features/chat/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full pt-16 h-screen bg-surface flex">
      <ChatSidebar />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">{children}</main>
    </div>
  );
}