const P = "bg-surface-container-high text-primary";
const S = "bg-surface-container-high text-secondary";
const T = "bg-surface-container-high text-tertiary";
const V = "bg-surface-container-high text-on-surface-variant";

export type LibraryCardData = {
  alt: string;
  image?: string;
  creator?: { initials: string; handle: string; audio: string };
  title: string;
  hover: string;
  accent: string;
  takeaway: string;
  chips: [label: string, className: string][];
  saved: string;
  footIcon: string;
  footText: string;
  footColor: string;
};

export const LIBRARY_CARDS: LibraryCardData[] = [
  {
    alt: "Next.js 15 Postgres Setup Reel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDE25TJLW_YyMoxA1fh3gRcvCfL16m0GXeIRNTIHdIuFuCaboZlZqRN0NuYwRPU7rxFsMXEkCeL92R5iKHSfE_OgEHZfXY077UlbgHjCRNji6ny34Z_jE_2UmK3ozcZaT-s2Mjp0pEcNc6vtVtznEF1WppC5VJJw7dmnZmX6JZ0H_M8AuLtN1x4q2USkZc2-IU0_zdWoqIcg4toBclEhzmrdSbXSYizfdY4fPwwpWHamf-GJbL2zODp5g",
    title: "Next.js 15 App Router & Neon Postgres Stack",
    hover: "group-hover:text-primary",
    accent: "text-primary",
    takeaway: "Modular SaaS backend blueprints. Recommends Supabase or Neon over Redis for Day 1 architectures.",
    chips: [
      ["Technology", P],
      ["Next.js 15", V],
      ["Postgres", V],
      ["Code Detected", "bg-secondary/15 text-secondary font-medium"],
    ],
    saved: "Saved 3 days ago",
    footIcon: "link",
    footText: "2 direct links",
    footColor: "text-primary",
  },
  {
    alt: "Small Bedroom Curtain Design Reel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdJLEnvG_05TM92e7jT0rvzAqSFbjzx0tOCpRopsvd-xixYPBEaZNuB5yeqpmFX8loJ6B76TItwxkuApj4oNCfzHcbFujeKmeUk087ee8vSLd8dpUJWLFZXG0U4kX33tlWQyjBkgCKDiAly8deNzvYMGESQVrdYxtq_W-asRcZKK2o7T7Ys8FpsR4ktxTU7u13lHvnwRUgabvS-YLVa-P8Kc2VBlgemRkByDPnw811HY7mHsO2SYU0hQ",
    title: "Small Bedroom Curtain & Space Illusion",
    hover: "group-hover:text-secondary",
    accent: "text-secondary",
    takeaway: "Ceiling-mounted brass tracks with double-weave linen make compact bedrooms feel 2x larger.",
    chips: [
      ["Home Decor", S],
      ["Curtains", V],
      ["Room Layout", V],
      ["Product Links (4)", "bg-primary/15 text-primary font-medium"],
    ],
    saved: "Saved Oct 14",
    footIcon: "shopping_cart",
    footText: "4 extracted items",
    footColor: "text-secondary",
  },
  {
    alt: "High Protein Paneer Bowl Reel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQN4yKMhbQGfz_h6QISVjdkZ6hazIdOIrIz9MWjuCI55QrQxmZQs_j38K2DcVCfaib0u5oyLgMvo4sUc1WY_Yc1iKkku6aohdnTFg90YfxUXQq3VG-hQcJiVpKowVq2PSoHJAw_FzM6S2HDJgTzYrypaiOvYqNOXRIiRshDvC4F8Vd6GEGQBnB1PKiAeQRm1SKExKIaZvkvvOiIC50Hi1F4t42DUpltZL0C3UcnylTBDrn0kW8l7l3ig",
    title: "Crispy Tofu & High-Protein Paneer Bowl",
    hover: "group-hover:text-tertiary",
    accent: "text-tertiary",
    takeaway: "38g protein vegetarian prep. Air fry at 200°C for 12m with greek yogurt marinade.",
    chips: [
      ["Food", T],
      ["High Protein", V],
      ["38g Protein", "bg-surface-container-high text-secondary font-semibold"],
      ["Air Fryer", V],
    ],
    saved: "Saved 5 days ago",
    footIcon: "menu_book",
    footText: "Full Recipe Card",
    footColor: "text-tertiary",
  },
  {
    alt: "Local AI Tools Setup Reel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0S8iR8zqm18h8paUDs4blLxJroMHB6Om8gVDfU4gEk-brXdDpq24FYEME4oW90YuhcMvojYKSkifvkrdzIpr9UH7qinZPuZ2mwgkdlH-Zz7wDubQgxX61EbDVZlFTYXHrIj8mCT0R3y61Df2qymJhXJpap8XWlykhJJP-3YPR3Wn9d05RpQTCk8H4ZCBusHk0UkzAsl8Fvph955qQEroBrP086lyCaGJPDPm2thjzoxZKJc4v6ISgcg",
    title: "3 Local AI Tools Replacing Paid SaaS in 2026",
    hover: "group-hover:text-primary",
    accent: "text-primary",
    takeaway: "Ollama + OpenWebUI setup with local embedding models for zero-cloud document analysis.",
    chips: [
      ["AI Tools", P],
      ["Local LLM", V],
      ["Productivity", V],
    ],
    saved: "Saved 1 week ago",
    footIcon: "terminal",
    footText: "CLI Configs Copied",
    footColor: "text-primary",
  },
  {
    alt: "Tokyo Shimokitazawa Vinyl Jazz Bar Reel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqn57-7-hlsSgRbCqRRp1pdPfLaVPmP73oddtlq5cdZF9WHGBuAQ1kJbjJ9HMxPZmSISNdazJHOxIbm9JfNdg_dGTBZ_0r0siSmHVvyqTDsI4ORc_wqukc871XiwVUJ9lJuDgdQTzpkj_L9DkFYmH3fXN1FI_lExsDUpYALI0KhzDJFhtMlWp-pSL5fCF99OXR0tR6JkTpa7xvS5ZHnyULIdwRHJt426FGUu0kihgboJICYF0aJOjs4A",
    title: "Hidden Vintage Vinyl Bars in Shimokitazawa",
    hover: "group-hover:text-secondary",
    accent: "text-secondary",
    takeaway: "3 underground jazz kissas with rare tube amps and cocktail menus tucked away from tourists.",
    chips: [
      ["Travel", S],
      ["Japan", V],
      ["Tokyo", V],
      ["Hidden Gems", P],
    ],
    saved: "Saved 2 weeks ago",
    footIcon: "pin_drop",
    footText: "3 Google Maps pins",
    footColor: "text-secondary",
  },
  {
    alt: "",
    creator: { initials: "CD", handle: "@coachdan", audio: "English Audio" },
    title: "Fix Anterior Pelvic Tilt with 3 Daily Drills",
    hover: "group-hover:text-primary",
    accent: "text-primary",
    takeaway: "Couch stretch and glute bridge progressions to relieve lower back compression from sitting.",
    chips: [
      ["Fitness", P],
      ["Mobility", V],
      ["Posture", V],
      ["Back Relief", V],
    ],
    saved: "Saved 3 weeks ago",
    footIcon: "timer",
    footText: "3-Min Routine",
    footColor: "text-primary",
  },
];

export const LIBRARY_PILLS: [icon: string, color: string, label: string, count: string][] = [
  ["terminal", "text-primary", "Technology & Coding", "642"],
  ["chair", "text-secondary", "Home & Interior", "418"],
  ["skillet", "text-tertiary", "Food & Recipes", "389"],
  ["psychology", "text-primary", "AI & Tools", "312"],
  ["rocket_launch", "text-secondary", "Business & SaaS", "275"],
  ["explore", "text-tertiary", "Travel & Places", "194"],
  ["fitness_center", "text-primary", "Fitness & Health", "145"],
  ["design_services", "text-secondary", "Design & UI", "106"],
];