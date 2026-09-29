import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Threading in Farmington",
  description:
    "Eyebrow and facial threading at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/threading",
});

export default function ThreadingPage() {
  return (
    <ServiceCategoryPage
      title="Threading"
      category="threading"
      intro="Eyebrow and facial threading from our Farmington menu."
    />
  );
}
