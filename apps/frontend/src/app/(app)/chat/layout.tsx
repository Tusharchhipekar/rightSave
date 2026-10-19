import type { ReactNode } from "react";
import ChatSidebar from "@/features/chat/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 bg-surface flex">
      <ChatSidebar />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">{children}</main>
    </div>
  );
}