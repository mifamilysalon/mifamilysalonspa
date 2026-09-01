"use client";

import { Suspense, useState } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { WalkInForm } from "@/components/booking/WalkInForm";

type Intent = "choose" | "appointment" | "walk_in";

function AppointmentsContent({ smsEnabled }: { smsEnabled: boolean }) {
  const [intent, setIntent] = useState<Intent>("choose");

  if (intent === "appointment") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIntent("choose")}
          className="mb-4 text-sm text-salon-body underline underline-offset-4 hover:text-salon-primary"
        >
          Back to options
        </button>
        <BookingWizard smsEnabled={smsEnabled} />
      </div>
    );
  }

  if (intent === "walk_in") {
    return <WalkInForm smsEnabled={smsEnabled} onBack={() => setIntent("choose")} />;
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      {/* Walk-in first: Pareto / mental model — most common visit type */}
      <button
        type="button"
        onClick={() => setIntent("walk_in")}
        className="border-2 border-salon-primary bg-salon-panel p-6 text-left transition hover:bg-salon-light/50 md:p-8"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-salon-primary">
          Same day · most common
        </p>
        <h2 className="mt-3 font-serif text-2xl text-salon-heading">
          Walk in today
        </h2>
        <p className="mt-3 text-sm text-salon-body">
          Join the walk-in list for today. We take guests as chairs open.
        </p>
      </button>
      <button
        type="button"
        onClick={() => setIntent("appointment")}
        className="border border-salon-border bg-salon-panel p-6 text-left transition hover:border-salon-primary md:p-8"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-salon-primary">
          Plan ahead
        </p>
        <h2 className="mt-3 font-serif text-2xl text-salon-heading">
          Book an appointment
        </h2>
        <p className="mt-3 text-sm text-salon-body">
          Pick a service, stylist, and time. Instant services confirm right
          away; others are reviewed by the team.
        </p>
      </button>
    </div>
  );
}

export function AppointmentsClient({ smsEnabled }: { smsEnabled: boolean }) {
  return (
    <Suspense
      fallback={
        <div className="editorial-panel mx-auto max-w-2xl p-8 text-center">
          <p className="text-salon-body">Loading...</p>
        </div>
      }
    >
      <AppointmentsContent smsEnabled={smsEnabled} />
    </Suspense>
  );
}
