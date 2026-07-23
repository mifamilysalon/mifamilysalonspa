import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type RouteConfig = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ROUTES: RouteConfig[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/appointments", changeFrequency: "weekly", priority: 0.95 },
  { path: "/hair-care", changeFrequency: "monthly", priority: 0.9 },
  { path: "/skin-care", changeFrequency: "monthly", priority: 0.9 },
  { path: "/nail-care", changeFrequency: "monthly", priority: 0.9 },
  { path: "/wellness", changeFrequency: "monthly", priority: 0.85 },
  { path: "/private-area", changeFrequency: "monthly", priority: 0.85 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about", changeFrequency: "monthly", priority: 0.75 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/gift-certificates", changeFrequency: "monthly", priority: 0.7 },
  { path: "/products", changeFrequency: "monthly", priority: 0.65 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Stable lastModified for crawlers (update when major content ships)
  const lastModified = new Date("2026-07-22");

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${SITE_URL}${path}` : SITE_URL,
    lastModified,
    changeFrequency,
    priority,
  }));
}
