/* eslint-disable @next/next/no-img-element */
import Icon from "./Icon";
import type { DemoReel } from "./demo-data";

export default function ReelCard({ reel }: { reel: DemoReel }) {
  return (
    <div className="rounded-xl bg-surface-container p-space-md flex flex-col justify-between shadow-lg hover:bg-surface-container-high transition-all">
      <div className="flex flex-col gap-3">
        <div className="relative w-full aspect-[9/12] rounded-lg overflow-hidden bg-surface-container-lowest">
          {reel.image ? (
            <img className="w-full h-full object-cover" src={reel.image} alt={reel.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary-container/20 text-on-surface-variant">
              <Icon name="movie" className="text-[40px]" />
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-primary font-label-code-sm text-label-code-sm">
            {reel.match}
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-code-sm text-label-code-sm flex items-center gap-1">
            <Icon name="schedule" className="text-[12px]" /> {reel.duration}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm text-secondary">
              {reel.handle}
            </span>
            <Icon name="bookmark" filled className="text-secondary text-[18px]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{reel.title}</h3>
        </div>

        <div className="rounded-lg bg-surface-container-lowest p-2.5">
          <div className="flex items-center gap-1 text-primary font-label-code-sm text-label-code-sm mb-1">
            <Icon name="psychology" className="text-[14px]" />
            <span>AI Extracted Key Takeaway</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            {reel.summary}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2 flex items-center justify-between text-on-surface-variant font-label-code-sm text-label-code-sm">
        <span>{reel.saved}</span>
        <span className="text-primary hover:underline cursor-pointer flex items-center gap-0.5">
          Jump to reel <Icon name="open_in_new" className="text-[12px]" />
        </span>
      </div>
    </div>
  );
}