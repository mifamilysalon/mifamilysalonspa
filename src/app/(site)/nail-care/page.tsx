import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";

export const metadata: Metadata = { title: "Nail Care" };

export default function NailCarePage() {
  return (
    <ServiceCategoryPage
      title="Nail Care"
      category="nails"
      intro="Pamper your fingers and toes with nail service from Family Hair Salon & Wellness Spa. Manicures, pedicures, shellac, and polish changes are available."
    />
  );
}
