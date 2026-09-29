import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Wellness Services in Farmington, MI",
  description:
    "Massage and body treatments at Family Hair Salon & Wellness Spa in Farmington, MI. Request a time online.",
  path: "/wellness",
  keywords: ["massage Farmington MI", "body polish Farmington", "wellness spa Michigan"],
});

export default function WellnessPage() {
  return (
    <ServiceCategoryPage
      title="Wellness"
      category="wellness"
      path="/wellness"
      intro="Massage and body treatments in a calm Farmington spa setting. Most wellness visits are request-to-confirm so we can match the right therapist."
    />
  );
}
