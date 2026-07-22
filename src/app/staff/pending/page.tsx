"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { AppointmentHandoffPanel } from "@/components/appointments/AppointmentHandoffPanel";

type Appointment = {
  id: number;
  staff_id: number | null;
  service_name: string;
  staff_name: string | null;
  client_name: string;
  client_phone: string;
  start_datetime: string;
  status: string;
  notes: string | null;
};

export default function StaffPendingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [staffProfileId, setStaffProfileId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadPending() {
    setLoading(true);
    try {
      const [pendingRes, meRes] = await Promise.all([
        fetch("/api/staff/pending"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      if (pendingRes.ok) {
        const data = (await pendingRes.json()) as { appointments?: Appointment[] };
        setAppointments(data.appointments || []);
      }
      if (meRes?.ok) {
        const me = (await meRes.json()) as {
          user?: { staffProfileId?: number | null };
        };
        setStaffProfileId(me.user?.staffProfileId ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function updateStatus(id: number, status: "confirmed" | "cancelled") {
    setUpdating(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/staff/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) await loadPending();
      else setActionError(data.error || "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Pending requests</h1>
      <p className="mt-2 text-sm text-salon-body">
        Claim open requests, confirm your own, transfer if you are overloaded, or reject.
      </p>

      {actionError && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-salon-body">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="editorial-panel mt-8 p-8 text-center">
          <p className="text-salon-body">No pending requests.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {appointments.map((appt) => (
            <li key={appt.id} className="editorial-panel p-4">
              <p className="font-medium text-salon-heading">{appt.client_name}</p>
              <p className="text-sm text-salon-body">{appt.service_name}</p>
              <p className="text-sm text-salon-body">
                Preferred:{" "}
                {format(parseISO(appt.start_datetime), "EEE, MMM d yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-salon-body">{appt.client_phone}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-salon-body">
                {appt.staff_name ? `Assigned: ${appt.staff_name}` : "Open pool · unassigned"}
              </p>
              {appt.notes && (
                <p className="mt-2 text-sm italic text-salon-body">{appt.notes}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {appt.staff_id != null &&
                  (staffProfileId == null || appt.staff_id === staffProfileId) && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "confirmed")}
                      className="min-h-12 bg-salon-primary px-4 py-2 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                <button
                  type="button"
                  disabled={updating === appt.id}
                  onClick={() => updateStatus(appt.id, "cancelled")}
                  className="min-h-12 border border-salon-border px-4 py-2 text-sm text-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
              <AppointmentHandoffPanel
                appointmentId={appt.id}
                apiBase="/api/staff/appointments"
                mode="staff"
                staffId={appt.staff_id}
                status={appt.status}
                startDatetime={appt.start_datetime}
                myStaffId={staffProfileId}
                onDone={loadPending}
                onError={setActionError}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
