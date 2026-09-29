import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Facials in Farmington",
  description:
    "Facials and skin treatments at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/facials",
});

export default function FacialsPage() {
  return (
    <ServiceCategoryPage
      title="Facials"
      category="facials"
      intro="Facials and skin treatments from our in-salon menu. Your therapist can recommend options after a quick skin check."
    />
  );
}
