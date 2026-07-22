import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";

export const metadata: Metadata = { title: "Wellness" };

export default function WellnessPage() {
  return (
    <ServiceCategoryPage
      title="Wellness"
      category="wellness"
      intro="Wellness services include grooming, body wax, massage, and related treatments. Ask our team which option fits your schedule and comfort."
    />
  );
}
