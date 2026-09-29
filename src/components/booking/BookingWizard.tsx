"use client";

import { format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Service, StaffProfile } from "@/lib/site";
import { BROCHURE_CATEGORY_LABELS } from "@/lib/service-categories";

type TimeSlot = { start: string; end: string };

type StepId = "service" | "staff" | "datetime" | "contact" | "confirm";

type BookingResult = {
  id: number;
  status: string;
  bookingSource: string;
};

function formatSlotTime(iso: string): string {
  return format(parseISO(iso), "h:mm a");
}

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

function formatCategory(category: string): string {
  const key = category as keyof typeof BROCHURE_CATEGORY_LABELS;
  return BROCHURE_CATEGORY_LABELS[key] || category;
}

export function BookingWizard({ smsEnabled = false }: { smsEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service");

  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<BookingResult | null>(null);
  const [invalidService, setInvalidService] = useState(false);

  const [step, setStep] = useState<StepId>("service");
  const [service, setService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [preferredDatetime, setPreferredDatetime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  const isInstant = service?.booking_type === "instant";

  const steps: StepId[] = useMemo(() => {
    if (!service) return ["service"];
    if (isInstant) {
      return ["service", "staff", "datetime", "contact", "confirm"];
    }
    return ["service", "datetime", "contact", "confirm"];
  }, [service, isInstant]);

  const stepIndex = steps.indexOf(step);
  const progress = steps.length > 1 ? ((stepIndex + 1) / steps.length) * 100 : 20;

  useEffect(() => {
    async function loadInitial() {
      try {
        const servicesRes = await fetch("/api/services");
        const servicesData = (await servicesRes.json()) as { services?: Service[] };
        const list = servicesData.services || [];
        setServices(list);

        if (preselectedServiceId) {
          const match = list.find(
            (s: Service) => String(s.id) === preselectedServiceId,
          );
          if (match) {
            setInvalidService(false);
            setService(match);
            setStep(match.booking_type === "instant" ? "staff" : "datetime");
          } else {
            setInvalidService(true);
            setService(null);
            setStep("service");
          }
        }
      } catch {
        setError("Could not load services. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [preselectedServiceId]);

  useEffect(() => {
    if (!service || !isInstant) return;

    const svc = service;

    async function loadStaff() {
      try {
        const res = await fetch(`/api/staff?serviceId=${svc.id}`);
        const data = (await res.json()) as { staff?: StaffProfile[] };
        setStaff(data.staff || []);
      } catch {
        setError("Could not load staff.");
      }
    }

    loadStaff();
  }, [service, isInstant]);

  useEffect(() => {
    if (!service || !selectedStaff || !selectedDate || !isInstant) {
      setSlots([]);
      return;
    }

    const svc = service;
    const staffMember = selectedStaff;

    async function loadSlots() {
      setSlotsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/availability?staffId=${staffMember.id}&serviceId=${svc.id}&date=${selectedDate}`,
        );
        const data = (await res.json()) as { slots?: TimeSlot[] };
        setSlots(data.slots || []);
        setSelectedSlot(null);
      } catch {
        setError("Could not load available times.");
      } finally {
        setSlotsLoading(false);
      }
    }

    loadSlots();
  }, [service, selectedStaff, selectedDate, isInstant]);

  const startDatetime = useMemo(() => {
    if (isInstant && selectedSlot) return selectedSlot.start;
    if (!isInstant && preferredDatetime) {
      return preferredDatetime.length === 16 ? `${preferredDatetime}:00` : preferredDatetime;
    }
    return "";
  }, [isInstant, selectedSlot, preferredDatetime]);

  const goNext = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1]);
      setError(null);
    }
  }, [step, steps]);

  const goBack = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx > 0) {
      setStep(steps[idx - 1]);
      setError(null);
    }
  }, [step, steps]);

  async function handleSubmit() {
    if (!service || !startDatetime) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        serviceId: service.id,
        clientName,
        clientEmail: clientEmail || "",
        clientPhone,
        startDatetime,
        notes: notes || undefined,
        smsOptIn: smsEnabled ? smsOptIn : false,
      };

      if (isInstant && selectedStaff) {
        payload.staffId = selectedStaff.id;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; id: number; status: string; bookingSource: string };
      if (!res.ok) {
        setError(data.error || "Booking failed. Please try again.");
        return;
      }

      setDone({
        id: data.id,
        status: data.status,
        bookingSource: data.bookingSource,
      });
    } catch {
      setError("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function stepLabel(s: StepId): string {
    switch (s) {
      case "service":
        return "Service";
      case "staff":
        return "Stylist";
      case "datetime":
        return isInstant ? "Date and time" : "Preferred time";
      case "contact":
        return "Your details";
      case "confirm":
        return "Confirm";
      default:
        return s;
    }
  }

  if (loading) {
    return (
      <div className="editorial-panel mx-auto max-w-2xl p-8 text-center">
        <p className="text-salon-body">Loading booking options...</p>
      </div>
    );
  }

  if (done) {
    const confirmed = done.status === "confirmed";
    return (
      <div className="editorial-panel mx-auto max-w-2xl p-8 text-center fade-in">
        <h2 className="font-serif text-2xl text-salon-heading">
          {confirmed ? "Appointment confirmed" : "Appointment request received"}
        </h2>
        <p className="mt-4 text-salon-body">
          {confirmed
            ? "Your appointment is booked. We sent a confirmation to your email if you provided one."
            : "Thanks! We've received your appointment request. Our team will review it and contact you to confirm."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-12 bg-salon-primary px-8 py-3 text-white transition hover:bg-salon-hover"
          >
            Back to home
          </button>
          <button
            type="button"
            onClick={() => router.push("/contact")}
            className="min-h-12 border border-salon-border px-6 py-3 text-salon-heading transition hover:border-salon-primary"
          >
            Contact us
          </button>
        </div>
      </div>
    );
  }

  if (invalidService) {
    return (
      <div className="editorial-panel mx-auto max-w-2xl p-8 text-center fade-in">
        <h2 className="font-serif text-2xl text-salon-heading">
          We couldn&apos;t find that service
        </h2>
        <p className="mt-4 text-salon-body">
          Please choose another service from our menu, or call us if you need help.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setInvalidService(false);
              setStep("service");
              router.replace("/appointments?intent=appointment");
            }}
            className="min-h-12 bg-salon-primary px-8 py-3 text-white transition hover:bg-salon-hover"
          >
            Choose a service
          </button>
          <button
            type="button"
            onClick={() => router.push("/hair-care")}
            className="min-h-12 border border-salon-border px-6 py-3 text-salon-heading transition hover:border-salon-primary"
          >
            View services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {service && (
        <div className="mb-6 text-center md:text-left">
          <h2 className="font-serif text-2xl text-salon-heading md:text-3xl">
            {isInstant ? "Book" : "Request"} {service.name}
          </h2>
          <p className="mt-2 text-sm text-salon-body">
            {formatDuration(service.duration_minutes)}
            {service.category ? ` · ${formatCategory(service.category)}` : ""}
            {isInstant ? " · instant confirmation" : " · we will confirm availability"}
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-salon-body">
          <span>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span>{stepLabel(step)}</span>
        </div>
        <div
          className="h-1 bg-salon-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={`Booking progress: step ${stepIndex + 1} of ${steps.length}, ${stepLabel(step)}`}
        >
          <div
            className="h-full bg-salon-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="editorial-panel p-6 md:p-8">
        {error && (
          <p
            role="alert"
            className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {step === "service" && (
          <div>
            <h3 className="font-serif text-2xl text-salon-heading">Choose a service</h3>
            <p className="mt-2 text-sm text-salon-body">
              Select the service you would like to book.
            </p>
            <ul className="mt-6 divide-y divide-salon-border">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setService(s);
                      setSelectedStaff(null);
                      setSelectedDate("");
                      setSelectedSlot(null);
                      setPreferredDatetime("");
                      setStep(s.booking_type === "instant" ? "staff" : "datetime");
                      setError(null);
                    }}
                    className="flex min-h-12 w-full flex-col items-start gap-1 py-4 text-left transition hover:bg-salon-light/40 md:flex-row md:items-center md:justify-between"
                  >
                    <span>
                      <span className="block font-medium text-salon-heading">{s.name}</span>
                      <span className="text-sm text-salon-body">
                        {formatDuration(s.duration_minutes)} ·{" "}
                        {s.booking_type === "instant" ? "Instant book" : "Request"}
                      </span>
                    </span>
                    <span className="text-sm text-salon-primary">Select</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "staff" && service && (
          <div>
            <h3 className="font-serif text-2xl text-salon-heading">Choose your stylist</h3>
            <p className="mt-2 text-sm text-salon-body">
              Service: {service.name}
            </p>
            <ul className="mt-6 divide-y divide-salon-border">
              {staff.length === 0 && (
                <li className="py-4 text-salon-body">No stylists available for this service.</li>
              )}
              {staff.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaff(member);
                      goNext();
                    }}
                    className="flex min-h-12 w-full items-center justify-between py-4 text-left transition hover:bg-salon-light/40"
                  >
                    <span>
                      <span className="block font-medium text-salon-heading">
                        {member.display_name}
                      </span>
                      {member.bio && (
                        <span className="text-sm text-salon-body">{member.bio}</span>
                      )}
                    </span>
                    <span className="text-sm text-salon-primary">Select</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "datetime" && service && (
          <div>
            <h3 className="font-serif text-2xl text-salon-heading">
              {isInstant ? "Pick a date and time" : "Preferred date and time"}
            </h3>
            <p className="mt-2 text-sm text-salon-body">
              {isInstant
                ? `Choose an open slot for ${service.name}.`
                : `Submit your preferred date and time for ${service.name}. Our team will confirm availability.`}
            </p>

            {isInstant ? (
              <div className="mt-6 space-y-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-salon-heading">Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="min-h-12 w-full border border-salon-border bg-salon-panel px-4 text-salon-body"
                  />
                </label>

                {selectedDate && (
                  <div>
                    <span className="mb-2 block text-sm font-medium text-salon-heading">
                      Available times
                    </span>
                    {slotsLoading ? (
                      <p className="text-sm text-salon-body">Loading times...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-salon-body">
                        No open slots on this date. Try another day.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`min-h-12 border px-3 py-2 text-sm transition ${
                              selectedSlot?.start === slot.start
                                ? "border-salon-primary bg-salon-light text-salon-heading"
                                : "border-salon-border hover:border-salon-primary"
                            }`}
                          >
                            {formatSlotTime(slot.start)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-medium text-salon-heading">
                  Preferred date and time
                </span>
                <input
                  type="datetime-local"
                  value={preferredDatetime}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setPreferredDatetime(e.target.value)}
                  className="min-h-12 w-full border border-salon-border bg-salon-panel px-4 text-salon-body"
                />
              </label>
            )}
          </div>
        )}

        {step === "contact" && (
          <div>
            <h3 className="font-serif text-2xl text-salon-heading">Your contact details</h3>
            {service && (
              <p className="mt-2 text-sm text-salon-body">Service: {service.name}</p>
            )}
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-salon-heading">
                  Full name *
                </span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="min-h-12 w-full border border-salon-border bg-salon-panel px-4 text-salon-body"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-salon-heading">Phone *</span>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="min-h-12 w-full border border-salon-border bg-salon-panel px-4 text-salon-body"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-salon-heading">Email</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="min-h-12 w-full border border-salon-border bg-salon-panel px-4 text-salon-body"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-salon-heading">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-salon-border bg-salon-panel px-4 py-3 text-salon-body"
                  placeholder="Allergies, preferences, or questions"
                />
              </label>
              {smsEnabled && (
                <label className="flex min-h-12 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="h-5 w-5 accent-salon-primary"
                  />
                  <span className="text-sm text-salon-body">
                    Text me appointment reminders (SMS)
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {step === "confirm" && service && (
          <div>
            <h3 className="font-serif text-2xl text-salon-heading">
              {isInstant ? "Review and confirm" : "Review your request"}
            </h3>
            <dl className="mt-6 space-y-3 text-salon-body">
              <div className="flex justify-between border-b border-salon-border pb-2">
                <dt>Service</dt>
                <dd className="text-salon-heading">{service.name}</dd>
              </div>
              {selectedStaff && (
                <div className="flex justify-between border-b border-salon-border pb-2">
                  <dt>Stylist</dt>
                  <dd className="text-salon-heading">{selectedStaff.display_name}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-salon-border pb-2">
                <dt>When</dt>
                <dd className="text-salon-heading">
                  {startDatetime
                    ? format(parseISO(startDatetime), "EEE, MMM d yyyy 'at' h:mm a")
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-salon-border pb-2">
                <dt>Name</dt>
                <dd className="text-salon-heading">{clientName}</dd>
              </div>
              <div className="flex justify-between border-b border-salon-border pb-2">
                <dt>Phone</dt>
                <dd className="text-salon-heading">{clientPhone}</dd>
              </div>
              {clientEmail && (
                <div className="flex justify-between border-b border-salon-border pb-2">
                  <dt>Email</dt>
                  <dd className="text-salon-heading">{clientEmail}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {stepIndex > 0 && step !== "service" && (
            <button
              type="button"
              onClick={goBack}
              className="min-h-12 border border-salon-border px-6 py-3 text-salon-heading transition hover:border-salon-primary"
            >
              Back
            </button>
          )}

          {step === "datetime" && (
            <button
              type="button"
              onClick={() => {
                if (isInstant && (!selectedDate || !selectedSlot)) {
                  setError("Please select a date and time.");
                  return;
                }
                if (!isInstant && !preferredDatetime) {
                  setError("Please enter your preferred date and time.");
                  return;
                }
                goNext();
              }}
              className="min-h-12 bg-salon-primary px-8 py-3 text-white transition hover:bg-salon-hover"
            >
              Continue
            </button>
          )}

          {step === "contact" && (
            <button
              type="button"
              onClick={() => {
                if (clientName.trim().length < 2) {
                  setError("Please enter your name.");
                  return;
                }
                if (clientPhone.trim().length < 7) {
                  setError("Please enter a valid phone number.");
                  return;
                }
                goNext();
              }}
              className="min-h-12 bg-salon-primary px-8 py-3 text-white transition hover:bg-salon-hover"
            >
              Continue
            </button>
          )}

          {step === "confirm" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="min-h-12 bg-salon-primary px-8 py-3 text-white transition hover:bg-salon-hover disabled:opacity-60"
            >
              {submitting
                ? isInstant
                  ? "Booking..."
                  : "Submitting..."
                : isInstant
                  ? "Confirm booking"
                  : "Submit request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
