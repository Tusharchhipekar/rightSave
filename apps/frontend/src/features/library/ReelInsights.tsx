import ReactMarkdown from "react-markdown";
import Icon from "@/features/landing/Icon";
import type { ReelDetail, RichPart } from "./types";
import ReelAskBar from "./ReelAskBar";

const INNER = "shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)]";

function Rich({ parts }: { parts: RichPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <span key={i} className={p.className}>
            {p.text}
          </span>
        ),
      )}
    </>
  );
}

type ReelInsightsProps = Pick<ReelDetail, "title" | "summary" | "takeaways"> & {
  contentId?: string;
};

export default function ReelInsights({
  title,
  summary,
  takeaways,
  contentId,
}: ReelInsightsProps) {
  return (
    <div className="lg:col-span-7 w-full flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-sm p-space-lg rounded-2xl bg-surface-container-low shadow-md">
        <div className="flex items-center gap-space-xs">
          <span className="text-outline text-body-sm">•</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{title}</h1>
        <div className={`p-space-md rounded-xl bg-surface-container flex items-start gap-space-sm ${INNER} mt-space-xs`}>
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="lightbulb" className="text-[18px]" />
          </div>
          <div className="min-w-0 font-body-lg text-body-md text-on-surface leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-xs">
          <div className="flex items-center gap-2">
            <Icon name="format_list_bulleted" className="text-secondary text-[20px]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Timestamped Semantic Takeaways
            </h2>
          </div>
          <span className="font-label-code-sm text-outline text-label-code-sm">{takeaways.length} Key Moments</span>
        </div>
        <div className="flex flex-col gap-space-sm">
          {takeaways.map((t) => (
            <div
              key={t.time}
              className="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-space-md group"
            >
              <button
                className={
                  t.active
                    ? "px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container font-label-code text-label-code font-semibold shrink-0 shadow-xs"
                    : "px-2.5 py-1 rounded-lg bg-surface-container-highest group-hover:bg-primary-container text-primary group-hover:text-on-primary-container font-label-code text-label-code font-semibold shrink-0 transition-colors shadow-xs"
                }
                type="button"
              >
                {t.time}
              </button>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">{t.title}</span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <Rich parts={t.body} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReelAskBar contentId={contentId} />
    </div>
  );
}