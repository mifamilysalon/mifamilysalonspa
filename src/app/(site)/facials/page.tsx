import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Facials & Skin Care in Farmington, MI",
  description:
    "Facials and skin treatments at Family Hair Salon & Wellness Spa in Farmington, MI. Book online or call (248) 474-6520.",
  path: "/facials",
});

export default function FacialsPage() {
  return (
    <ServiceCategoryPage
      title="Facials"
      category="facials"
      path="/facials"
      intro="Facials and skin treatments from our in-salon menu. Your therapist can recommend options after a quick skin check."
    />
  );
}
