import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_FAQS } from "@/lib/seo";
import { FaqSection } from "@/components/seo/FaqSection";

export const metadata: Metadata = buildPageMetadata({
  title: "Private Women's Suite",
  description:
    "Private women's suite in Farmington, MI for female clientele who prefer complete privacy, including women who wear hijab. Book at Family Hair Salon & Wellness Spa.",
  path: "/private-area",
  keywords: [
    "private suite salon Farmington",
    "hijab friendly salon Michigan",
    "women only salon Farmington MI",
  ],
});

export default function PrivateAreaPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Private women's suite", path: "/private-area" },
          ])}
        />
        <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
          Private women&apos;s suite
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          A private area for female clientele
        </h1>
        <p className="mt-8 text-lg text-salon-body">
          This area was designed to accommodate women who require or prefer
          services in a complete private setting, such as women who wear hijab.
          Appointments in the suite can be requested online or by phone.
        </p>
        <p className="mt-5 text-salon-body">
          Tell us when you book if you need the private suite so we can plan
          staffing and timing. Call (248) 474-6520 or (248) 635-5127 if you have
          questions before your visit.
        </p>
        <Link
          href="/appointments"
          className="mt-10 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
        >
          Request a suite appointment
        </Link>
      </div>
      <FaqSection
        faqs={[
          SITE_FAQS[3],
          {
            question: "How do I reserve the private suite?",
            answer:
              "Choose the private suite service when booking online, or call (248) 474-6520 / (248) 635-5127 and ask for a private-suite appointment. These visits are typically request-to-confirm.",
          },
        ]}
      />
    </div>
  );
}
