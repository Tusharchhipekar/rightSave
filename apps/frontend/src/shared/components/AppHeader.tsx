/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "@/features/landing/Icon";

const NAV = [
  { label: "Search", href: "#" },
  { label: "Library", href: "/library" },
  { label: "Collections", href: "/collections" },
  { label: "How It Works", href: "/" },
  { label: "Pricing", href: "/pricing" },
];

export default function AppHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg shrink-0">
          <Link className="flex items-center gap-space-sm" href="/">
            <img
              alt="RightSave Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WO7s40FWwNTHaIFmCFZVf8-LRLBogvwq11TH_t5gGPCtXiixJPEDdjbLHkTBCamAoYNT8pz7lSAwpl0SCR3uBgI7uEZG1-m_tX0l3Jk5Ku4Ru_X63u0jyBRwe0JFXmQmTdBM7r_KXXLS_CGn0IFHF5YZsAd5zVHB6VKCCk3b1fx_3SC0uPivqsAvQirx9M1tSIiNkdEnPj5EeWbVE7TM0ePoREA6NisqeP1_bxMeA0OQ"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
              RightSave
              <span className="text-primary text-body-sm font-label-code-sm ml-space-xs px-space-xs py-0.5 rounded-[0.125rem] bg-surface-container-high">
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
            className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-sm hover:bg-primary hover:text-on-primary transition-all font-medium shadow-[0_2px_12px_rgba(128,131,255,0.25)]"
            type="button"
          >
            <Icon name="sync" className="text-[18px]" />
            <span className="hidden sm:inline">Connect Instagram</span>
          </button>
          <Link
            href="/logout"
            title="Log out"
            className="w-8 h-8 rounded-[0.75rem] bg-primary flex items-center justify-center"
          >
            <Icon name="person" className="text-on-primary text-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}