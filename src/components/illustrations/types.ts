export type IllustrationId =
  | "hero"
  | "hair"
  | "skin"
  | "nails"
  | "wellness"
  | "private"
  | "interior"
  | "wash"
  | "spa"
  | "cut"
  | "color"
  | "highlights"
  | "extensions"
  | "perm"
  | "straighten"
  | "manicure"
  | "pedicure"
  | "shellac"
  | "polish"
  | "facial"
  | "face-mapping"
  | "wax"
  | "massage";

export const ILLUSTRATION_LABELS: Record<IllustrationId, string> = {
  hero: "Haircut in the salon",
  hair: "Hair wash at the basin",
  skin: "Facial skin treatment",
  nails: "Manicure service",
  wellness: "Relaxation massage",
  private: "Private suite consultation",
  interior: "Salon floor",
  wash: "Hair color consultation",
  spa: "Spa treatment room",
  cut: "Creative cut and style",
  color: "Full color service",
  highlights: "Highlights service",
  extensions: "Extensions consultation",
  perm: "Permanent wave",
  straighten: "Straightening and rebonding",
  manicure: "Classic manicure",
  pedicure: "Classic pedicure",
  shellac: "Shellac manicure",
  polish: "Polish change",
  facial: "Dermatological facial",
  "face-mapping": "Face mapping analysis",
  wax: "Body wax",
  massage: "Relaxation massage",
};

export const ILLUSTRATION_SRC: Record<IllustrationId, string> = {
  hero: "/illustrations/hero.png",
  hair: "/illustrations/hair.png",
  skin: "/illustrations/skin.png",
  nails: "/illustrations/nails.png",
  wellness: "/illustrations/wellness.png",
  private: "/illustrations/private.png",
  interior: "/illustrations/interior.png",
  wash: "/illustrations/wash.png",
  spa: "/illustrations/spa.png",
  cut: "/illustrations/cut.png",
  color: "/illustrations/color.png",
  highlights: "/illustrations/highlights.png",
  extensions: "/illustrations/extensions.png",
  perm: "/illustrations/perm.png",
  straighten: "/illustrations/straighten.png",
  manicure: "/illustrations/manicure.png",
  pedicure: "/illustrations/pedicure.png",
  shellac: "/illustrations/shellac.png",
  polish: "/illustrations/polish.png",
  facial: "/illustrations/facial.png",
  "face-mapping": "/illustrations/face-mapping.png",
  wax: "/illustrations/wax.png",
  massage: "/illustrations/massage.png",
};

/** Legacy seed ids 1–15 (inactive); kept for any historical pages. */
export const SERVICE_ILLUSTRATION: Record<number, IllustrationId> = {
  1: "cut",
  2: "color",
  3: "highlights",
  4: "extensions",
  5: "perm",
  6: "straighten",
  7: "facial",
  8: "face-mapping",
  9: "manicure",
  10: "pedicure",
  11: "shellac",
  12: "polish",
  13: "wax",
  14: "massage",
  15: "private",
};

export function illustrationForCategory(category?: string): IllustrationId {
  switch (category) {
    case "hair":
      return "hair";
    case "nails":
      return "nails";
    case "facials":
    case "skin":
      return "facial";
    case "waxing":
      return "wax";
    case "wellness":
      return "wellness";
    case "threading":
      return "face-mapping";
    case "lashes":
      return "facial";
    case "makeup":
      return "wash";
    case "henna":
      return "polish";
    default:
      return "interior";
  }
}

/** Match brochure service names to the closest available illustration. */
export function illustrationForService(
  serviceId: number,
  category?: string,
  name?: string,
): IllustrationId {
  if (SERVICE_ILLUSTRATION[serviceId]) return SERVICE_ILLUSTRATION[serviceId];

  const n = (name || "").toLowerCase();

  if (n.includes("private suite")) return "private";

  // Hair
  if (n.includes("extension")) return "extensions";
  if (n.includes("highlight")) return "highlights";
  if (n.includes("perm") && !n.includes("permanent straighten")) return "perm";
  if (
    n.includes("straighten") ||
    n.includes("keratin") ||
    n.includes("rebond") ||
    n.includes("flat iron")
  ) {
    return "straighten";
  }
  if (
    n.includes("haircut") ||
    n.includes("cut & style") ||
    n.includes("cut and style") ||
    (n.includes("cut") && category === "hair")
  ) {
    return "cut";
  }
  if (
    n.includes("color") ||
    n.includes("toner") ||
    (n.includes("henna treatment") && category === "hair")
  ) {
    return "color";
  }
  if (
    n.includes("shampoo") ||
    n.includes("blow dry") ||
    n.includes("curling") ||
    n.includes("roller") ||
    n.includes("updo") ||
    n.includes("conditioning") ||
    n.includes("hot oil") ||
    n.includes("protein")
  ) {
    return "hair";
  }

  // Nails
  if (n.includes("pedicure")) return "pedicure";
  if (n.includes("shellac")) return "shellac";
  if (n.includes("polish") && category === "nails") return "polish";
  if (n.includes("manicure") || n.includes("nail shape")) return "manicure";

  // Face / skin
  if (n.includes("face mapping") || n.includes("mapping")) return "face-mapping";
  if (
    n.includes("facial") ||
    n.includes("bleach") ||
    n.includes("cleansing") ||
    n.includes("hydrafacial")
  ) {
    return "facial";
  }

  // Waxing / threading / lashes
  if (category === "waxing" || n.includes("wax")) return "wax";
  if (category === "threading" || n.includes("threading")) return "face-mapping";
  if (category === "lashes" || n.includes("lash") || n.includes("tinting")) {
    return "facial";
  }

  // Makeup / henna
  if (category === "makeup" || n.includes("makeup") || n.includes("saree") || n.includes("dupatta")) {
    return "wash";
  }
  if (category === "henna" || (n.includes("henna") && category !== "hair")) {
    return "polish";
  }

  // Wellness
  if (n.includes("massage")) return "massage";
  if (n.includes("body polish") || n.includes("back polish")) return "spa";
  if (category === "wellness") return "wellness";

  return illustrationForCategory(category);
}
