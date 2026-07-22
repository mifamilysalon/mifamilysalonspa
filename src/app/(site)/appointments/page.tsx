import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getSmsSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Book hair, skin, nail, and wellness appointments online at Family Hair Salon & Wellness Spa in Farmington, MI.",
};

export default async function AppointmentsPage() {
  const sms = await getSmsSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 text-center md:mb-10">
        <h1 className="font-serif text-3xl text-salon-heading md:text-4xl">
          Book an appointment
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-salon-body">
          Choose your service and preferred time. Instant bookings confirm right away.
          Other services are reviewed by our team.
        </p>
        <hr className="gold-rule mx-auto mt-6 w-16" />
      </div>

      <Suspense
        fallback={
          <div className="editorial-panel mx-auto max-w-2xl p-8 text-center">
            <p className="text-salon-body">Loading...</p>
          </div>
        }
      >
        <BookingWizard smsEnabled={sms.enabled} />
      </Suspense>
    </div>
  );
}
