import type { Metadata } from "next";
import { AppointmentsClient } from "@/components/booking/AppointmentsClient";
import { getSmsSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Appointments & Walk-ins",
  description:
    "Book ahead or join the walk-in list at Family Hair Salon & Wellness Spa in Farmington, MI.",
};

export default async function AppointmentsPage() {
  const sms = await getSmsSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
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
