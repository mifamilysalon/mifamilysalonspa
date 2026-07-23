import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Hair & Skin Products",
  description:
    "Professional hair and skin care products recommended by stylists at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/products",
});

export default async function ProductsPage() {
  const business = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">Products</h1>
      <p className="mt-8 text-lg text-salon-body">
        We carry professional hair and skin care products selected for the
        services we provide. Ask your stylist or therapist for recommendations
        during your visit.
      </p>
      <p className="mt-5 text-salon-body">
        Product availability changes. Call {business.phone_primary} if you need
        a specific item reserved at our Farmington location.
      </p>
      <Link
        href="/contact"
        className="mt-10 inline-block border border-salon-border px-6 py-3 text-sm font-medium text-salon-heading hover:border-salon-primary"
      >
        Contact the salon
      </Link>
    </div>
  );
}
