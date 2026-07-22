"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Counts = {
  pending: number;
  todayConfirmed: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ pending: 0, todayConfirmed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [pendingRes, todayRes] = await Promise.all([
          fetch("/api/admin/appointments?status=pending"),
          fetch(`/api/admin/appointments?status=confirmed&date=${today}`),
        ]);

        const pendingData = (await pendingRes.json()) as { appointments?: unknown[] };
        const todayData = (await todayRes.json()) as { appointments?: unknown[] };

        setCounts({
          pending: pendingData.appointments?.length || 0,
          todayConfirmed: todayData.appointments?.length || 0,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Dashboard</h1>
      <p className="mt-2 text-sm text-salon-body">Overview of salon bookings.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="editorial-panel p-6">
          <p className="text-sm text-salon-body">Pending requests</p>
          <p className="mt-2 font-serif text-3xl text-salon-heading">
            {loading ? "-" : counts.pending}
          </p>
          <Link
            href="/admin/appointments?status=pending"
            className="mt-4 inline-block min-h-12 py-2 text-sm text-salon-primary hover:text-salon-hover"
          >
            View pending
          </Link>
        </div>
        <div className="editorial-panel p-6">
          <p className="text-sm text-salon-body">Confirmed today</p>
          <p className="mt-2 font-serif text-3xl text-salon-heading">
            {loading ? "-" : counts.todayConfirmed}
          </p>
          <Link
            href="/admin/appointments"
            className="mt-4 inline-block min-h-12 py-2 text-sm text-salon-primary hover:text-salon-hover"
          >
            View appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
