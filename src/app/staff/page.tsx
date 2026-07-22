"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RecordWalkInForm } from "@/components/forms/RecordWalkInForm";

type Appointment = {
  id: number;
  service_name: string;
  staff_name: string | null;
  client_name: string;
  client_phone: string;
  start_datetime: string;
  status: string;
  booking_source?: string;
};

export default function StaffSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [staffProfileId, setStaffProfileId] = useState<number | null>(null);
  const today = format(new Date(), "EEE, MMM d yyyy");

  async function loadSchedule() {
    setLoading(true);
    try {
      const [scheduleRes, pendingRes, meRes] = await Promise.all([
        fetch("/api/staff/schedule"),
        fetch("/api/staff/pending").catch(() => null),
        fetch("/api/auth/me").catch(() => null),
      ]);

      const scheduleData = (await scheduleRes.json()) as { appointments?: Appointment[] };
      setAppointments(scheduleData.appointments || []);

      if (pendingRes?.ok) {
        const pendingData = (await pendingRes.json()) as { appointments?: unknown[] };
        setPendingCount(pendingData.appointments?.length || 0);
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
    loadSchedule();
  }, []);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/staff/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadSchedule();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-salon-heading">Today&apos;s schedule</h1>
          <p className="text-sm text-salon-body">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowWalkIn((v) => !v)}
            className="min-h-12 bg-salon-primary px-4 py-2 text-sm text-white hover:bg-salon-hover"
          >
            {showWalkIn ? "Hide walk-in form" : "Record walk-in"}
          </button>
          {pendingCount > 0 && (
            <Link
              href="/staff/pending"
              className="min-h-12 border border-salon-primary px-4 py-2 text-sm text-salon-primary hover:bg-salon-light"
            >
              {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {showWalkIn && (
        <div className="mb-6">
          <RecordWalkInForm
            defaultStaffId={staffProfileId}
            onSaved={() => {
              setShowWalkIn(false);
              loadSchedule();
            }}
            onCancel={() => setShowWalkIn(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-salon-body">Loading schedule...</p>
      ) : appointments.length === 0 ? (
        <div className="editorial-panel p-8 text-center">
          <p className="text-salon-body">No appointments or walk-ins for today.</p>
          <button
            type="button"
            onClick={() => setShowWalkIn(true)}
            className="mt-4 text-sm text-salon-primary underline underline-offset-4"
          >
            Record a walk-in
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt) => (
            <li key={appt.id} className="editorial-panel p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium text-salon-heading">
                    {format(parseISO(appt.start_datetime), "h:mm a")} - {appt.client_name}
                  </p>
                  <p className="text-sm text-salon-body">
                    {appt.service_name}
                    {appt.staff_name ? ` with ${appt.staff_name}` : ""}
                  </p>
                  <p className="text-sm text-salon-body">{appt.client_phone}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-salon-body">
                    {appt.status}
                    {appt.booking_source ? ` · ${appt.booking_source.replace("_", " ")}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {appt.status === "pending" && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "confirmed")}
                      className="min-h-12 border border-salon-primary px-3 py-2 text-sm text-salon-primary disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "in_progress")}
                      className="min-h-12 border border-salon-border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {appt.status === "in_progress" && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "completed")}
                      className="min-h-12 border border-salon-border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {!["cancelled", "completed", "no_show"].includes(appt.status) && (
                    <button
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, "no_show")}
                      className="min-h-12 border border-salon-border px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                    >
                      No show
                    </button>
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
