"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { useBootstrapSession } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store";


const NAV = [
  { label: "Library", href: "/library" },
  { label: "Collections", href: "/collections" },
  { label: "Pricing", href: "/pricing" },
];

export default function Header() {
  const status = useBootstrapSession();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthed = status === "authenticated";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg flex-shrink-0">
          <Link href="/" className="flex items-center gap-space-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container/20 text-primary border border-primary-container/30 shadow-sm">
              <Icon name="sync_saved_locally" className="text-[22px]" />
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
              RightSave
              <span className="text-primary text-body-sm font-label-code-sm ml-space-xs px-space-xs py-0.5 rounded bg-surface-container-high">
                AI
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-lowest/60">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-space-sm py-1.5 rounded-lg text-on-surface-variant font-body-sm text-body-sm hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-space-sm flex-shrink-0">
          {/* Desktop Auth Section */}
          <div className="hidden sm:flex items-center">
            {isAuthed ? (
              <div className="flex items-center gap-space-xs">
                <span className="text-xs text-on-surface-variant font-medium hidden md:inline">
                  {user?.username ? `@${user.username}` : user?.email}
                </span>
                <Link
                  href="/logout"
                  className="px-space-sm py-1.5 rounded-lg text-on-surface-variant font-body-sm hover:text-error hover:bg-error-container/30 transition-colors font-medium"
                >
                  Log out
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-body-sm hover:text-on-surface hover:bg-surface-container-high transition-colors font-medium"
              >
                Log in
              </Link>
            )}
          </div>

          {/* Desktop Speed Trial Section */}
          <Link
            href={isAuthed ? "/library" : "/login"}
            className="hidden sm:flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-sm hover:bg-primary hover:text-on-primary transition-all font-medium shadow-[0_2px_12px_rgba(128,131,255,0.25)]"
          >
            <Icon name="bolt" className="text-[18px]" />
            <span>Start Free Trial</span>
          </Link>


          {/* Mobile Speed Trial & Auth Icon Button */}
          <div className="relative sm:hidden">
            <button
              type="button"
              aria-label="Open Start Free Trial, login, and logout"
              aria-expanded={menuOpen}
              aria-controls="auth-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(128,131,255,0.25)] hover:bg-primary transition-colors"
            >
              <Icon name="bolt" className="text-[20px]" />
            </button>
            {menuOpen ? (
              <div
                id="auth-menu"
                className="absolute right-0 top-12 z-50 min-w-52 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-xl divide-y divide-outline-variant/30"
              >
                {/* Speed Trial Section */}
                <div className="p-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                    Speed Trial
                  </div>
                  <Link
                    href={isAuthed ? "/library" : "/login"}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-on-surface bg-primary-container/20 hover:bg-primary-container/30 transition-colors"
                  >
                    <Icon name="bolt" className="text-primary text-[18px]" />
                    <span>Start Free Trial</span>
                  </Link>
                </div>

                {/* Account / Auth Section */}
                <div className="p-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Account
                  </div>
                  {isAuthed ? (
                    <>
                      <div className="px-3 py-1 text-xs text-on-surface-variant truncate">
                        {user?.username ? `@${user.username}` : user?.email}
                      </div>
                      <Link
                        href="/logout"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/30 transition-colors"
                      >
                        <Icon name="logout" className="text-[18px]" />
                        <span>Log out</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-bright transition-colors"
                    >
                      <Icon name="login" className="text-[18px]" />
                      <span>Log in</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
