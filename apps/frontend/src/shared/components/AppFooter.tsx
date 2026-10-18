import Link from "next/link";

const LINKS = [
  { label: "Library", href: "/library" },
  { label: "Pricing", href: "/pricing" },
  { label: "Settings", href: "/settings" },
];

export default function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest py-space-xl mt-space-xl">
      <div className="w-full px-margin flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm text-on-surface">RightSave AI</span>
          <span>© 2026 Semantic Reel Memory. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-space-lg">
          {LINKS.map((l) => (
            <Link key={l.label} className="hover:text-on-surface transition-colors" href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}