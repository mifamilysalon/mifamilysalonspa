"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/site";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("hair");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState("");
  const [bookingType, setBookingType] = useState<"instant" | "request">("request");

  async function loadServices() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = (await res.json()) as { services?: Service[] };
      setServices(data.services || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          duration_minutes: duration,
          price: price ? Number(price) : null,
          booking_type: bookingType,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Failed to add service");
        return;
      }

      setName("");
      setDuration(60);
      setPrice("");
      await loadServices();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: Service) {
    await fetch(`/api/admin/services/${service.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: service.is_active ? 0 : 1 }),
    });
    await loadServices();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Services</h1>
      <p className="mt-2 text-sm text-salon-body">Manage bookable services.</p>

      <form onSubmit={handleAdd} className="editorial-panel mt-8 space-y-4 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Add service</h2>
        {error && (
          <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-12 w-full border border-salon-border px-3"
            >
              <option value="hair">Hair</option>
              <option value="skin">Skin</option>
              <option value="nails">Nails</option>
              <option value="wellness">Wellness</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Duration (min)</span>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              required
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Price</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              placeholder="Optional"
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-salon-heading">Booking type</span>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value as "instant" | "request")}
              className="min-h-12 w-full border border-salon-border px-3"
            >
              <option value="instant">Instant book</option>
              <option value="request">Request (manual confirm)</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 bg-salon-primary px-6 py-3 text-white hover:bg-salon-hover disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add service"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-salon-heading">All services</h2>
        {loading ? (
          <p className="mt-4 text-salon-body">Loading...</p>
        ) : (
          <ul className="mt-4 divide-y divide-salon-border border border-salon-border">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-salon-heading">
                    {service.name}
                    {!service.is_active && (
                      <span className="ml-2 text-xs text-red-600">(inactive)</span>
                    )}
                  </p>
                  <p className="text-sm text-salon-body">
                    {service.category} - {service.duration_minutes} min -{" "}
                    {service.booking_type === "instant" ? "Instant" : "Request"}
                    {service.price != null ? ` - $${service.price}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(service)}
                  className="min-h-12 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary"
                >
                  {service.is_active ? "Deactivate" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
