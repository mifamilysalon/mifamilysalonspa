import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceBrochure } from "@/components/brochure/PriceBrochure";
import { getPriceListSettings } from "@/lib/price-list";
import { getBusinessInfo, getServices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service rates",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ObscurePriceListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = await getPriceListSettings();
  if (slug.toLowerCase() !== settings.slug) {
    notFound();
  }

  const [business, services] = await Promise.all([
    getBusinessInfo(),
    getServices(),
  ]);

  return <PriceBrochure salonName={business.name} services={services} />;
}
