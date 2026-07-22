import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://familysalonspa.com";
  const routes = [
    "",
    "/hair-care",
    "/skin-care",
    "/nail-care",
    "/wellness",
    "/private-area",
    "/gallery",
    "/gift-certificates",
    "/products",
    "/about",
    "/contact",
    "/appointments",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" || path === "/appointments" ? 1 : 0.8,
  }));
}
