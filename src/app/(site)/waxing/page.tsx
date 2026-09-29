import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Waxing Services in Farmington, MI",
  description:
    "Face and body waxing at Family Hair Salon & Wellness Spa in Farmington, MI. Request an appointment online.",
  path: "/waxing",
});

export default function WaxingPage() {
  return (
    <ServiceCategoryPage
      title="Waxing"
      category="waxing"
      path="/waxing"
      intro="Face and body waxing at our Farmington salon. Tell us which areas you need when you book so we can plan enough time."
    />
  );
}
