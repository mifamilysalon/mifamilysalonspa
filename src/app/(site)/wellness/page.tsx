import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Wellness Services in Farmington",
  description:
    "Massage, waxing, and wellness appointments at Family Hair Salon & Wellness Spa in Farmington, MI. Request a time online.",
  path: "/wellness",
  keywords: ["massage Farmington MI", "waxing Farmington", "wellness spa Michigan"],
});

export default function WellnessPage() {
  return (
    <ServiceCategoryPage
      title="Wellness"
      category="wellness"
      intro="Wellness services including body treatments and massage support in a calm Farmington spa setting. Many wellness visits are request-to-confirm so we can match the right therapist."
    />
  );
}
