import type { AuthenticatedUser } from "@repo/auth-guard";

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}
