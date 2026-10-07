import Link from "next/link";

const LINKS = [
  { label: "Library", href: "/library" },
  { label: "Pricing", href: "/pricing" },
  { label: "Settings", href: "/settings" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest py-space-xl mt-space-xl">
      <div className="w-full px-margin flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm text-on-surface">RightSave AI</span>
          <span>© 2026&nbsp; All rights reserved.</span>
        </div>
        <div className="flex items-center gap-space-lg">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-on-surface transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}