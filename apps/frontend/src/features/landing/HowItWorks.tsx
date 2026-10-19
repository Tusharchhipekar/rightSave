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
    tag: "LINK",
    title: "Connect your Instagram",
    body: "Click Connect Instagram in the app to get a short code, then send that code to RightSave in a DM. You only do this once.",
    icon: "link",
    iconColor: "text-primary",
    chipTitle: "One-time link",
    chipSub: "Send the code in a DM",
  },
  {
    num: "02",
    tag: "SAVE",
    title: "Send reels in a DM",
    body: (
      <>
        Share any reel to <span className="text-primary font-mono font-medium">@rightsave.cloud</span> on
        Instagram. Reply with a name right after and your reels go into a collection.
      </>
    ),
    icon: "send",
    iconColor: "text-secondary",
    chipTitle: "Instagram DM",
    chipSub: "Share, then name a collection",
  },
  {
    num: "03",
    tag: "ASK",
    title: "Transcribed, summarized, searchable",
    body: "RightSave transcribes the audio, reads the caption and hashtags, writes a summary, and indexes it. Then you can search your library or chat with your saved reels.",
    icon: "saved_search",
    iconColor: "text-primary",
    chipTitle: "Search and chat",
    chipSub: "Ask in your own words",
  },
];

const PIPELINE = [
  { icon: "photo_camera_front", color: "text-secondary", title: "Instagram", sub: "Reels you share" },
  { icon: "forward_to_inbox", color: "text-primary", title: "RightSave DM Bot", sub: "Saves it and queues it" },
  { icon: "graphic_eq", color: "text-secondary", title: "AI Comprehension", sub: "Transcript + summary" },
  { icon: "manage_search", color: "text-primary", title: "Search & Chat", sub: "Find it or ask about it" },
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
          From a reel you share on Instagram to answers you can search and chat with, in 3 steps.
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