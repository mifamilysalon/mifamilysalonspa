/** Public site + in-salon brochure category labels (matches desk menu brochure). */
export const BROCHURE_CATEGORIES = [
  { key: "hair", label: "Hair Care", href: "/hair-care" },
  { key: "nails", label: "Nail Care", href: "/nail-care" },
  { key: "threading", label: "Threading", href: "/threading" },
  { key: "waxing", label: "Waxing", href: "/waxing" },
  { key: "lashes", label: "Lashes", href: "/lashes" },
  { key: "facials", label: "Facials", href: "/facials" },
  { key: "makeup", label: "Make-Up", href: "/makeup" },
  { key: "henna", label: "Henna Tattoos", href: "/henna" },
  { key: "wellness", label: "Wellness", href: "/wellness" },
] as const;

export type BrochureCategoryKey = (typeof BROCHURE_CATEGORIES)[number]["key"];

/** Primary header nav — service links follow brochure chapters. */
export const SITE_HEADER_NAV = [
  { href: "/", label: "Home" },
  ...BROCHURE_CATEGORIES.map((c) => ({ href: c.href, label: c.label })),
  { href: "/private-area", label: "Private Suite" },
  { href: "/gallery", label: "Gallery" },
  { href: "/offers", label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const BROCHURE_CATEGORY_ORDER: BrochureCategoryKey[] = [
  "hair",
  "nails",
  "threading",
  "waxing",
  "lashes",
  "facials",
  "makeup",
  "henna",
  "wellness",
];

export const BROCHURE_CATEGORY_LABELS: Record<BrochureCategoryKey, string> =
  Object.fromEntries(
    BROCHURE_CATEGORIES.map((c) => [c.key, c.label]),
  ) as Record<BrochureCategoryKey, string>;
