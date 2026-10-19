export type LibraryCardData = {
  id: string;
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
  status?: string;
  sourceUrl?: string;
};

export type RichPart = string | { text: string; className: string };

export type ReelTakeaway = {
  time: string;
  title: string;
  body: RichPart[];
  active?: boolean;
};

export type ReelDetail = {
  id: string;
  cluster: string;
  saved: string;
  instagramUrl: string;
  image: string;
  ocr: { label: string; text: string };
  title: string;
  summary: RichPart[];
  takeaways: ReelTakeaway[];
};
