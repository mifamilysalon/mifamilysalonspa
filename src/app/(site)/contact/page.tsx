import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { getBusinessInfo, getSocialLinks } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact & Hours — Farmington, MI",
  description:
    "Visit Family Hair Salon & Wellness Spa at 34777 Grand River Ave, Farmington, MI 48335. Hours Mon–Fri 9–6, Sat 9–5. Call (248) 474-6520.",
  path: "/contact",
  keywords: [
    "salon near me Farmington MI",
    "Family Hair Salon phone",
    "Grand River Ave spa hours",
  ],
});

export default async function ContactPage() {
  const business = await getBusinessInfo();
  const social = await getSocialLinks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          buildLocalBusinessJsonLd({ social }),
        ]}
      />
      <h1 className="font-serif text-4xl md:text-5xl">Contact</h1>
      <p className="mt-5 max-w-2xl text-lg text-salon-body">
        Find us on Grand River Ave in Farmington. Call, book online, or stop in
        during open hours — walk-ins are welcome for many services.
      </p>
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
              Address
            </p>
            <p className="mt-2 text-lg text-salon-heading">{business.address}</p>
            <p className="mt-2 text-sm text-salon-body">
              Serving Farmington, Farmington Hills, Livonia, West Bloomfield, and Novi.
            </p>
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
          <Link
            href="/appointments"
            className="inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
          >
            Book or walk in
          </Link>
        </div>
        <div className="editorial-panel overflow-hidden">
          <iframe
            title="Map to Family Hair Salon & Wellness Spa at 34777 Grand River Ave, Farmington, MI"
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
