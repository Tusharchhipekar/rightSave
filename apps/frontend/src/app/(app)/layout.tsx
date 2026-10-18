import { AuthGuard } from "@/shared/components/AuthGuard";
import AppHeader from "@/shared/components/AppHeader";
import AppFooter from "@/shared/components/AppFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppHeader />
      {children}
      <AppFooter />
    </AuthGuard>
  );
}