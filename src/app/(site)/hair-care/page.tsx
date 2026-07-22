import type { Metadata } from "next";
import ServiceCategoryPage from "@/components/sections/ServiceCategoryPage";

export const metadata: Metadata = { title: "Hair Care" };

export default function HairCarePage() {
  return (
    <ServiceCategoryPage
      title="Hair Care"
      category="hair"
      intro="Hair care and hair treatments focus on maintaining and enhancing the wellness of your hair. We offer creative styling, coloring, extensions, permanent waving, straightening, and rebonding."
    />
  );
}
