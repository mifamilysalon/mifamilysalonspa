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
    description: "Natural color photography",
    filter: "none",
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
    filter: "sepia(0.4) saturate(0.8) contrast(1.05)",
  },
  {
    id: "cool-slate",
    name: "Cool slate",
    description: "Cool near-monochrome",
    filter: "grayscale(0.75) contrast(1.08) brightness(0.96)",
  },
  {
    id: "high-contrast-bw",
    name: "High-contrast B&W",
    description: "Bold black and white",
    filter: "grayscale(1) contrast(1.28)",
  },
];

export const HERO_TONE_IDS = HERO_TONES.map((t) => t.id);

export function isHeroToneId(value: string): value is HeroToneId {
  return HERO_TONE_IDS.includes(value as HeroToneId);
}

export function heroToneFilter(id: HeroToneId): string {
  return HERO_TONES.find((t) => t.id === id)?.filter || "none";
}

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d7?w=1600&q=80";

export type MediaSettings = {
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

/** Placeholders until client confirms live URLs */
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
