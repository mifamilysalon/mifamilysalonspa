export type PaletteId =
  | "farmington-rose-gold"
  | "midnight-magenta"
  | "warm-earth-spa"
  | "noir-salon-luxe"
  | "terracotta-cashmere"
  | "ivory-champagne"
  | "blush-pearl"
  | "sage-linen"
  | "espresso-gold"
  | "coastal-spa"
  | "orchid-ink"
  | "amethyst-blush"
  | "velvet-plum"
  | "copper-mist"
  | "porcelain-berry";

export type PaletteColors = {
  bg_main: string;
  bg_panel: string;
  border_subtle: string;
  text_heading: string;
  text_body: string;
  accent_primary: string;
  accent_hover: string;
  accent_subtle: string;
};

export type PaletteMeta = {
  name: string;
  colors: PaletteColors;
  /** Inspired by the current GoDaddy site (dark purple + magenta) */
  isCurrentSiteInspired?: boolean;
  suffix?: string;
};

/**
 * Illustration-friendly palettes keep light page surfaces and dark ink.
 * Dark themes stay available for branding, but white illustration panels
 * always sit on #fff so cream/light headings never land on the art.
 */
export const PALETTES: Record<PaletteId, PaletteMeta> = {
  "farmington-rose-gold": {
    name: "Farmington Rose Gold & Alabaster",
    suffix: "Default · illustration-friendly",
    colors: {
      // Clean white canvas that matches flat PNG illustration backgrounds
      bg_main: "#FAF7F6",
      bg_panel: "#FFFFFF",
      border_subtle: "#E5D4D1",
      text_heading: "#2E1F22",
      text_body: "#5A4548",
      accent_primary: "#B86B74",
      accent_hover: "#9A545C",
      accent_subtle: "#F3E8E6",
    },
  },
  "midnight-magenta": {
    name: "Midnight Magenta",
    isCurrentSiteInspired: true,
    suffix: "Dark · soft contrast with art",
    colors: {
      // Softened dark violet; warmer (not cream-yellow) headings
      bg_main: "#161018",
      bg_panel: "#221822",
      border_subtle: "#3F2A3C",
      text_heading: "#F7F0F4",
      text_body: "#D9C8D4",
      accent_primary: "#E83A8A",
      accent_hover: "#C92E76",
      accent_subtle: "#2C1A2A",
    },
  },
  "warm-earth-spa": {
    name: "Warm Earth Spa",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#F7F4F0",
      bg_panel: "#FFFFFF",
      border_subtle: "#D9D2C8",
      text_heading: "#2A2623",
      text_body: "#544E48",
      accent_primary: "#5A6B5C",
      accent_hover: "#465448",
      accent_subtle: "#E8EDE8",
    },
  },
  "noir-salon-luxe": {
    name: "Noir Salon Luxe",
    suffix: "Dark · soft contrast with art",
    colors: {
      bg_main: "#141414",
      bg_panel: "#1C1C1C",
      border_subtle: "#2E2E2E",
      text_heading: "#F4F2EF",
      text_body: "#C8C4BE",
      accent_primary: "#C5A059",
      accent_hover: "#B08E45",
      accent_subtle: "#2A2418",
    },
  },
  "terracotta-cashmere": {
    name: "Terracotta & Cashmere",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#FAF6F3",
      bg_panel: "#FFFFFF",
      border_subtle: "#E3D9D1",
      text_heading: "#2E211A",
      text_body: "#5A463C",
      accent_primary: "#A65E46",
      accent_hover: "#8B4A34",
      accent_subtle: "#F0E4DD",
    },
  },
  "ivory-champagne": {
    name: "Ivory Champagne",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#FCFBF8",
      bg_panel: "#FFFFFF",
      border_subtle: "#E8E1D4",
      text_heading: "#2A2418",
      text_body: "#5A5246",
      accent_primary: "#B8975F",
      accent_hover: "#9A7B4A",
      accent_subtle: "#F4EEE3",
    },
  },
  "blush-pearl": {
    name: "Blush Pearl",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#FBF7F6",
      bg_panel: "#FFFFFF",
      border_subtle: "#E8D8D5",
      text_heading: "#322422",
      text_body: "#655350",
      accent_primary: "#C07072",
      accent_hover: "#A5585A",
      accent_subtle: "#F3E6E4",
    },
  },
  "sage-linen": {
    name: "Sage & Linen",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#F6F5F1",
      bg_panel: "#FFFFFF",
      border_subtle: "#D6DAD1",
      text_heading: "#2A2F28",
      text_body: "#525950",
      accent_primary: "#6F856B",
      accent_hover: "#5A6E57",
      accent_subtle: "#E6EBE4",
    },
  },
  "espresso-gold": {
    name: "Espresso Gold",
    suffix: "Dark · soft contrast with art",
    colors: {
      bg_main: "#18140F",
      bg_panel: "#241E18",
      border_subtle: "#3A322A",
      text_heading: "#F2EBE3",
      text_body: "#C4B8AA",
      accent_primary: "#C9A227",
      accent_hover: "#A8861A",
      accent_subtle: "#322A18",
    },
  },
  "coastal-spa": {
    name: "Coastal Spa",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#F3F7F8",
      bg_panel: "#FFFFFF",
      border_subtle: "#D0DCE0",
      text_heading: "#1A2A30",
      text_body: "#465860",
      accent_primary: "#4A7C8C",
      accent_hover: "#3A6572",
      accent_subtle: "#E0EDF0",
    },
  },
  "orchid-ink": {
    name: "Orchid Ink",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#F7F3F7",
      bg_panel: "#FFFFFF",
      border_subtle: "#DFD2E0",
      text_heading: "#281C2A",
      text_body: "#564856",
      accent_primary: "#8B4F7A",
      accent_hover: "#713F63",
      accent_subtle: "#EEE2EC",
    },
  },
  "amethyst-blush": {
    name: "Amethyst Blush",
    suffix: "Illustration-friendly · purple & pink",
    colors: {
      bg_main: "#FAF6FC",
      bg_panel: "#FFFFFF",
      border_subtle: "#E6D8EE",
      text_heading: "#261830",
      text_body: "#5A4868",
      accent_primary: "#9B4DCA",
      accent_hover: "#823DB0",
      accent_subtle: "#F2E8F8",
    },
  },
  "velvet-plum": {
    name: "Velvet Plum",
    suffix: "Dark · black, purple & pink",
    colors: {
      bg_main: "#0E0A12",
      bg_panel: "#181222",
      border_subtle: "#352A42",
      text_heading: "#F3EDF8",
      text_body: "#D0C0DC",
      accent_primary: "#D946A8",
      accent_hover: "#B8368A",
      accent_subtle: "#281830",
    },
  },
  "copper-mist": {
    name: "Copper Mist",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#F7F4F0",
      bg_panel: "#FFFFFF",
      border_subtle: "#E0D4C8",
      text_heading: "#2A221A",
      text_body: "#56483C",
      accent_primary: "#B8734A",
      accent_hover: "#975C39",
      accent_subtle: "#EEE4DA",
    },
  },
  "porcelain-berry": {
    name: "Porcelain Berry",
    suffix: "Illustration-friendly",
    colors: {
      bg_main: "#FAF7F9",
      bg_panel: "#FFFFFF",
      border_subtle: "#E6DAE2",
      text_heading: "#261820",
      text_body: "#584850",
      accent_primary: "#9B3D5A",
      accent_hover: "#7E3149",
      accent_subtle: "#F2E4EA",
    },
  },
};

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

