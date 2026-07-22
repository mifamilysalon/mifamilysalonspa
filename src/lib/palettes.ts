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
  | "coastal-spa";

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

export const PALETTES: Record<PaletteId, PaletteMeta> = {
  "farmington-rose-gold": {
    name: "Farmington Rose Gold & Alabaster",
    suffix: "Default luxury",
    colors: {
      bg_main: "#FAF8F5",
      bg_panel: "#FFFFFF",
      border_subtle: "#E8E2D9",
      text_heading: "#1C1917",
      text_body: "#44403C",
      accent_primary: "#B88E4C",
      accent_hover: "#9A7336",
      accent_subtle: "#F4ECE1",
    },
  },
  "midnight-magenta": {
    name: "Midnight Magenta",
    isCurrentSiteInspired: true,
    suffix: "Current website inspired",
    colors: {
      // From live GoDaddy site: dark purple/black + hot magenta accents + cream text
      bg_main: "#1A0F1A",
      bg_panel: "#2A1528",
      border_subtle: "#4A2A48",
      text_heading: "#F5EDE8",
      text_body: "#D4C4CE",
      accent_primary: "#D946A8",
      accent_hover: "#BE185D",
      accent_subtle: "#3D1F3A",
    },
  },
  "warm-earth-spa": {
    name: "Warm Earth Spa",
    colors: {
      bg_main: "#F4F0EB",
      bg_panel: "#EAE4DC",
      border_subtle: "#D5CEC3",
      text_heading: "#2C2825",
      text_body: "#4A443F",
      accent_primary: "#5A6B5C",
      accent_hover: "#465448",
      accent_subtle: "#DFE5E0",
    },
  },
  "noir-salon-luxe": {
    name: "Noir Salon Luxe",
    colors: {
      bg_main: "#121212",
      bg_panel: "#1E1E1E",
      border_subtle: "#2A2A2A",
      text_heading: "#F5F5F5",
      text_body: "#D4D4D4",
      accent_primary: "#C5A059",
      accent_hover: "#DAA520",
      accent_subtle: "#2C2518",
    },
  },
  "terracotta-cashmere": {
    name: "Terracotta & Cashmere",
    colors: {
      bg_main: "#FBF7F5",
      bg_panel: "#F3ECE7",
      border_subtle: "#E5DCD5",
      text_heading: "#332219",
      text_body: "#594338",
      accent_primary: "#A65E46",
      accent_hover: "#8B4A34",
      accent_subtle: "#F2E3DD",
    },
  },
  "ivory-champagne": {
    name: "Ivory Champagne",
    colors: {
      bg_main: "#FFFEFA",
      bg_panel: "#FFFFFF",
      border_subtle: "#EDE6D9",
      text_heading: "#2C2416",
      text_body: "#5C5346",
      accent_primary: "#C4A574",
      accent_hover: "#A88B5C",
      accent_subtle: "#F7F1E6",
    },
  },
  "blush-pearl": {
    name: "Blush Pearl",
    colors: {
      bg_main: "#FDF8F7",
      bg_panel: "#FFFFFF",
      border_subtle: "#EBD9D6",
      text_heading: "#3D2A28",
      text_body: "#6B5552",
      accent_primary: "#C4787A",
      accent_hover: "#A85F61",
      accent_subtle: "#F5E8E6",
    },
  },
  "sage-linen": {
    name: "Sage & Linen",
    colors: {
      bg_main: "#F7F6F2",
      bg_panel: "#FFFFFF",
      border_subtle: "#D9DDD4",
      text_heading: "#2F342C",
      text_body: "#555C52",
      accent_primary: "#7A8F76",
      accent_hover: "#627560",
      accent_subtle: "#E8EDE6",
    },
  },
  "espresso-gold": {
    name: "Espresso Gold",
    colors: {
      bg_main: "#1C1612",
      bg_panel: "#2A211C",
      border_subtle: "#3D322A",
      text_heading: "#F3EDE6",
      text_body: "#C9BDB0",
      accent_primary: "#C9A227",
      accent_hover: "#A8861A",
      accent_subtle: "#3A2F1A",
    },
  },
  "coastal-spa": {
    name: "Coastal Spa",
    colors: {
      bg_main: "#F4F8F9",
      bg_panel: "#FFFFFF",
      border_subtle: "#D4E0E4",
      text_heading: "#1E2F35",
      text_body: "#4A5C63",
      accent_primary: "#4A7C8C",
      accent_hover: "#3A6572",
      accent_subtle: "#E2EEF1",
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
