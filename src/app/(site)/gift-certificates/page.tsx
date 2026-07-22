import type { Metadata } from "next";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = { title: "Gift Certificates" };

export default async function GiftCertificatesPage() {
  const business = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">Gift certificates</h1>
      <p className="mt-8 text-lg text-salon-body">
        Gift certificates are available in person at the salon or by phone. We
        do not process gift certificate payments online.
      </p>
      <p className="mt-5 text-salon-body">
        Call {business.phone_primary} or {business.phone_secondary} to purchase,
        or visit us at {business.address}.
      </p>
      <a
        href={`tel:${business.phone_primary.replace(/\D/g, "")}`}
        className="mt-10 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
      >
        Call to purchase
      </a>
    </div>
  );
}
