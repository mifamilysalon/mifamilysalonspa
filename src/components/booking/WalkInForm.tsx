"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { Service, StaffProfile } from "@/lib/site";
import {
  BROCHURE_CATEGORY_LABELS,
  BROCHURE_CATEGORY_ORDER,
  type BrochureCategoryKey,
} from "@/lib/service-categories";

const ARRIVAL_OPTIONS = [
  { minutes: 0, label: "I'm here now" },
  { minutes: 15, label: "In about 15 minutes" },
  { minutes: 30, label: "In about 30 minutes" },
  { minutes: 45, label: "In about 45 minutes" },
  { minutes: 60, label: "In about 1 hour" },
] as const;

function formatCategory(category: string): string {
  const key = category as keyof typeof BROCHURE_CATEGORY_LABELS;
  return BROCHURE_CATEGORY_LABELS[key] || category;
}

function categorySortIndex(category: string): number {
  const idx = BROCHURE_CATEGORY_ORDER.indexOf(category as BrochureCategoryKey);
  return idx === -1 ? BROCHURE_CATEGORY_ORDER.length : idx;
}

export function WalkInForm({
  smsEnabled = false,
  onBack,
}: {
  smsEnabled?: boolean;
  onBack?: () => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number; startDatetime?: string } | null>(null);

  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [staffId, setStaffId] = useState<number | "">("");
  const [arriveInMinutes, setArriveInMinutes] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  const categoryOptions = useMemo(() => {
    const keys = new Set(services.map((s) => s.category || "other"));
    return [...keys]
      .map((key) => ({ key, label: formatCategory(key) }))
      .sort(
        (a, b) =>
          categorySortIndex(a.key) - categorySortIndex(b.key) ||
          a.label.localeCompare(b.label),
      );
  }, [services]);

  const servicesInCategory = useMemo(() => {
    if (!category) return [];
    return services
      .filter((s) => (s.category || "other") === category)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services, category]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services");
        const data = (await res.json()) as { services?: Service[] };
        setServices(data.services || []);
      } catch {
        setError("Could not load services.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setStaff([]);
      setStaffId("");
      return;
    }
    async function loadStaff() {
      const res = await fetch(`/api/staff?serviceId=${serviceId}`);
      const data = (await res.json()) as { staff?: StaffProfile[] };
      setStaff(data.staff || []);
    }
    loadStaff();
  }, [serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !clientName.trim() || !clientPhone.trim()) {
      setError("Service, name, and phone are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "walk_in",
          serviceId,
          staffId: staffId || null,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientEmail: clientEmail.trim() || "",
          arriveInMinutes,
          notes: notes.trim() || undefined,
          smsOptIn: smsEnabled ? smsOptIn : false,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        id: number;
        startDatetime?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not check you in.");
        return;
      }
      setDone({ id: data.id, startDatetime: data.startDatetime });
    } catch {
      setError("Could not check you in. Please try again or call the salon.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="editorial-panel mx-auto max-w-2xl p-8 text-center">
        <p className="text-salon-body">Loading walk-in options...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="editorial-panel mx-auto max-w-2xl p-8 text-center fade-in">
        <h2 className="font-serif text-2xl text-salon-heading">You are on the walk-in list</h2>
        <p className="mt-4 text-salon-body">
          {done.startDatetime
            ? `We have you down for around ${format(parseISO(done.startDatetime), "h:mm a")}. `
            : ""}
          Please check in at the front desk when you arrive. Walk-ins are served as soon as a
          stylist is free.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-8 min-h-12 border border-salon-border px-6 py-3 text-sm hover:border-salon-primary"
          >
            Back to options
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="editorial-panel mx-auto max-w-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-salon-heading">Walk in today</h2>
          <p className="mt-2 text-sm text-salon-body">
            Join the walk-in queue. No advance time slot needed - we take guests as chairs open.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-10 text-sm text-salon-body underline underline-offset-4 hover:text-salon-primary"
          >
            Book ahead instead
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <label className="mt-6 block text-sm text-salon-body">
        Category
        <select
          required
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setServiceId("");
            setStaffId("");
          }}
          className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading"
        >
          <option value="">Choose a category...</option>
          {categoryOptions.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm text-salon-body">
        Service
        <select
          required
          value={serviceId}
          disabled={!category}
          onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
          className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading disabled:opacity-60"
        >
          <option value="">
            {category ? "Choose a service..." : "Choose a category first"}
          </option>
          {servicesInCategory.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes} min)
            </option>
          ))}
        </select>
      </label>

      {staff.length > 0 && (
        <label className="mt-4 block text-sm text-salon-body">
          Preferred stylist (optional)
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          >
            <option value="">First available</option>
            {staff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-salon-heading">When will you arrive?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ARRIVAL_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              type="button"
              onClick={() => setArriveInMinutes(opt.minutes)}
              className={`min-h-12 border px-4 py-3 text-left text-sm transition ${
                arriveInMinutes === opt.minutes
                  ? "border-salon-primary bg-salon-light text-salon-heading"
                  : "border-salon-border text-salon-body hover:border-salon-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-salon-body">
          Your name
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        <label className="block text-sm text-salon-body">
          Phone
          <input
            required
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm text-salon-body">
        Email (optional)
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="mt-1 block w-full min-h-12 border border-salon-border bg-salon-panel px-3 text-salon-heading"
        />
      </label>

      <label className="mt-4 block text-sm text-salon-body">
        Notes (optional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-salon-border bg-salon-panel px-3 py-2 text-salon-heading"
        />
      </label>

      {smsEnabled && (
        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 text-sm text-salon-body">
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(e) => setSmsOptIn(e.target.checked)}
            className="h-5 w-5 accent-salon-primary"
          />
          Text me when my turn is near
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 min-h-12 w-full bg-salon-primary py-3 text-white transition hover:bg-salon-hover disabled:opacity-50"
      >
        {submitting ? "Adding you to the list..." : "Join walk-in list"}
      </button>
    </form>
  );
}
