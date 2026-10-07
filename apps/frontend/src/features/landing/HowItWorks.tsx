import type { ReactNode } from "react";
import Icon from "./Icon";

type Step = {
  num: string;
  tag: string;
  title: string;
  body: ReactNode;
  icon: string;
  iconColor: string;
  chipTitle: string;
  chipSub: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    tag: "SAVE",
    title: "Keep saving naturally",
    body: "Keep saving useful Reels on Instagram exactly as you already do. No change in your muscle memory or everyday browsing habits.",
    icon: "bookmark_add",
    iconColor: "text-primary",
    chipTitle: "Direct In-App Save",
    chipSub: "Tap bookmark icon in IG feed",
  },
  {
    num: "02",
    tag: "SYNC",
    title: "Seamless bot or auto-sync",
    body: (
      <>
        Share or forward your saved Reels directly to your dedicated{" "}
        <span className="text-primary font-mono">@rightsave_bot</span>, or authenticate continuous
        background synchronization.
      </>
    ),
    icon: "send",
    iconColor: "text-secondary",
    chipTitle: "Instagram / DM Dispatch",
    chipSub: "Immediate 1-tap ingestion",
  },
  {
    num: "03",
    tag: "RETRIEVE",
    title: "Audio & vision extraction",
    body: "RightSave extracts audio speech-to-text transcripts, visual frame OCR, and conceptual topics into your encrypted, private vector repository.",
    icon: "saved_search",
    iconColor: "text-primary",
    chipTitle: "Omniscient Recall",
    chipSub: "Query by fragment or theme",
  },
];

const PIPELINE = [
  { icon: "photo_camera_front", color: "text-secondary", title: "Instagram", sub: "Saved collections" },
  { icon: "forward_to_inbox", color: "text-primary", title: "RightSave DM Bot", sub: "Instant queue push" },
  { icon: "graphic_eq", color: "text-secondary", title: "AI Comprehension", sub: "Whisper + Vision OCR" },
  { icon: "bolt", color: "text-primary", title: "Instant Natural Query", sub: "Sub-50ms vector return" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-margin py-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="font-label-code text-label-code uppercase tracking-wider text-primary px-3 py-1 rounded bg-primary-container/20">
          The Architecture
        </span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mt-4 tracking-tight">
          How your reels turn into searchable intellect
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mt-3">
          From raw Instagram video streams to instantaneous, context-aware memory retrieval in 3
          transparent stages.
        </p>
      </div>

      {/* 3-step sequence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="rounded-2xl bg-surface-container p-space-lg flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-code text-headline-sm text-primary">{s.num}</span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary font-label-code-sm text-label-code-sm font-semibold">
                  {s.tag}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-4 font-semibold">
                {s.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">{s.body}</p>
            </div>
            <div className="mt-8 p-space-md rounded-xl bg-surface-container-low flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center ${s.iconColor}`}
              >
                <Icon name={s.icon} />
              </div>
              <div className="font-body-sm text-body-sm text-on-surface">
                <p className="font-medium">{s.chipTitle}</p>
                <p className="text-on-surface-variant font-label-code-sm text-label-code-sm">
                  {s.chipSub}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline diagram */}
      <div className="mt-12 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-xl">
        <div className="text-center font-label-code-sm text-label-code-sm text-on-surface-variant mb-6 uppercase tracking-wider">
          Pipeline Flow Diagram
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center text-center">
          {PIPELINE.map((p) => (
            <div
              key={p.title}
              className="p-4 rounded-xl bg-surface-container-low flex flex-col items-center"
            >
              <div
                className={`w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-2 ${p.color}`}
              >
                <Icon name={p.icon} className="text-[24px]" />
              </div>
              <span className="font-headline-sm text-body-sm text-on-surface font-semibold">
                {p.title}
              </span>
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                {p.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}