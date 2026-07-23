import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Hair Care in Farmington, MI",
  description:
    "Haircuts, color, highlights, extensions, perms, and straightening at Family Hair Salon & Wellness Spa in Farmington, MI. Book online or walk in.",
  path: "/hair-care",
  keywords: ["haircut Farmington MI", "hair color Farmington", "highlights salon Michigan"],
});

export default function HairCarePage() {
  return (
    <ServiceCategoryPage
      title="Hair Care"
      category="hair"
      intro="Hair care and hair treatments focus on maintaining and enhancing the wellness of your hair. We offer creative styling, coloring, extensions, permanent waving, straightening, and rebonding for Farmington and Metro Detroit clients."
    />
  );
}
