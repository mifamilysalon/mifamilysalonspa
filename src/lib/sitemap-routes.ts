/** Public indexable routes for sitemap.xml (no redirects / noindex). */
export type SitemapRoute = {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

export const SITEMAP_ROUTES: SitemapRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/appointments", changeFrequency: "weekly", priority: 0.95 },
  { path: "/hair-care", changeFrequency: "monthly", priority: 0.9 },
  { path: "/facials", changeFrequency: "monthly", priority: 0.9 },
  { path: "/nail-care", changeFrequency: "monthly", priority: 0.9 },
  { path: "/threading", changeFrequency: "monthly", priority: 0.85 },
  { path: "/waxing", changeFrequency: "monthly", priority: 0.85 },
  { path: "/lashes", changeFrequency: "monthly", priority: 0.85 },
  { path: "/makeup", changeFrequency: "monthly", priority: 0.85 },
  { path: "/henna", changeFrequency: "monthly", priority: 0.85 },
  { path: "/wellness", changeFrequency: "monthly", priority: 0.85 },
  { path: "/private-area", changeFrequency: "monthly", priority: 0.85 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about", changeFrequency: "monthly", priority: 0.75 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/gift-certificates", changeFrequency: "monthly", priority: 0.7 },
  { path: "/offers", changeFrequency: "weekly", priority: 0.75 },
  { path: "/products", changeFrequency: "monthly", priority: 0.65 },
];

/** Bump when major public content ships so crawlers see a fresh lastmod.
 * Keep `public/sitemap.xml` in sync (static asset — Google-fetchable on Cloudflare).
 */
export const SITEMAP_CONTENT_LASTMOD = "2026-09-30";

/** Build sitemap XML body for `public/sitemap.xml` / tests. */
export function buildSitemapXml(
  siteUrl = "https://www.mifamilysalon.com",
  lastmod = SITEMAP_CONTENT_LASTMOD,
): string {
  const urls = SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => {
    const loc = path ? `${siteUrl}${path}` : siteUrl;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changeFrequency}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}
