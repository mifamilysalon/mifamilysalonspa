import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lashes in Farmington",
  description:
    "Lash and brow services at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/lashes",
});

export default function LashesPage() {
  return (
    <ServiceCategoryPage
      title="Lashes"
      category="lashes"
      intro="Lash and brow enhancement from our service menu."
    />
  );
}
