import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Henna Services in Farmington, MI",
  description:
    "Henna for hands, bridal, and events at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/henna",
});

export default function HennaPage() {
  return (
    <ServiceCategoryPage
      title="Henna Tattoos"
      category="henna"
      path="/henna"
      intro="Henna for hands, bridal, and special events. Request a time in advance for larger bridal designs."
    />
  );
}
