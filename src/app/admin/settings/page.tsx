"use client";

import { useEffect, useState } from "react";
import {
  PALETTE_IDS,
  PALETTES,
  paletteDisplayName,
  type PaletteId,
} from "@/lib/palettes";
import type { BusinessInfo } from "@/lib/site";

type PaletteOption = {
  id: PaletteId;
  name: string;
  isCurrentSiteInspired?: boolean;
  suffix?: string;
};

type SettingsData = {
  palette: PaletteId;
  palettes: PaletteOption[];
  business: BusinessInfo;
  sms: { enabled: boolean; monthly_cap: number; sent_this_month: number };
  auth: { pin_length: 4 | 6 };
  google_reviews: {
    place_id: string;
    maps_url: string;
    rating: number;
    review_count: number;
    last_synced_at: string | null;
  };
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [placeIdDraft, setPlaceIdDraft] = useState("");
  const [mapsUrlDraft, setMapsUrlDraft] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = (await res.json()) as SettingsData;
        setSettings(data);
        setPlaceIdDraft(data.google_reviews?.place_id || "");
        setMapsUrlDraft(data.google_reviews?.maps_url || "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save(updates: Record<string, unknown>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setMessage("Settings saved. Refresh the public site to see theme changes.");
        const refreshed = await fetch("/api/admin/settings");
        const data = (await refreshed.json()) as SettingsData;
        setSettings(data);
        setPlaceIdDraft(data.google_reviews?.place_id || "");
        setMapsUrlDraft(data.google_reviews?.maps_url || "");
      } else {
        setMessage("Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function syncReviewsNow() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reviews/sync", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      setMessage(data.message || (data.ok ? "Reviews synced." : "Sync failed."));
      const refreshed = await fetch("/api/admin/settings");
      setSettings((await refreshed.json()) as SettingsData);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <p className="text-salon-body">Loading settings...</p>;
  }

  const paletteOptions =
    settings.palettes?.length >= 8
      ? settings.palettes
      : PALETTE_IDS.map((id) => ({
          id,
          name: paletteDisplayName(id),
          isCurrentSiteInspired: PALETTES[id].isCurrentSiteInspired,
          suffix: PALETTES[id].suffix,
        }));

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Settings</h1>
      <p className="mt-2 text-sm text-salon-body">
        Site palette, staff PIN length, Google reviews, business info, and SMS.
      </p>

      {message && (
        <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <section className="editorial-panel mt-8 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Color palette</h2>
        <p className="mt-2 text-sm text-salon-body">
          Sets the site-wide default. Use Midnight Magenta for the current pink/magenta
          website look. Farmington Rose Gold uses soft alabaster with rose-metal accents.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {paletteOptions.map((p) => {
            const colors = PALETTES[p.id]?.colors;
            const label = paletteDisplayName(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={saving}
                onClick={() => save({ palette: p.id })}
                className={`min-h-14 border px-4 py-3 text-left text-sm transition ${
                  settings.palette === p.id
                    ? "border-salon-primary bg-salon-light"
                    : "border-salon-border hover:border-salon-primary"
                }`}
              >
                <span className="flex items-center gap-3">
                  {colors && (
                    <span className="flex shrink-0 gap-0.5">
                      <span
                        className="h-6 w-6 border border-salon-border"
                        style={{ background: colors.bg_main }}
                      />
                      <span
                        className="h-6 w-6 border border-salon-border"
                        style={{ background: colors.accent_primary }}
                      />
                      <span
                        className="h-6 w-6 border border-salon-border"
                        style={{ background: colors.text_heading }}
                      />
                    </span>
                  )}
                  <span className="leading-snug text-salon-heading">{label}</span>
                </span>
                {(p.isCurrentSiteInspired || PALETTES[p.id]?.isCurrentSiteInspired) && (
                  <span className="mt-2 inline-block text-xs font-medium uppercase tracking-wide text-salon-primary">
                    Current website inspired - pink &amp; magenta
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Staff PIN length</h2>
        <p className="mt-2 text-sm text-salon-body">
          Staff login shows exactly this many digit boxes. Choose 4 or 6.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {([4, 6] as const).map((len) => (
            <button
              key={len}
              type="button"
              disabled={saving}
              onClick={() => save({ auth: { pin_length: len } })}
              className={`min-h-12 border px-5 py-2 text-sm ${
                settings.auth.pin_length === len
                  ? "border-salon-primary bg-salon-light"
                  : "border-salon-border hover:border-salon-primary"
              }`}
            >
              {len} digits
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-salon-body">
          Demo staff PINs are currently 4 digits (1234). If you switch to 6, update staff PIN
          hashes before they can sign in.
        </p>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Google reviews</h2>
        <p className="mt-2 text-sm text-salon-body">
          Reviews display on the homepage and refresh every night at midnight Eastern (cron).
          Sync uses Google Places free monthly quota (1 call/day). Without an API key, the
          cached/seeded reviews stay free forever.
        </p>
        <dl className="mt-4 grid gap-2 text-sm text-salon-body sm:grid-cols-2">
          <div>
            <dt className="font-medium text-salon-heading">Rating</dt>
            <dd>{settings.google_reviews.rating.toFixed(1)}</dd>
          </div>
          <div>
            <dt className="font-medium text-salon-heading">Review count</dt>
            <dd>{settings.google_reviews.review_count.toLocaleString()}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-salon-heading">Last synced</dt>
            <dd>{settings.google_reviews.last_synced_at || "Not synced yet (using cached reviews)"}</dd>
          </div>
        </dl>
        <label className="mt-4 block text-sm text-salon-body">
          Google Place ID (optional for live sync)
          <input
            value={placeIdDraft}
            onChange={(e) => setPlaceIdDraft(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            placeholder="ChIJ..."
          />
        </label>
        <label className="mt-3 block text-sm text-salon-body">
          Google Maps reviews URL
          <input
            value={mapsUrlDraft}
            onChange={(e) => setMapsUrlDraft(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              save({
                google_reviews: {
                  ...settings.google_reviews,
                  place_id: placeIdDraft.trim(),
                  maps_url: mapsUrlDraft.trim(),
                },
              })
            }
            className="min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
          >
            Save review settings
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={syncReviewsNow}
            className="min-h-11 border border-salon-border px-4 text-sm hover:border-salon-primary disabled:opacity-50"
          >
            Sync now
          </button>
        </div>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">SMS notifications</h2>
        <p className="mt-2 text-sm text-salon-body">
          SMS is off by default. Enable only when Twilio is configured.
        </p>
        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={settings.sms.enabled}
            onChange={(e) => save({ sms: { ...settings.sms, enabled: e.target.checked } })}
            disabled={saving}
            className="h-5 w-5 accent-salon-primary"
          />
          <span className="text-sm text-salon-body">Enable SMS for clients who opt in</span>
        </label>
        <p className="mt-2 text-xs text-salon-body">
          Sent this month: {settings.sms.sent_this_month} / {settings.sms.monthly_cap}
        </p>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Business information</h2>
        <dl className="mt-4 space-y-3 text-sm text-salon-body">
          <div>
            <dt className="font-medium text-salon-heading">Name</dt>
            <dd>{settings.business.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-salon-heading">Primary phone</dt>
            <dd>{settings.business.phone_primary}</dd>
          </div>
          <div>
            <dt className="font-medium text-salon-heading">Secondary phone</dt>
            <dd>{settings.business.phone_secondary}</dd>
          </div>
          <div>
            <dt className="font-medium text-salon-heading">Address</dt>
            <dd>{settings.business.address}</dd>
          </div>
          <div>
            <dt className="font-medium text-salon-heading">Hours</dt>
            <dd>{settings.business.hours}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
