"use client";

import { useEffect, useState } from "react";
import type { Service, StaffProfile } from "@/lib/site";

type Props = {
  defaultStaffId?: number | null;
  onSaved?: () => void;
  onCancel?: () => void;
  compact?: boolean;
};

export function RecordWalkInForm({
  defaultStaffId = null,
  onSaved,
  onCancel,
  compact = false,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState<number | "">("");
  const [staffId, setStaffId] = useState<number | "">(defaultStaffId || "");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [arriveInMinutes, setArriveInMinutes] = useState(0);
  const [status, setStatus] = useState<"confirmed" | "in_progress">("confirmed");
  const [notes, setNotes] = useState("");
  const [customStart, setCustomStart] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [svcRes, staffRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/staff"),
        ]);
        const svcData = (await svcRes.json()) as { services?: Service[] };
        const staffData = (await staffRes.json()) as { staff?: StaffProfile[] };
        setServices(svcData.services || []);
        setStaff(staffData.staff || []);
      } catch {
        setError("Could not load services or staff.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (defaultStaffId) setStaffId(defaultStaffId);
  }, [defaultStaffId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !clientName.trim() || !clientPhone.trim()) {
      setError("Service, client name, and phone are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        serviceId,
        staffId: staffId || null,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        notes: notes.trim() || undefined,
        status,
      };

      if (customStart) {
        payload.startDatetime = customStart.length === 16 ? `${customStart}:00` : customStart;
      } else {
        payload.arriveInMinutes = arriveInMinutes;
      }

      const res = await fetch("/api/walk-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; id?: number };
      if (!res.ok) {
        setError(data.error || "Failed to record walk-in.");
        return;
      }

      setMessage("Walk-in recorded.");
      setClientName("");
      setClientPhone("");
      setNotes("");
      setCustomStart("");
      setArriveInMinutes(0);
      setStatus("confirmed");
      onSaved?.();
    } catch {
      setError("Failed to record walk-in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-salon-body">Loading form...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-3" : "editorial-panel space-y-4 p-4 md:p-6"}
    >
      {!compact && (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl text-salon-heading">Record walk-in</h2>
            <p className="mt-1 text-sm text-salon-body">
              Add a guest who arrived without an online booking.
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-10 text-sm text-salon-body underline underline-offset-4"
            >
              Close
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
      {message && (
        <p className="border border-salon-border bg-salon-light px-3 py-2 text-sm">{message}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-salon-body">
          Service
          <select
            required
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          >
            <option value="">Select...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-salon-body">
          Staff
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          >
            <option value="">Unassigned / first free</option>
            {staff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-salon-body">
          Client name
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        <label className="block text-sm text-salon-body">
          Phone
          <input
            required
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm text-salon-body">
          Arrive / start
          <select
            value={arriveInMinutes}
            onChange={(e) => {
              setArriveInMinutes(Number(e.target.value));
              setCustomStart("");
            }}
            disabled={!!customStart}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading disabled:opacity-50"
          >
            <option value={0}>Now</option>
            <option value={15}>In 15 min</option>
            <option value={30}>In 30 min</option>
            <option value={45}>In 45 min</option>
            <option value={60}>In 1 hour</option>
          </select>
        </label>
        <label className="block text-sm text-salon-body">
          Or exact time
          <input
            type="datetime-local"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        <label className="block text-sm text-salon-body">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "confirmed" | "in_progress")}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          >
            <option value="confirmed">Waiting / confirmed</option>
            <option value="in_progress">Started now</option>
          </select>
        </label>
      </div>

      <label className="block text-sm text-salon-body">
        Notes
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          placeholder="Color preference, wait preference, etc."
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 bg-salon-primary px-5 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save walk-in"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 border border-salon-border px-5 text-sm hover:border-salon-primary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
