import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Make-Up in Farmington",
  description:
    "Party, bridal, and event make-up at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/makeup",
});

export default function MakeupPage() {
  return (
    <ServiceCategoryPage
      title="Make-Up"
      category="makeup"
      intro="Party, bridal, and event make-up by appointment."
    />
  );
}
