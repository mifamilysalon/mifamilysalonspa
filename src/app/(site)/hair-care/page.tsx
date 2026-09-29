import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Hair Salon & Hair Services in Farmington, MI",
  description:
    "Haircuts, color, highlights, updos, keratin, and more at Family Hair Salon & Wellness Spa in Farmington, MI. Book online or walk in.",
  path: "/hair-care",
  keywords: ["haircut Farmington MI", "hair color Farmington", "highlights salon Michigan"],
});

export default function HairCarePage() {
  return (
    <ServiceCategoryPage
      title="Hair Care"
      category="hair"
      path="/hair-care"
      intro="Cuts, color, styling, and treatments for women, men, and kids in Farmington. Book ahead or ask about walk-in availability for shorter services."
    />
  );
}
