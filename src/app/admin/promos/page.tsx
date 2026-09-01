"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatPromoDate,
  type Promo,
  type PromoPlacement,
} from "@/lib/promos-shared";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type FormState = {
  title: string;
  body: string;
  cta_label: string;
  cta_href: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_featured: boolean;
  placement: PromoPlacement;
  sort_order: number;
};

const emptyForm = (): FormState => ({
  title: "",
  body: "",
  cta_label: "Book now",
  cta_href: "/appointments",
  starts_at: todayIso(),
  ends_at: plusDaysIso(14),
  is_active: true,
  is_featured: false,
  placement: "both",
  sort_order: 0,
});

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      const data = (await res.json()) as { promos?: Promo[]; error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to load");
        return;
      }
      setPromos(data.promos || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(promo: Promo) {
    setEditingId(promo.id);
    setForm({
      title: promo.title,
      body: promo.body || "",
      cta_label: promo.cta_label || "",
      cta_href: promo.cta_href || "",
      starts_at: promo.starts_at,
      ends_at: promo.ends_at,
      is_active: !!promo.is_active,
      is_featured: !!promo.is_featured,
      placement: promo.placement,
      sort_order: promo.sort_order,
    });
    setError(null);
    setMessage(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      title: form.title,
      body: form.body,
      cta_label: form.cta_label || null,
      cta_href: form.cta_href || null,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      is_active: form.is_active,
      is_featured: form.is_featured,
      placement: form.placement,
      sort_order: form.sort_order,
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/promos/${editingId}` : "/api/admin/promos",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setMessage(editingId ? "Promo updated." : "Promo created.");
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(promo: Promo) {
    await fetch(`/api/admin/promos/${promo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: promo.title,
        body: promo.body,
        cta_label: promo.cta_label,
        cta_href: promo.cta_href,
        starts_at: promo.starts_at,
        ends_at: promo.ends_at,
        is_active: !promo.is_active,
        is_featured: !!promo.is_featured,
        placement: promo.placement,
        sort_order: promo.sort_order,
      }),
    });
    await load();
  }

  async function removePromo(id: number) {
    if (!window.confirm("Delete this promo?")) return;
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Promos</h1>
      <p className="mt-2 text-sm text-salon-body">
        Publish time-bound offers on the homepage and Offers page. Guests only
        see active promos within the start/end dates.
      </p>

      <form onSubmit={handleSubmit} className="editorial-panel mt-8 space-y-4 p-6">
        <h2 className="font-serif text-lg text-salon-heading">
          {editingId ? "Edit promo" : "New promo"}
        </h2>
        {error && (
          <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-salon-border bg-salon-light px-4 py-3 text-sm">
            {message}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">Title</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="min-h-12 w-full border border-salon-border px-3"
            placeholder="e.g. Spring color special"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">
            Short description
          </span>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={3}
            className="w-full border border-salon-border px-3 py-2"
            placeholder="One or two sentences guests will see."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">
              Button label (optional)
            </span>
            <input
              value={form.cta_label}
              onChange={(e) =>
                setForm((f) => ({ ...f, cta_label: e.target.value }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">
              Button link (optional)
            </span>
            <input
              value={form.cta_href}
              onChange={(e) =>
                setForm((f) => ({ ...f, cta_href: e.target.value }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
              placeholder="/appointments or tel:2484746520"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Starts</span>
            <input
              type="date"
              required
              value={form.starts_at}
              onChange={(e) =>
                setForm((f) => ({ ...f, starts_at: e.target.value }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Ends</span>
            <input
              type="date"
              required
              value={form.ends_at}
              min={form.starts_at}
              onChange={(e) =>
                setForm((f) => ({ ...f, ends_at: e.target.value }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Show on</span>
            <select
              value={form.placement}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  placement: e.target.value as PromoPlacement,
                }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
            >
              <option value="both">Homepage banner + Offers page</option>
              <option value="banner">Homepage banner only</option>
              <option value="list">Offers page only</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">
              Sort order
            </span>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sort_order: Number(e.target.value) || 0,
                }))
              }
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-salon-body">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            Active (visible when dates allow)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_featured: e.target.checked }))
              }
            />
            Featured homepage banner
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 bg-salon-primary px-6 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Update promo" : "Create promo"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-12 border border-salon-border px-5 text-sm text-salon-heading"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="mt-10">
        <h2 className="font-serif text-lg text-salon-heading">All promos</h2>
        {loading ? (
          <p className="mt-4 text-sm text-salon-body">Loading…</p>
        ) : promos.length === 0 ? (
          <p className="mt-4 text-sm text-salon-body">No promos yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {promos.map((p) => (
              <li key={p.id} className="editorial-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-salon-heading">
                      {p.title}
                    </p>
                    {p.body && (
                      <p className="mt-1 text-sm text-salon-body">{p.body}</p>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-wide text-salon-body/80">
                      {formatPromoDate(p.starts_at)} – {formatPromoDate(p.ends_at)}{" "}
                      · {p.placement}
                      {p.is_featured ? " · featured" : ""}
                      {" · "}
                      {p.is_active ? "active" : "hidden"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary"
                    >
                      {p.is_active ? "Hide" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePromo(p.id)}
                      className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
