"use client";

import { format, parseISO } from "date-fns";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Appointment = {
  id: number;
  service_name: string;
  staff_id: number | null;
  staff_name: string | null;
  client_name: string;
  client_phone: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  booking_source: string;
};

type TeamRow = {
  id: number;
  display_name: string;
  today_count: number;
  upcoming_count: number;
  pending_count: number;
  completed_count: number;
  total_count: number;
};

const STATUS_TABS = [
  { id: "", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "no_show", label: "No show" },
] as const;

function AdminAppointmentsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [view, setView] = useState<"leader" | "employee" | "list">("leader");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [staffFilter, setStaffFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadSummary = useCallback(async () => {
    const res = await fetch("/api/admin/appointments?summary=1");
    const data = (await res.json()) as {
      team?: TeamRow[];
      statusCounts?: Record<string, number>;
    };
    setTeam(data.team || []);
    setStatusCounts(data.statusCounts || {});
  }, []);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (staffFilter) params.set("staffId", String(staffFilter));
      if (dateFilter) params.set("date", dateFilter);
      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const data = (await res.json()) as { appointments?: Appointment[] };
      setAppointments(data.appointments || []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, staffFilter, dateFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

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
        await Promise.all([loadAppointments(), loadSummary()]);
      }
    } finally {
      setUpdating(null);
    }
  }

  const employeeName = useMemo(
    () => team.find((t) => t.id === staffFilter)?.display_name || "Staff member",
    [team, staffFilter],
  );

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Appointments</h1>
      <p className="mt-2 text-sm text-salon-body">
        Leader overview, employee schedules, and status filters.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["leader", "Team overview"],
            ["employee", "Employee view"],
            ["list", "All list"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`min-h-11 border px-4 py-2 text-sm transition ${
              view === id
                ? "border-salon-primary bg-salon-light text-salon-heading"
                : "border-salon-border text-salon-body hover:border-salon-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.id ? statusCounts[tab.id] || 0 : Object.values(statusCounts).reduce((a, b) => a + b, 0);
          return (
            <button
              key={tab.id || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-10 border px-3 py-1.5 text-xs uppercase tracking-wide transition ${
                statusFilter === tab.id
                  ? "border-salon-primary bg-salon-primary text-white"
                  : "border-salon-border text-salon-body hover:border-salon-primary"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm text-salon-body">
          Date
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="mt-1 block min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        {(dateFilter || staffFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setDateFilter("");
              setStaffFilter(null);
              setStatusFilter("");
            }}
            className="min-h-11 border border-salon-border px-4 text-sm text-salon-body hover:border-salon-primary"
          >
            Clear filters
          </button>
        )}
      </div>

      {view === "leader" && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                setStaffFilter(member.id);
                setView("employee");
              }}
              className="border border-salon-border bg-salon-panel p-4 text-left transition hover:border-salon-primary"
            >
              <p className="font-serif text-lg text-salon-heading">{member.display_name}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-salon-body">
                <div>
                  <dt className="text-xs uppercase tracking-wide">Today</dt>
                  <dd className="text-xl text-salon-heading">{member.today_count}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">Upcoming</dt>
                  <dd className="text-xl text-salon-heading">{member.upcoming_count}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">Pending</dt>
                  <dd>{member.pending_count}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">Completed</dt>
                  <dd>{member.completed_count}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-salon-primary">Open employee schedule</p>
            </button>
          ))}
        </div>
      )}

      {view === "employee" && (
        <div className="mt-6">
          <label className="block text-sm text-salon-body">
            Staff member
            <select
              value={staffFilter ?? ""}
              onChange={(e) => setStaffFilter(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 block min-h-11 w-full max-w-md border border-salon-border bg-salon-panel px-3 text-salon-heading"
            >
              <option value="">Select staff...</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </label>
          {staffFilter ? (
            <p className="mt-3 text-sm text-salon-body">Schedule for {employeeName}</p>
          ) : (
            <p className="mt-3 text-sm text-salon-body">Choose a team member to see their appointments.</p>
          )}
        </div>
      )}

      {(view === "list" || view === "employee") && (
        <div className="mt-6">
          {loading ? (
            <p className="text-salon-body">Loading...</p>
          ) : view === "employee" && !staffFilter ? null : appointments.length === 0 ? (
            <p className="text-salon-body">No appointments found.</p>
          ) : (
            <ul className="divide-y divide-salon-border border border-salon-border">
              {appointments.map((appt) => (
                <li key={appt.id} className="bg-salon-panel p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-salon-heading">{appt.client_name}</p>
                      <p className="text-sm text-salon-body">
                        {appt.service_name}
                        {appt.staff_name ? ` with ${appt.staff_name}` : ""}
                      </p>
                      <p className="text-sm text-salon-body">
                        {format(parseISO(appt.start_datetime), "EEE, MMM d yyyy 'at' h:mm a")}
                        {" - "}
                        {format(parseISO(appt.end_datetime), "h:mm a")}
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
                          className="min-h-11 border border-salon-primary px-4 py-2 text-sm text-salon-primary hover:bg-salon-light disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status === "confirmed" && (
                        <button
                          type="button"
                          disabled={updating === appt.id}
                          onClick={() => updateStatus(appt.id, "in_progress")}
                          className="min-h-11 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {["confirmed", "in_progress"].includes(appt.status) && (
                        <button
                          type="button"
                          disabled={updating === appt.id}
                          onClick={() => updateStatus(appt.id, "completed")}
                          className="min-h-11 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {!["cancelled", "completed", "no_show"].includes(appt.status) && (
                        <>
                          <button
                            type="button"
                            disabled={updating === appt.id}
                            onClick={() => updateStatus(appt.id, "no_show")}
                            className="min-h-11 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
                          >
                            No show
                          </button>
                          <button
                            type="button"
                            disabled={updating === appt.id}
                            onClick={() => updateStatus(appt.id, "cancelled")}
                            className="min-h-11 border border-salon-border px-4 py-2 text-sm text-red-700 hover:border-red-400 disabled:opacity-50"
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
