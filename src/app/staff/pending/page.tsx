"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  service_name: string;
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

  async function loadPending() {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/pending");
      if (res.ok) {
        const data = (await res.json()) as { appointments?: Appointment[] };
        setAppointments(data.appointments || []);
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
    try {
      const res = await fetch(`/api/staff/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadPending();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Pending requests</h1>
      <p className="mt-2 text-sm text-salon-body">
        Review and confirm or reject booking requests.
      </p>

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
              {appt.notes && (
                <p className="mt-2 text-sm italic text-salon-body">{appt.notes}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating === appt.id}
                  onClick={() => updateStatus(appt.id, "confirmed")}
                  className="min-h-12 bg-salon-primary px-4 py-2 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={updating === appt.id}
                  onClick={() => updateStatus(appt.id, "cancelled")}
                  className="min-h-12 border border-salon-border px-4 py-2 text-sm text-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
