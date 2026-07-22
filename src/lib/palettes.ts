export type PaletteId =
  | "farmington-rose-gold"
  | "warm-earth-spa"
  | "noir-salon-luxe"
  | "terracotta-cashmere";

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

export const PALETTES: Record<
  PaletteId,
  { name: string; colors: PaletteColors }
> = {
  "farmington-rose-gold": {
    name: "Farmington Rose Gold & Alabaster",
    colors: {
      // Calibrated from live site cream text + softened magenta accents into rose gold
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
};

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
