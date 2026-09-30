"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Counts = {
  pending: number;
  todayConfirmed: number;
  giftPending: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({
    pending: 0,
    todayConfirmed: 0,
    giftPending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [pendingRes, todayRes, giftRes] = await Promise.all([
          fetch("/api/admin/appointments?status=pending"),
          fetch(`/api/admin/appointments?status=confirmed&date=${today}`),
          fetch("/api/gift-certificates?status=pending_approval"),
        ]);

        const pendingData = (await pendingRes.json()) as { appointments?: unknown[] };
        const todayData = (await todayRes.json()) as { appointments?: unknown[] };
        const giftData = (await giftRes.json()) as { certificates?: unknown[] };

        setCounts({
          pending: pendingData.appointments?.length || 0,
          todayConfirmed: todayData.appointments?.length || 0,
          giftPending: giftData.certificates?.length || 0,
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="editorial-panel p-6">
          <p className="text-sm text-salon-body">Gift certs awaiting approval</p>
          <p className="mt-2 font-serif text-3xl text-salon-heading">
            {loading ? "-" : counts.giftPending}
          </p>
          <Link
            href="/admin/gift-certificates"
            className="mt-4 inline-block min-h-12 py-2 text-sm text-salon-primary hover:text-salon-hover"
          >
            Review gift certificates
          </Link>
        </div>
        <div className="editorial-panel p-6">
          <p className="text-sm text-salon-body">Team</p>
          <p className="mt-2 font-serif text-3xl text-salon-heading">Staff</p>
          <Link
            href="/admin/staff"
            className="mt-4 inline-block min-h-12 py-2 text-sm text-salon-primary hover:text-salon-hover"
          >
            Add, remove, set PINs
          </Link>
        </div>
        <div className="editorial-panel p-6">
          <p className="text-sm text-salon-body">Visitors &amp; free plan</p>
          <p className="mt-2 font-serif text-3xl text-salon-heading">System</p>
          <Link
            href="/admin/system"
            className="mt-4 inline-block min-h-12 py-2 text-sm text-salon-primary hover:text-salon-hover"
          >
            Analytics links, cache, syncs
          </Link>
        </div>
      </div>
    </div>
  );
}
