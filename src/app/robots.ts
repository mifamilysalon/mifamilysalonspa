import type { MetadataRoute } from "next";
import { SITE_HOST, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/staff",
          "/staff/",
          "/api/",
          "/_next/",
          "/menu",
          "/menu/",
          "/r/",
          "/preview/",
        ],
      },
      // Answer / generative engines — allow public pages (same disallow set)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/admin", "/admin/", "/staff", "/staff/", "/api/", "/_next/", "/menu", "/menu/", "/r/", "/preview/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
