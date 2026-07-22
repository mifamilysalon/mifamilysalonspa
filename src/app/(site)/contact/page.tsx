import type { Metadata } from "next";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const business = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">Contact</h1>
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
              Address
            </p>
            <p className="mt-2 text-lg text-salon-heading">{business.address}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
              Phone
            </p>
            <a
              href={`tel:${business.phone_primary.replace(/\D/g, "")}`}
              className="mt-2 block text-lg text-salon-heading hover:text-salon-primary"
            >
              {business.phone_primary}
            </a>
            <a
              href={`tel:${business.phone_secondary.replace(/\D/g, "")}`}
              className="mt-1 block text-lg text-salon-heading hover:text-salon-primary"
            >
              {business.phone_secondary}
            </a>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
              Hours
            </p>
            <p className="mt-2 text-salon-body">{business.hours}</p>
          </div>
        </div>
        <div className="editorial-panel overflow-hidden">
          <iframe
            title="Map to Family Hair Salon & Wellness Spa"
            className="h-80 w-full border-0 md:h-full min-h-[320px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=34777+Grand+River+Ave,+Farmington,+MI+48335&output=embed"
          />
        </div>
      </div>
    </div>
  );
}
