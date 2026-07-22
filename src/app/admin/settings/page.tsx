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
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = (await res.json()) as SettingsData;
        setSettings(data);
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
        setMessage("Settings saved. Refresh the public site to see the new default theme.");
        const refreshed = await fetch("/api/admin/settings");
        setSettings((await refreshed.json()) as SettingsData);
      } else {
        setMessage("Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <p className="text-salon-body">Loading settings...</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Settings</h1>
      <p className="mt-2 text-sm text-salon-body">Site palette, business info, and SMS.</p>

      {message && (
        <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <section className="editorial-panel mt-8 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Color palette</h2>
        <p className="mt-2 text-sm text-salon-body">
          Sets the site-wide default. Visitors can also preview themes with the public Themes
          button (temporary preview only).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(settings.palettes.length
            ? settings.palettes
            : PALETTE_IDS.map((id) => ({
                id,
                name: paletteDisplayName(id),
                isCurrentSiteInspired: PALETTES[id].isCurrentSiteInspired,
                suffix: PALETTES[id].suffix,
              }))
          ).map((p) => {
            const colors = PALETTES[p.id]?.colors;
            const label =
              p.isCurrentSiteInspired || PALETTES[p.id]?.isCurrentSiteInspired
                ? paletteDisplayName(p.id)
                : p.suffix || PALETTES[p.id]?.suffix
                  ? `${p.name}${p.name.includes("(") ? "" : ` (${p.suffix || PALETTES[p.id]?.suffix})`}`
                  : p.name;
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
                    Current website inspired
                  </span>
                )}
              </button>
            );
          })}
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
