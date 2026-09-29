import type { Metadata } from "next";
import Link from "next/link";
import { IllustrationPanel } from "@/components/illustrations";
import { FaqSection } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "About Our Farmington Salon & Spa",
  description:
    "Learn about Family Hair Salon & Wellness Spa on Grand River Ave in Farmington, MI. Hair, skin, nails, wellness, and a private women's suite.",
  path: "/about",
  keywords: ["about Family Hair Salon", "Farmington spa", "Grand River Ave salon"],
});

export default async function AboutPage() {
  const business = await getBusinessInfo();

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ])}
        />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl">About us</h1>
            <p className="mt-8 text-lg text-salon-body">
              {business.name} is a full-service salon and wellness spa at{" "}
              {business.address}. Our team helps Farmington and nearby Metro
              Detroit clients with hair, skin, nails, and wellness, whether you
              walk in for a trim or book time in our private women&apos;s suite.
            </p>
            <p className="mt-5 text-salon-body">
              We focus on clear consultations, calm service, and practical
              results: creative cuts and color, dermatological facials after face
              mapping, manicures and pedicures, and wellness appointments when
              you need to reset.
            </p>
            <p className="mt-5 text-salon-body">
              Hours: {business.hours}. Call {business.phone_primary} or{" "}
              {business.phone_secondary}, or{" "}
              <Link
                href="/appointments"
                className="text-salon-primary underline underline-offset-4"
              >
                book online
              </Link>
              .
            </p>
            <Link
              href="/appointments"
              className="mt-10 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
            >
              Book an appointment
            </Link>
          </div>
          <IllustrationPanel id="interior" title="Salon atmosphere" />
        </div>
      </div>
      <FaqSection
        faqs={[
          {
            question: "Who is Family Hair Salon & Wellness Spa for?",
            answer:
              "We serve individuals and families in Farmington, MI and nearby cities who want hair, skin, nail, and wellness care, including guests who prefer our private women's suite.",
          },
          {
            question: "How long has the salon been on Grand River Ave?",
            answer:
              "We are an established Farmington salon at 34777 Grand River Ave. Call (248) 474-6520 to ask about current stylists, services, or availability.",
          },
        ]}
      />
    </div>
  );
}
