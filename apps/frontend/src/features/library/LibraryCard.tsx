/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "@/features/landing/Icon";
import type { LibraryCardData } from "./types";

type Props = { card: LibraryCardData; onRemove?: () => void };

export default function LibraryCard({ card: c, onRemove }: Props) {
  return (
    <div className="relative flex">
      <Link href={`/library/${c.id}`} className="flex flex-1">
        <article className="flex-1 flex flex-col rounded-2xl bg-surface-container-low overflow-hidden shadow-md group hover:bg-surface-container transition-all duration-300">
          <div className="relative w-full aspect-[9/10] overflow-hidden bg-surface-container-highest">
            {c.image ? (
              <img
                alt={c.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={c.image}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-surface-container to-surface-container-highest flex flex-col items-center justify-center gap-2 text-outline group-hover:text-primary transition-colors">
                <Icon name="image" className="text-4xl text-primary/70 group-hover:scale-110 transition-transform" />
                <span className="font-label-code-sm text-[11px] text-on-surface-variant font-medium">Reel Snapshot</span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-surface-container-low/20 to-transparent"></div>
            {c.creator && (
              <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-code-sm text-label-code-sm font-bold">
                    {c.creator.initials}
                  </div>
                  <span className="font-label-code text-label-code text-on-surface font-medium drop-shadow-md">
                    {c.creator.handle}
                  </span>
                </div>
                <span className="font-label-code-sm text-label-code-sm px-2 py-0.5 rounded-[0.125rem] bg-surface-container-high/90 text-on-surface-variant backdrop-blur-sm">
                  {c.creator.audio}
                </span>
              </div>
            )}
          </div>
          <div className="p-space-md flex flex-col gap-space-sm flex-1 justify-between">
            <div className="flex flex-col gap-space-xs">
              <h3
                className={`font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight ${c.hover} transition-colors`}
              >
                {c.title}
              </h3>
              <div className="p-2.5 rounded-lg bg-surface-container/60 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)] flex items-start gap-2">
                <Icon name="auto_fix_high" className={`${c.accent} text-[16px] mt-0.5 shrink-0`} />
                <p className="font-body-sm text-body-sm text-on-surface leading-snug">{c.takeaway}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {c.chips.map(([label, cls]) => (
                <span
                  key={label}
                  className={`px-2 py-0.5 rounded-[0.125rem] ${cls} font-label-code-sm text-label-code-sm`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-code-sm text-label-code-sm">{c.saved}</span>
              <span className={`flex items-center gap-1 ${c.footColor} font-label-code-sm text-label-code-sm`}>
                <Icon name={c.footIcon} className="text-[14px]" />
                {c.footText}
              </span>
            </div>
          </div>
        </article>
      </Link>
      {onRemove && (
        <button
          type="button"
          title="Remove from collection"
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-surface-container-lowest/80 backdrop-blur-md text-on-surface hover:text-error flex items-center justify-center border border-outline-variant/30 cursor-pointer"
        >
          <Icon name="close" className="text-[16px]" />
        </button>
      )}
    </div>
  );
}