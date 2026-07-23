import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Skin Care & Facials in Farmington",
  description:
    "Dermatological facials and face mapping skin analysis at Family Hair Salon & Wellness Spa in Farmington, MI. Book a facial online.",
  path: "/skin-care",
  keywords: ["facial Farmington MI", "skin care salon Farmington", "face mapping Michigan"],
});

export default function SkinCarePage() {
  return (
    <ServiceCategoryPage
      title="Skin Care"
      category="skin"
      intro="Skin therapists suggest treatments only after examining your skin type with face mapping analysis. Facials and skin care for Farmington clients who want calm, results-focused appointments."
    />
  );
}
