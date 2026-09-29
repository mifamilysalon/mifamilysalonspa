import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Threading Services in Farmington, MI",
  description:
    "Eyebrow and facial threading at Family Hair Salon & Wellness Spa in Farmington, MI. Book online or walk in when available.",
  path: "/threading",
});

export default function ThreadingPage() {
  return (
    <ServiceCategoryPage
      title="Threading"
      category="threading"
      path="/threading"
      intro="Eyebrow and facial threading at our Grand River Ave salon. Quick appointments and walk-ins when the schedule allows."
    />
  );
}
