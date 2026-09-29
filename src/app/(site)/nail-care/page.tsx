import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Nail Services in Farmington, MI",
  description:
    "Manicures, pedicures, shellac, and polish changes from Farmington nail technicians. Book at Family Hair Salon & Wellness Spa.",
  path: "/nail-care",
  keywords: ["manicure Farmington MI", "pedicure Farmington", "shellac nails Michigan"],
});

export default function NailCarePage() {
  return (
    <ServiceCategoryPage
      title="Nail Care"
      category="nails"
      path="/nail-care"
      intro="Manicures, pedicures, shellac, and polish changes. Walk in when seats are open, or book ahead for a set time."
    />
  );
}
