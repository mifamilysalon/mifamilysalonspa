import type { Metadata } from "next";
import { AppointmentsClient } from "@/components/booking/AppointmentsClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getSmsSettings } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Book Appointments & Walk-ins",
  description:
    "Book ahead or join the walk-in list at Family Hair Salon & Wellness Spa in Farmington, MI. Instant book or request-to-confirm services online.",
  path: "/appointments",
  keywords: [
    "book hair salon Farmington",
    "walk in haircut Farmington MI",
    "salon appointment online Michigan",
  ],
});

export default async function AppointmentsPage() {
  const sms = await getSmsSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Appointments", path: "/appointments" },
        ])}
      />
      <div className="mb-8 text-center md:mb-10">
        <h1 className="font-serif text-3xl text-salon-heading md:text-4xl">
          Appointments & walk-ins
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-salon-body">
          Book a future visit, or check in as a walk-in for today. Walk-ins are our most common
          visits and are served as soon as a chair opens.
        </p>
        <hr className="gold-rule mx-auto mt-6 w-16" />
      </div>

      <AppointmentsClient smsEnabled={sms.enabled} />
    </div>
  );
}
