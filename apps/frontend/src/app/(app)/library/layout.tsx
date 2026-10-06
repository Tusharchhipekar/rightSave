import type { ReactNode } from "react";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}