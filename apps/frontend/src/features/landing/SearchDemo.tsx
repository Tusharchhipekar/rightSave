"use client";

import { useState, useEffect } from "react";
import Icon from "./Icon";
import ReelCard from "./ReelCard";
import { DEMO_ORDER, DEMO_SETS, type DemoKey } from "./demo-data";

const CHIP_ACTIVE = "bg-primary-container/20 text-primary hover:bg-primary-container/30";
const CHIP_IDLE =
  "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright";

export default function SearchDemo() {
  const [active, setActive] = useState<DemoKey>("curtains");
  const fullText = DEMO_SETS[active].query;
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Switch prompt chip and reset typewriter state
  const handleSelectPrompt = (key: DemoKey) => {
    setActive(key);
    setDisplayText("");
    setIsDeleting(false);
  };

  // Smooth typewriter & backspace loop effect at a steady, minimal pace
  useEffect(() => {
    const typingSpeed = isDeleting ? 40 : 75;
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === fullText) {
      // Pause at full sentence before erasing
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText === "") {
      // Pause when completely cleared before typing again
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 600);
    } else {
      // Type or erase character by character
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? fullText.slice(0, prev.length - 1)
            : fullText.slice(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, fullText]);

  const data = DEMO_SETS[active];

  return (
    <div className="w-full max-w-4xl mt-14 text-left">
      <div className="rounded-2xl bg-surface-container-lowest p-2 shadow-2xl">
        <div className="rounded-xl bg-surface-container-low p-space-md md:p-space-lg flex flex-col gap-space-md shadow-inner">
          {/* Status bar */}
          <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-on-surface-variant pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error" />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
              <span className="ml-2 text-on-surface font-semibold font-headline-sm text-body-sm">
                RightSave
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="text-secondary font-medium">Neural Index Active</span>
            </div>
          </div>

          {/* Omnibar with animated typewriter query text */}
          <div className="relative w-full rounded-xl bg-surface-container-highest p-1 shadow-md">
            <div className="flex items-center gap-space-sm px-space-md py-3 bg-surface-container rounded-lg">
              <Icon name="auto_awesome" className="text-primary text-[22px]" />
              <div className="flex-1 font-headline-sm text-body-lg text-on-surface flex items-center min-h-[28px]">
                <span>{displayText}</span>
                <span className="inline-block w-0.5 h-5 ml-1 bg-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-code-sm text-label-code-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                  vector-search
                </span>
                <kbd className="font-label-code-sm text-label-code-sm px-2 py-0.5 rounded bg-surface-container-lowest text-primary">
                  ⏎ Enter
                </kbd>
              </div>
            </div>
          </div>

          {/* Prompt chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-label-code text-label-code text-on-surface-variant mr-1">
              Try memory prompts:
            </span>
            {DEMO_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPrompt(key)}
                className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
                  key === active ? CHIP_ACTIVE : CHIP_IDLE
                }`}
              >
                &quot;{DEMO_SETS[key].query}&quot;
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container-highest text-on-surface font-label-code text-label-code">
              <Icon name="travel_explore" className="text-secondary text-[16px]" />
              <span>{data.count}</span>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-1">
            {data.items.map((reel) => (
              <ReelCard key={`${active}-${reel.handle}`} reel={reel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}