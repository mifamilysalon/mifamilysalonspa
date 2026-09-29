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

/** Map service id -> illustration (seeded catalog). */
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

export function illustrationForService(
  serviceId: number,
  category?: string,
): IllustrationId {
  if (SERVICE_ILLUSTRATION[serviceId]) return SERVICE_ILLUSTRATION[serviceId];
  if (category === "hair") return "hair";
  if (category === "skin" || category === "facials") return "facial";
  if (category === "nails") return "nails";
  if (category === "waxing") return "wax";
  if (category === "wellness") return "wellness";
  if (category === "threading" || category === "lashes" || category === "makeup" || category === "henna")
    return "skin";
  return "interior";
}
