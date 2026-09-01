import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/sections/HeroSection";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hero preview (family background test)",
  robots: { index: false, follow: false },
};

/** Temporary preview only — does not change the live homepage hero. */
export default async function HeroFamilyBackgroundPreviewPage() {
  const business = await getBusinessInfo();

  return (
    <div>
      <div className="print:hidden border-b border-salon-border bg-salon-light px-4 py-3 text-center text-sm text-salon-body md:px-6">
        Preview only: family hero as full-bleed background (old hero style).
        Live homepage is unchanged.{" "}
        <Link href="/" className="font-medium text-salon-primary underline">
          Back to site
        </Link>
      </div>
      <HeroSection
        headline="Family Hair Salon & Wellness Spa"
        subhead="Hair, skin, nails, and wellness for Farmington. Walk in for a cut, color, facial, or manicure - or book time in our private suite if you prefer a quieter setting."
        illustrated={false}
        image="/illustrations/hero-family-test.png"
        tone="color"
        ctaPrimary="Book an appointment"
        ctaPrimaryHref="/appointments"
        ctaSecondary={`Call ${business.phone_primary}`}
        ctaSecondaryHref={`tel:${business.phone_primary.replace(/\D/g, "")}`}
      />
    </div>
  );
}
