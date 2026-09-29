import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bridal & Event Makeup in Farmington, MI",
  description:
    "Party, bridal, and event makeup at Family Hair Salon & Wellness Spa in Farmington, MI. Request an appointment online.",
  path: "/makeup",
});

export default function MakeupPage() {
  return (
    <ServiceCategoryPage
      title="Make-Up"
      category="makeup"
      path="/makeup"
      intro="Party, bridal, and event makeup by appointment. Tell us the date and look you want when you request a time."
    />
  );
}
