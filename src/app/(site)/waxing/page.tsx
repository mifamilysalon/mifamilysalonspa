import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Waxing in Farmington",
  description:
    "Face and body waxing at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/waxing",
});

export default function WaxingPage() {
  return (
    <ServiceCategoryPage
      title="Waxing"
      category="waxing"
      intro="Face and body waxing services at our Grand River Ave salon."
    />
  );
}
