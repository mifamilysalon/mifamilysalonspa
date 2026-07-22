"use client";

import { format, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type Appointment = {
  id: number;
  service_name: string;
  staff_name: string | null;
  client_name: string;
  client_phone: string;
  start_datetime: string;
  status: string;
  booking_source: string;
};

function AdminAppointmentsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/appointments?status=${statusFilter}`
        : "/api/admin/appointments";
      const res = await fetch(url);
      const data = (await res.json()) as { appointments?: Appointment[] };
      setAppointments(data.appointments || []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadAppointments();
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Appointments</h1>
      <p className="mt-2 text-sm text-salon-body">
        {statusFilter ? `Showing ${statusFilter} appointments` : "All appointments"}
      </p>

      {loading ? (
        <p className="mt-8 text-salon-body">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="mt-8 text-salon-body">No appointments found.</p>
      ) : (
        <ul className="mt-6 divide-y divide-salon-border border border-salon-border">
          {appointments.map((appt) => (
            <li key={appt.id} className="editorial-panel border-0 border-b p-4 last:border-b-0">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium text-salon-heading">{appt.client_name}</p>
                  <p className="text-sm text-salon-body">
                    {appt.service_name}
                    {appt.staff_name ? ` with ${appt.staff_name}` : ""}
                  </p>
                  <p className="text-sm text-salon-body">
                    {format(parseISO(appt.start_datetime), "EEE, MMM d yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm text-salon-body">{appt.client_phone}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-salon-body">
                    {appt.status} - {appt.booking_source}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {appt.status === "pending" && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "confirmed")}
                      className="min-h-12 border border-salon-primary px-4 py-2 text-sm text-salon-primary hover:bg-salon-light disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {!["cancelled", "completed"].includes(appt.status) && (
                    <>
                      {appt.status === "confirmed" && (
                        <button
                          type="button"
                          disabled={updating === appt.id}
                          onClick={() => updateStatus(appt.id, "completed")}
                          className="min-h-12 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={updating === appt.id}
                        onClick={() => updateStatus(appt.id, "cancelled")}
                        className="min-h-12 border border-salon-border px-4 py-2 text-sm text-red-700 hover:border-red-400 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <Suspense fallback={<p className="text-salon-body">Loading...</p>}>
      <AdminAppointmentsContent />
    </Suspense>
  );
}
