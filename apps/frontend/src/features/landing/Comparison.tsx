import Icon from "./Icon";

type Item = { icon: string; title: string; body: string };

const BEFORE: Item[] = [
  {
    icon: "motion_photos_off",
    title: "Endless blind scrolling",
    body: "Forced to scroll through thousands of silent thumbnail grids trying to identify a single 15-second clip from months ago.",
  },
  {
    icon: "volume_off",
    title: "Lost audio tutorials",
    body: "Spoken recipes, software tips, and coding walkthroughs are invisible to native Instagram search because speech isn't indexed.",
  },
  {
    icon: "folder_off",
    title: "Unorganized digital mess",
    body: "Manual Instagram folders require tedious micro-management and constant tagging that nobody maintains after day two.",
  },
  {
    icon: "search_off",
    title: "Nobody to ask",
    body: "Instagram can't answer questions about what you saved. You can only scroll and hope you recognize it.",
  },
];

const AFTER: Item[] = [
  {
    icon: "manage_search",
    title: "Search by meaning",
    body: "Describe what you remember and RightSave finds the reel. It searches the caption, hashtags and what was said in the video.",
  },
  {
    icon: "transcribe",
    title: "Speech turned into text",
    body: "The audio of every saved reel is transcribed, so spoken recipes, tips and walkthroughs become searchable.",
  },
  {
    icon: "summarize",
    title: "Summaries and your own collections",
    body: "Each reel gets an AI summary, with any tools, apps or books the creator recommends listed. Group reels into collections you name.",
  },
  {
    icon: "forum",
    title: "Chat with your saved reels",
    body: "Ask a question and get an answer built from your saves, with links to the reels it used. The web is used only when your library isn't enough.",
  },
];

export default function Comparison() {
  return (
    <section className="px-margin py-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="font-label-code text-label-code uppercase tracking-wider text-secondary px-3 py-1 rounded bg-secondary-container/20">
          The Contrast
        </span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mt-4 tracking-tight">
          Instagram Saved vs. RightSave
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mt-2">
          Why your saved folder has always felt like a bottomless digital graveyard.
        </p>
      </div>

      <div className="rounded-2xl bg-surface-container-low overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-container-highest">
          {/* Instagram default */}
          <div className="p-space-lg md:p-10 flex flex-col gap-6 bg-surface-container-lowest/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-error-container/30 text-error flex items-center justify-center">
                <Icon name="close" className="text-[20px]" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Instagram Saved Default
                </h3>
                <p className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                  Passive collection trap
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5 mt-2">
              {BEFORE.map((i) => (
                <div key={i.title} className="rounded-xl bg-surface-container-lowest p-4">
                  <div className="flex items-center gap-2 text-error font-headline-sm text-body-md font-semibold">
                    <Icon name={i.icon} className="text-[18px]" />
                    <span>{i.title}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                    {i.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RightSave */}
          <div className="p-space-lg md:p-10 flex flex-col gap-6 bg-surface-container">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/40 text-primary flex items-center justify-center">
                <Icon name="check" className="text-[20px]" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  RightSave AI Search
                </h3>
                <p className="font-label-code-sm text-label-code-sm text-primary font-medium">
                  Active memory engine
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5 mt-2">
              {AFTER.map((i) => (
                <div key={i.title} className="rounded-xl bg-surface-container-high p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-primary font-headline-sm text-body-md font-semibold">
                    <Icon name={i.icon} className="text-[18px]" />
                    <span>{i.title}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                    {i.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}