export function isPaletteId(value: string): value is PaletteId {
  return value in PALETTES;
}

export function paletteDisplayName(id: PaletteId): string {
  const p = PALETTES[id];
  if (p.isCurrentSiteInspired && p.suffix) {
    return `${p.name} (${p.suffix})`;
  }
  if (p.suffix) {
    return `${p.name} (${p.suffix})`;
  }
  return p.name;
}

export function paletteToCssVars(id: PaletteId): string {
  const c = PALETTES[id].colors;
  return [
    `--salon-bg-main:${c.bg_main}`,
    `--salon-bg-panel:${c.bg_panel}`,
    `--salon-border:${c.border_subtle}`,
    `--salon-text-heading:${c.text_heading}`,
    `--salon-text-body:${c.text_body}`,
    `--salon-accent:${c.accent_primary}`,
    `--salon-accent-hover:${c.accent_hover}`,
    `--salon-accent-subtle:${c.accent_subtle}`,
  ].join(";");
}

export function applyPaletteToDocument(id: PaletteId): void {
  if (typeof document === "undefined") return;
  const c = PALETTES[id].colors;
  const root = document.documentElement;
  root.style.setProperty("--salon-bg-main", c.bg_main);
  root.style.setProperty("--salon-bg-panel", c.bg_panel);
  root.style.setProperty("--salon-border", c.border_subtle);
  root.style.setProperty("--salon-text-heading", c.text_heading);
  root.style.setProperty("--salon-text-body", c.text_body);
  root.style.setProperty("--salon-accent", c.accent_primary);
  root.style.setProperty("--salon-accent-hover", c.accent_hover);
  root.style.setProperty("--salon-accent-subtle", c.accent_subtle);
}

export const PUBLIC_THEME_STORAGE_KEY = "fss_public_theme";
