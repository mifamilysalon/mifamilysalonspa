import type { Metadata } from "next";
import {
  GiftCertificatePrintButton,
  GiftCertificateTemplate,
} from "@/components/gift/GiftCertificateTemplate";
import { buildPageMetadata } from "@/lib/seo";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Gift Certificates",
  description:
    "Purchase salon gift certificates in person or by phone at Family Hair Salon & Wellness Spa in Farmington, MI. Call (248) 474-6520.",
  path: "/gift-certificates",
});

export default async function GiftCertificatesPage() {
  const business = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <div className="gift-cert-intro print:hidden">
        <h1 className="font-serif text-4xl md:text-5xl">Gift certificates</h1>
        <p className="mt-8 text-lg text-salon-body">
          Gift certificates are available in person at the salon or by phone. We
          do not process gift certificate payments online. After purchase, staff
          or admin fill the designed certificate and email it to the customer —
          staff submissions require admin approval first.
        </p>
        <p className="mt-5 text-salon-body">
          Call {business.phone_primary} or {business.phone_secondary} to
          purchase, or visit us at {business.address}. Certificates can be used
          for hair, skin, nail, and wellness services.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={`tel:${business.phone_primary.replace(/\D/g, "")}`}
            className="inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
          >
            Call to purchase
          </a>
          <GiftCertificatePrintButton />
        </div>
        <p className="mt-10 text-sm uppercase tracking-[0.16em] text-salon-primary">
          Certificate design
        </p>
        <p className="mt-2 max-w-2xl text-salon-body">
          Blank print template below. For emailed certificates, use Staff or
          Admin portals after the purchase is taken in salon.
        </p>
      </div>

      <div className="mt-8 print:mt-0">
        <GiftCertificateTemplate
          salonName={business.name}
          address={business.address}
          phonePrimary={business.phone_primary}
          phoneSecondary={business.phone_secondary}
        />
      </div>
    </div>
  );
}
