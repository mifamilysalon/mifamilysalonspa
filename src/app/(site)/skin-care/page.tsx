import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";

export const metadata: Metadata = { title: "Skin Care" };

export default function SkinCarePage() {
  return (
    <ServiceCategoryPage
      title="Skin Care"
      category="skin"
      intro="Skin care and skin treatments improve the wellness of your skin. Our professionals suggest treatments after examining your skin type, including dermatological facials guided by face mapping skin analysis."
    />
  );
}
