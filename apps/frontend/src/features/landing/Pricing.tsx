import Link from "next/link";
import Icon from "./Icon";

type Plan = {
  name: string;
  price: string;
  note: string;
  features: string[];
  cta: { label: string; href?: string };
  highlight?: boolean;
};

// Edit this list when billing launches.
const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    note: "Everything RightSave does today.",
    features: [
      "Save reels and posts by sending them to RightSave on Instagram",
      "Transcripts, on-screen text and AI summaries",
      "Search your library by meaning",
      "Collections to organize what you save",
      "Chat with your saved reels, with sources",
    ],
    cta: { label: "Get started", href: "/login" },
    highlight: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    note: "Paid plans are not available yet.",
    features: [],
    cta: { label: "Not available yet" },
  },
];

export default function Pricing() {
  return (
    <section className="w-full px-margin py-space-xl">
      <div className="max-w-5xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center gap-space-sm">
          <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface">
            Simple pricing
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            RightSave is free to use while we build. Paid plans will show up here when they exist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-stretch">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-low shadow-md border ${
                plan.highlight ? "border-primary-container/50" : "border-outline-variant/20"
              }`}
            >
              <div className="flex flex-col gap-space-xs">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{plan.name}</h2>
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {plan.price}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{plan.note}</p>
              </div>

              {plan.features.length > 0 && (
                <ul className="flex flex-col gap-space-sm flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-space-sm font-body-md text-body-md text-on-surface">
                      <Icon name="check_circle" className="text-primary text-[18px] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.features.length === 0 && <div className="flex-1" />}

              {plan.cta.href ? (
                <Link
                  href={plan.cta.href}
                  className="flex items-center justify-center px-space-md py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-body-sm font-semibold transition-all"
                >
                  {plan.cta.label}
                </Link>
              ) : (
                <span className="flex items-center justify-center px-space-md py-2.5 rounded-xl bg-surface-container-high text-outline font-headline-sm text-body-sm font-semibold cursor-not-allowed">
                  {plan.cta.label}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}