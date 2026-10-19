"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import Icon from "@/features/landing/Icon";
import { libraryApi, type InstagramStatus } from "@/features/library/api";

const NAV = [
  { label: "Search", href: "/library" },
  { label: "Chat", href: "/chat" },
  { label: "Library", href: "/library" },
  { label: "How It Works", href: "/" },
];

export default function AppHeader() {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenConnect = async () => {
    setShowModal(true);
    setLoading(true);
    try {
      const igStatus = await libraryApi.getInstagramStatus();
      setStatus(igStatus);
      if (!igStatus.linked) {
        const codeRes = await libraryApi.createInstagramLinkCode();
        setLinkCode(codeRes.code);
      }
    } catch (err) {
      console.error("Failed to load Instagram link status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-outline-variant/20">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-lg shrink-0">
            <Link className="flex items-center gap-space-sm" href="/">
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
                  key={item.label}
                  className="px-space-sm py-1.5 rounded-lg text-on-surface-variant font-body-sm text-body-sm hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 max-w-xl mx-space-sm hidden md:block"></div>
          <div className="flex items-center gap-space-md shrink-0">
            <button
              onClick={handleOpenConnect}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-sm hover:bg-primary hover:text-on-primary transition-all font-medium shadow-[0_2px_12px_rgba(128,131,255,0.25)] cursor-pointer"
              type="button"
            >
              <Icon name="sync" className="text-[18px]" />
              <span className="hidden sm:inline">Connect Instagram</span>
            </button>
            <Link
              href="/logout"
              title="Log out"
              className="w-8 h-8 rounded-[0.75rem] bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors"
            >
              <Icon name="person" className="text-primary text-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Instagram Connect Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white">
                  <Icon name="photo_camera" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Connect Instagram
                  </h3>
                  <p className="text-label-code-sm text-on-surface-variant">
                    Sync saved reels directly into your AI library
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Icon name="progress_activity" className="text-primary text-[28px] animate-spin" />
                <span className="text-body-sm text-on-surface-variant">Checking connection status...</span>
              </div>
            ) : status?.linked ? (
              <div className="p-5 rounded-xl bg-secondary-container/20 border border-secondary/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-secondary font-semibold">
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Account Connected!</span>
                </div>
                <p className="text-body-sm text-on-surface">
                  Linked as <strong className="text-primary">@{status.username}</strong>
                </p>
                <span className="text-label-code-sm text-outline">
                  Connected on {new Date(status.connectedAt ?? "").toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center gap-3 text-center">
                  <span className="text-body-sm text-on-surface-variant">
                    Send this one-time link code to our Instagram Bot:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-label-code text-xl font-bold tracking-wider px-4 py-2 rounded-xl bg-surface-container text-primary border border-primary/30">
                      {linkCode || "Generating code..."}
                    </span>
                    {linkCode && (
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                        title="Copy code"
                      >
                        <Icon name={copied ? "check" : "content_copy"} className="text-[20px] text-primary" />
                      </button>
                    )}
                  </div>
                  {copied && (
                    <span className="text-label-code-sm text-secondary font-medium animate-fade-in">
                      Copied to clipboard!
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 text-body-sm text-on-surface-variant">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-label-code-sm shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Send your code to our official bot <strong>@rightsave.cloud</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-label-code-sm shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Paste and send <strong>{linkCode}</strong> in the chat.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-label-code-sm shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Once connected, share any Reel directly to <strong>@rightsave.cloud</strong> to index it automatically!</span>
                  </div>
                </div>

                <a
                  href="https://ig.me/m/rightsave.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold text-body-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity mt-1"
                >
                  <Icon name="chat" className="text-[18px]" />
                  <span>Open Chat with @rightsave.cloud</span>
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-medium text-body-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}