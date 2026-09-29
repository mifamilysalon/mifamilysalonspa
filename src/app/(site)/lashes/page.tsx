import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lash Services in Farmington, MI",
  description:
    "Lash and brow services at Family Hair Salon & Wellness Spa in Farmington, MI. Book online or call the desk.",
  path: "/lashes",
});

export default function LashesPage() {
  return (
    <ServiceCategoryPage
      title="Lashes"
      category="lashes"
      path="/lashes"
      intro="Lash and brow services from our Farmington menu. Ask at the desk which option fits your event or everyday look."
    />
  );
}
