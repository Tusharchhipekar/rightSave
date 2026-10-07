export type DemoKey = "curtains" | "dev" | "paneer" | "saas" | "japan";

export type DemoReel = {
  handle: string;
  title: string;
  match: string;
  duration: string;
  saved: string;
  summary: string;
  image?: string; // optional thumbnail; a placeholder tile is shown when missing
};

export type DemoSet = {
  query: string;
  count: string;
  items: DemoReel[];
};

export const DEMO_ORDER: DemoKey[] = ["curtains", "dev", "paneer", "saas", "japan"];

export const DEMO_SETS: Record<DemoKey, DemoSet> = {
  curtains: {
    query: "curtains for a small bedroom",
    count: "Found 42 Reels matching your memory",
    items: [
      {
        handle: "@homestyle",
        title: "Small Bedroom Curtain Ideas",
        match: "98% Match",
        duration: "0:42",
        saved: "Saved 3 weeks ago",
        summary:
          "Double-rail sheer & blackout curtain setup hanging ceiling-to-floor creates the visual illusion of 10ft ceilings in compact rooms.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBClL67RVifT8mJkACYyiuMcSqrgEAsvunots-1dOenZV503u-RGO83GY5mJ32cCFJD5lsYIdQg-EZDEU5EuRSIUAiMpT1XZLync-yML-L_3MaKiV56mpR1JMoOEFxGvKy6VGGRk44wwQc-2dYUwUJPFlAQ0VxxAwLPEZd4JL4li86XF8psB_njqdwABkhLAyzluQsgT2aUh3SottNX3rtR_VDOqYh4i5S2JlHQOH61",
      },
      {
        handle: "@minimalnest",
        title: "Best Blackout Curtains for Bedrooms",
        match: "94% Match",
        duration: "0:29",
        saved: "Saved 2 months ago",
        summary:
          "Thermal velvet curtain test in 120 sq ft studio room, space-saving mounting brackets flush to crown molding.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAl7dED-pIL1JPS981N20tQQqoFj9nn4PEqQJCqntdt2yQU7AP5LrRDWeQTcgBgR29yuxhFW5bfVKTygk-r8Xb8lP8ZOysDH1QjB4WcC03EtDPx3YY3vSpfBuEcV6ODasNgqicNdOafT9MlnKzUALemndNeadjIHd0LyEt9jz0cYrriQG-UuHw-ytV7ObicEjjQ3eZiQ1ew5AeBFml-VhPmBeGrqBy6aq1_Vkyp9JfI",
      },
      {
        handle: "@designhacks",
        title: "Modern Bedroom Curtain Designs",
        match: "91% Match",
        duration: "0:54",
        saved: "Saved 4 days ago",
        summary:
          "Floor-to-ceiling pinch pleat drapery recommendations for tight window alcoves without obstructing baseboard heaters.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDqkrnkrDS2qRgN51S3ikIUv-H8Y3-prupYngbzkrlwAwpy7cTMU95HTKL9yoSXHMLfmN9NLSH-c9nJ7wCz-qXXbdYrndJ1EgT2RYDFQ1Ye15Ix7XWhOzqvik5CYVmPn7IzctYn6UfkoyHoYDAPy6MB9gBDQGxykZ0xz44bgbf6cztyqZr3q5tPfL5HdZ6mfwDWZWgexQWUw_8odotXLGIWaNVJwIadNPTR0V2pJU8K",
      },
    ],
  },
  dev: {
    query: "that Reel about AI tools for developers",
    count: "Found 18 Reels matching developer tooling",
    items: [
      {
        handle: "@dev_insights",
        title: "Top 5 CLI Tools Powered by LLMs",
        match: "99% Match",
        duration: "0:58",
        saved: "Saved 5 days ago",
        summary:
          "Demonstrates terminal command generator tool pairing automated git commit messages with intelligent diff summaries.",
      },
      {
        handle: "@fullstack_pro",
        title: "Cursor & AI Agent Architecture",
        match: "95% Match",
        duration: "1:12",
        saved: "Saved 2 weeks ago",
        summary:
          "Multi-file prompt engineering tricks to auto-refactor Tailwind layout systems and SQLite schema migrations.",
      },
      {
        handle: "@codecraft",
        title: "Local LLM Running on Mac M3",
        match: "92% Match",
        duration: "0:45",
        saved: "Saved 1 month ago",
        summary:
          "Quantized 8B model setup running offline at 45 tokens per second for auto-completing sensitive backend APIs.",
      },
    ],
  },
  paneer: {
    query: "recipe using paneer with lots of protein",
    count: "Found 27 high-protein paneer cooking Reels",
    items: [
      {
        handle: "@fitmeals_hq",
        title: "50g Protein Paneer & Lentil Skillet",
        match: "97% Match",
        duration: "0:35",
        saved: "Saved yesterday",
        summary:
          "Tawa grilled paneer cubes marinated in yogurt and turmeric with a sprouted moong dal protein bowl base.",
      },
      {
        handle: "@healthychefindia",
        title: "Crispy Air-Fried Peri Peri Paneer",
        match: "93% Match",
        duration: "0:48",
        saved: "Saved 3 weeks ago",
        summary:
          "Zero oil air-fryer recipe using crushed oat flour coating for maximum outer crispiness with 34g protein.",
      },
      {
        handle: "@macrocounter",
        title: "Low Calorie High Protein Paneer Bhurji",
        match: "89% Match",
        duration: "0:40",
        saved: "Saved 1 month ago",
        summary:
          "Scrambled paneer recipe substituting heavy cream with whipped Greek yogurt to reduce fat while keeping 40g protein.",
      },
    ],
  },
  saas: {
    query: "Next.js SaaS ideas",
    count: "Found 31 Next.js SaaS architecture clips",
    items: [
      {
        handle: "@buildinpublic",
        title: "Next.js 15 Server Actions SaaS Boilerplate",
        match: "98% Match",
        duration: "1:05",
        saved: "Saved 1 week ago",
        summary:
          "Walkthrough of stripe webhooks, Supabase auth sessions, and edge caching for micro-SaaS deployment.",
      },
      {
        handle: "@indiehacker_tips",
        title: "Micro-SaaS Ideas Making $5k/mo",
        match: "94% Match",
        duration: "0:52",
        saved: "Saved 2 months ago",
        summary:
          "Breakdown of specialized niche Notion sync plugins and automated PDF summary APIs targeting legal paralegals.",
      },
      {
        handle: "@devfounder",
        title: "Multi-tenant Database Setup in 10 mins",
        match: "90% Match",
        duration: "0:41",
        saved: "Saved 3 weeks ago",
        summary:
          "Postgres schema isolation patterns for enterprise B2B apps using Prisma ORM and Vercel edge functions.",
      },
    ],
  },
  japan: {
    query: "places to visit in Japan",
    count: "Found 64 Japan travel recommendations",
    items: [
      {
        handle: "@tokyoguide",
        title: "Secret Hidden Noodle Alley in Shinjuku",
        match: "99% Match",
        duration: "0:47",
        saved: "Saved 4 months ago",
        summary:
          "Underground 6-seat tsukemen spot located 2 minutes from south exit with zero wait time before 6 PM.",
      },
      {
        handle: "@kyotowanderer",
        title: "Quiet Bamboo Paths Without Tourists",
        match: "95% Match",
        duration: "0:39",
        saved: "Saved 2 months ago",
        summary:
          "Alternative bamboo sanctuary in northern Kyoto with traditional matcha teahouse overlooking moss rock garden.",
      },
      {
        handle: "@wanderlust_jp",
        title: "Fuji Viewpoint Ryokan with Private Onsen",
        match: "92% Match",
        duration: "0:55",
        saved: "Saved 6 months ago",
        summary:
          "Lake Kawaguchiko traditional inn booking tips, includes open air cedar wood bath facing Mount Fuji sunrise.",
      },
    ],
  },
};