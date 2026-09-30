import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

/** Default palette accent / page surface — keep in sync with farmington-rose-gold. */
const THEME_COLOR = "#B86B74";
const BACKGROUND_COLOR = "#FAF7F6";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/staff",
    name: SITE_NAME,
    short_name: "Family Salon",
    description: SITE_TAGLINE,
    start_url: "/staff",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "en-US",
    dir: "ltr",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ["business", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Staff desk",
        short_name: "Staff",
        description: "Open the staff portal",
        url: "/staff",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Admin",
        short_name: "Admin",
        description: "Open the admin dashboard",
        url: "/admin",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
