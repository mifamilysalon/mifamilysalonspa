export type HeroToneId =
  | "color"
  | "grayscale"
  | "soft-muted"
  | "warm-sepia"
  | "cool-slate"
  | "high-contrast-bw";

export type HeroToneMeta = {
  id: HeroToneId;
  name: string;
  description: string;
  filter: string;
};

export const HERO_TONES: HeroToneMeta[] = [
  {
    id: "color",
    name: "Full color",
    description: "Vivid natural color",
    // Strong boost so Full color reads clearly vs Soft muted on muted source photos.
    filter: "saturate(1.65) contrast(1.1) brightness(1.05)",
  },
  {
    id: "grayscale",
    name: "Black & white",
    description: "Classic monochrome",
    filter: "grayscale(1)",
  },
  {
    id: "soft-muted",
    name: "Soft muted",
    description: "Gently desaturated",
    filter: "saturate(0.45) contrast(1.05)",
  },
  {
    id: "warm-sepia",
    name: "Warm sepia",
    description: "Soft warm editorial tone",
    filter: "sepia(0.45) saturate(0.9) contrast(1.06) brightness(1.02)",
  },
  {
    id: "cool-slate",
    name: "Cool slate",
    description: "Cool near-monochrome",
    filter: "grayscale(0.72) contrast(1.1) brightness(0.97)",
  },
  {
    id: "high-contrast-bw",
    name: "High-contrast B&W",
    description: "Bold black and white",
    filter: "grayscale(1) contrast(1.35) brightness(1.02)",
  },
];

export const HERO_TONE_IDS = HERO_TONES.map((t) => t.id);

export function isHeroToneId(value: string): value is HeroToneId {
  return HERO_TONE_IDS.includes(value as HeroToneId);
}

export function heroToneFilter(id: HeroToneId): string {
  return HERO_TONES.find((t) => t.id === id)?.filter || "none";
}

export const DEFAULT_HERO_IMAGE = "";

export type MediaSettings = {
  /** Optional photo URL override. Empty = illustrated hero. */
  hero_image: string;
  hero_tone: HeroToneId;
};

export const DEFAULT_MEDIA: MediaSettings = {
  hero_image: DEFAULT_HERO_IMAGE,
  hero_tone: "color",
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
  yelp: string;
  threads: string;
  tiktok: string;
};

/** Confirmed client social profiles */
export const DEFAULT_SOCIAL: SocialLinks = {
  facebook: "https://www.facebook.com/familysalonandspa/",
  instagram: "https://www.instagram.com/familysalonandspa/",
  yelp: "https://www.yelp.com/biz/family-hair-salon-and-wellness-spa-farmington",
  threads: "https://www.threads.com/@familysalonandspa",
  tiktok: "",
};

export const SOCIAL_LABELS: { key: keyof SocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "yelp", label: "Yelp" },
  { key: "threads", label: "Threads" },
  { key: "tiktok", label: "TikTok" },
];
