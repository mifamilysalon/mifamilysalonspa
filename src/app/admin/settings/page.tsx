"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_MEDIA,
  DEFAULT_SOCIAL,
  HERO_TONES,
  SOCIAL_LABELS,
  type HeroToneId,
  type MediaSettings,
  type SocialLinks,
} from "@/lib/media";
import { PREVIEW_SITE_URL, SITE_URL } from "@/lib/seo";
import {
  DEFAULT_INSTAGRAM_FEED,
  type InstagramFeedSettings,
} from "@/lib/instagram";
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
  media: MediaSettings;
  social: SocialLinks;
  instagram_feed: InstagramFeedSettings;
  price_list: { slug: string; path: string };
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [placeIdDraft, setPlaceIdDraft] = useState("");
  const [mapsUrlDraft, setMapsUrlDraft] = useState("");
  const [heroImageDraft, setHeroImageDraft] = useState("");
  const [socialDraft, setSocialDraft] = useState<SocialLinks>(DEFAULT_SOCIAL);
  const [instagramDraft, setInstagramDraft] =
    useState<InstagramFeedSettings>(DEFAULT_INSTAGRAM_FEED);
  const [hoursDraft, setHoursDraft] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = (await res.json()) as SettingsData;
        setSettings(data);
        setPlaceIdDraft(data.google_reviews?.place_id || "");
        setMapsUrlDraft(data.google_reviews?.maps_url || "");
        setHeroImageDraft(data.media?.hero_image || DEFAULT_MEDIA.hero_image);
        setSocialDraft(data.social || DEFAULT_SOCIAL);
        setInstagramDraft(data.instagram_feed || DEFAULT_INSTAGRAM_FEED);
        setHoursDraft(
          (data.business?.hours || "")
            .split(/\r?\n|,/)
            .map((line) => line.trim())
            .filter(Boolean)
            .join("\n"),
        );
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
        setMessage("Settings saved.");
        const refreshed = await fetch("/api/admin/settings");
        const data = (await refreshed.json()) as SettingsData;
        setSettings(data);
        setPlaceIdDraft(data.google_reviews?.place_id || "");
        setMapsUrlDraft(data.google_reviews?.maps_url || "");
        setHeroImageDraft(data.media?.hero_image || DEFAULT_MEDIA.hero_image);
        setSocialDraft(data.social || DEFAULT_SOCIAL);
        setInstagramDraft(data.instagram_feed || DEFAULT_INSTAGRAM_FEED);
        setHoursDraft(
          (data.business?.hours || "")
            .split(/\r?\n|,/)
            .map((line) => line.trim())
            .filter(Boolean)
            .join("\n"),
        );
      } else {
        setMessage("Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setPasswordError(data.error || "Could not change password.");
        return;
      }
      setPasswordMessage(data.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Could not change password. Please try again.");
    } finally {
      setPasswordSaving(false);
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

  async function syncInstagramNow() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/instagram/sync", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      setMessage(data.message || (data.ok ? "Instagram synced." : "Sync failed."));
      const refreshed = await fetch("/api/admin/settings");
      const next = (await refreshed.json()) as SettingsData;
      setSettings(next);
      setInstagramDraft(next.instagram_feed || DEFAULT_INSTAGRAM_FEED);
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
        Brand look, hero photography, social links, reviews, and operations.
      </p>

      {message && (
        <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <section className="editorial-panel mt-8 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Admin password</h2>
        <p className="mt-2 text-sm text-salon-body">
          Change the password for the account you are signed in with. Need a
          reset email instead? Use Forgot password on the login page.
        </p>
        <form onSubmit={changePassword} className="mt-4 max-w-md space-y-4">
          {passwordMessage && (
            <p className="border border-salon-border bg-salon-light px-4 py-3 text-sm">
              {passwordMessage}
            </p>
          )}
          {passwordError && (
            <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {passwordError}
            </p>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-salon-heading">
              Current password
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-salon-heading">
              New password
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-salon-heading">
              Confirm new password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
            />
          </label>
          <button
            type="submit"
            disabled={passwordSaving}
            className="min-h-12 bg-salon-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-salon-hover disabled:opacity-60"
          >
            {passwordSaving ? "Saving..." : "Update password"}
          </button>
        </form>
      </section>

      <section className="editorial-panel mt-8 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Color palette</h2>
        <p className="mt-2 text-sm text-salon-body">
          Site-wide brand colors. Light palettes pair best with the white
          illustration panels; dark themes keep soft contrast so cream headings
          never sit on the art.
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
                    Current website inspired
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Homepage hero</h2>
        <p className="mt-2 text-sm text-salon-body">
          The public site uses custom salon illustrations by default (not stock
          photos). Optional photo URL and tone settings below are kept for a
          future photo override.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HERO_TONES.map((tone) => (
            <button
              key={tone.id}
              type="button"
              disabled={saving}
              onClick={() =>
                save({
                  media: {
                    ...settings.media,
                    hero_tone: tone.id as HeroToneId,
                  },
                })
              }
              className={`min-h-14 border px-4 py-3 text-left text-sm transition ${
                settings.media.hero_tone === tone.id
                  ? "border-salon-primary bg-salon-light"
                  : "border-salon-border hover:border-salon-primary"
              }`}
            >
              <span className="block font-medium text-salon-heading">{tone.name}</span>
              <span className="mt-1 block text-xs text-salon-body">{tone.description}</span>
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm text-salon-body">
          Optional photo URL (unused while illustrations are on)
          <input
            value={heroImageDraft}
            onChange={(e) => setHeroImageDraft(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
          />
        </label>
        <label className="mt-3 block text-sm text-salon-body">
          Or upload a photo to R2
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={saving}
            className="mt-1 block w-full text-sm"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file || !settings) return;
              setSaving(true);
              setMessage(null);
              try {
                const body = new FormData();
                body.append("file", file);
                body.append("alt", "Homepage hero");
                const uploadRes = await fetch("/api/admin/media", {
                  method: "POST",
                  body,
                });
                const uploadData = (await uploadRes.json()) as {
                  error?: string;
                  asset?: { url: string };
                };
                if (!uploadRes.ok || !uploadData.asset?.url) {
                  throw new Error(uploadData.error || "Upload failed");
                }
                const url = uploadData.asset.url;
                const saveRes = await fetch("/api/admin/settings", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    media: {
                      ...settings.media,
                      hero_image: url,
                    },
                  }),
                });
                if (!saveRes.ok) {
                  throw new Error("Uploaded, but failed to save hero setting");
                }
                setHeroImageDraft(url);
                const refreshed = await fetch("/api/admin/settings");
                setSettings((await refreshed.json()) as SettingsData);
                setMessage("Hero image uploaded to R2 and saved.");
              } catch (err) {
                setMessage(
                  err instanceof Error ? err.message : "Upload failed",
                );
              } finally {
                setSaving(false);
              }
            }}
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            save({
              media: {
                ...settings.media,
                hero_image: heroImageDraft.trim() || DEFAULT_MEDIA.hero_image,
              },
            })
          }
          className="mt-3 min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
        >
          Save hero image
        </button>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">In-salon price brochure</h2>
        <p className="mt-2 text-sm text-salon-body">
          Prices stay off the public site. Use this hard-to-guess URL only on the desk QR code.
          Guessing <span className="font-mono">/menu</span> no longer works. Do not post this
          link on social or the main website.
        </p>
        {settings.price_list?.path ? (
          <>
            <p className="mt-3 break-all rounded border border-salon-border bg-salon-light px-3 py-3 font-mono text-sm text-salon-heading">
              {SITE_URL}{settings.price_list.path}
            </p>
            <p className="mt-2 break-all text-xs text-salon-body">
              Preview: {PREVIEW_SITE_URL}
              {settings.price_list.path}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-salon-body">Loading brochure URL…</p>
        )}
        <p className="mt-2 text-xs text-salon-body">
          Edit dollar amounts under Admin → Services. If a competitor finds the link, rotate the
          URL and reprint the QR.
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            if (
              !window.confirm(
                "Generate a new brochure URL? Old QR codes will stop working until you reprint them.",
              )
            ) {
              return;
            }
            await save({ price_list: { rotate: true } });
          }}
          className="mt-4 min-h-11 border border-salon-border px-4 text-sm hover:border-salon-primary disabled:opacity-50"
        >
          Rotate brochure URL
        </button>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Social media</h2>
        <p className="mt-2 text-sm text-salon-body">
          Links shown in the site footer. Leave blank to hide a network.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOCIAL_LABELS.map(({ key, label }) => (
            <label key={key} className="block text-sm text-salon-body">
              {label}
              <input
                value={socialDraft[key] || ""}
                onChange={(e) =>
                  setSocialDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
                placeholder={`https://...`}
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => save({ social: socialDraft })}
          className="mt-4 min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
        >
          Save social links
        </button>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Instagram feed</h2>
        <p className="mt-2 text-sm text-salon-body">
          Hidden on the public site until you turn it on below and add a free Behold
          JSON feed (preferred) or Trustindex widget ID.
        </p>
        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={instagramDraft.enabled === true}
            onChange={(e) =>
              setInstagramDraft((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            className="h-5 w-5 accent-salon-primary"
          />
          <span className="text-sm text-salon-heading">
            Show Instagram section on the website
          </span>
        </label>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-salon-body">
          <li>
            Create a free{" "}
            <a
              href="https://behold.so/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Behold
            </a>{" "}
            account and connect{" "}
            <a
              href="https://www.instagram.com/familysalonandspa/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              @familysalonandspa
            </a>
            .
          </li>
          <li>Add a JSON feed, copy the URL (feeds.behold.so/…), paste below, save, then Sync.</li>
          <li>Turn on &quot;Show Instagram section&quot; when you are ready for guests to see it.</li>
          <li>Optional: leave Trustindex widget ID blank unless you prefer that provider.</li>
        </ol>
        <label className="mt-4 block text-sm text-salon-body">
          Instagram handle
          <input
            value={instagramDraft.handle}
            onChange={(e) =>
              setInstagramDraft((prev) => ({ ...prev, handle: e.target.value }))
            }
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            placeholder="familysalonandspa"
          />
        </label>
        <label className="mt-3 block text-sm text-salon-body">
          Behold JSON feed URL
          <input
            value={instagramDraft.behold_feed_url}
            onChange={(e) =>
              setInstagramDraft((prev) => ({
                ...prev,
                behold_feed_url: e.target.value,
              }))
            }
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            placeholder="https://feeds.behold.so/yourFeedId"
          />
        </label>
        <label className="mt-3 block text-sm text-salon-body">
          Trustindex widget ID (optional)
          <input
            value={instagramDraft.trustindex_widget_id}
            onChange={(e) =>
              setInstagramDraft((prev) => ({
                ...prev,
                trustindex_widget_id: e.target.value,
              }))
            }
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            placeholder="876a61503e4c847"
          />
        </label>
        <p className="mt-3 text-xs text-salon-body">
          Last synced: {instagramDraft.last_synced_at || "Not synced yet"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              save({
                instagram_feed: {
                  enabled: instagramDraft.enabled === true,
                  handle: instagramDraft.handle.trim(),
                  behold_feed_url: instagramDraft.behold_feed_url.trim(),
                  trustindex_widget_id: instagramDraft.trustindex_widget_id.trim(),
                },
                social: {
                  ...socialDraft,
                  instagram:
                    socialDraft.instagram?.trim() ||
                    `https://www.instagram.com/${instagramDraft.handle.replace(/^@/, "").trim() || "familysalonandspa"}/`,
                },
              })
            }
            className="min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
          >
            Save Instagram feed
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={syncInstagramNow}
            className="min-h-11 border border-salon-border px-4 text-sm hover:border-salon-primary disabled:opacity-50"
          >
            Sync now
          </button>
        </div>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Staff PIN length</h2>
        <p className="mt-2 text-sm text-salon-body">
          Controls how many digit boxes appear on staff login.
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
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Google reviews</h2>
        <p className="mt-2 text-sm text-salon-body">
          Homepage review module. Sync pulls up to 5 reviews from Google Places each time,
          keeps unique ones in D1 (so the cache can grow as Google rotates results), and drops
          placeholder/test reviews. Nightly cron
          refreshes when an API key is configured.
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
            <dd>{settings.google_reviews.last_synced_at || "Using cached reviews"}</dd>
          </div>
        </dl>
        <label className="mt-4 block text-sm text-salon-body">
          Google Place ID
          <input
            value={placeIdDraft}
            onChange={(e) => setPlaceIdDraft(e.target.value)}
            className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            placeholder="ChIJ..."
          />
        </label>
        <label className="mt-3 block text-sm text-salon-body">
          Google Maps URL
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
          Off by default. Enable only when Twilio is configured.
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
        </dl>
        <label className="mt-6 block text-sm text-salon-body">
          Hours (one group per line)
          <textarea
            value={hoursDraft}
            onChange={(e) => setHoursDraft(e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-salon-border bg-salon-panel px-3 py-2 text-salon-heading"
            placeholder={"Mon-Fri 10am-6pm\nSat 10am-5pm\nSun Closed"}
          />
        </label>
        <p className="mt-2 text-xs text-salon-body">
          Shown as separate rows in the footer and contact page. Example: Mon-Fri,
          then Sat, then Sun.
        </p>
        <button
          type="button"
          disabled={saving || !hoursDraft.trim()}
          onClick={() =>
            save({
              business: {
                ...settings.business,
                hours: hoursDraft
                  .split(/\r?\n|,/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .join("\n"),
              },
            })
          }
          className="mt-4 min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
        >
          Save hours
        </button>
      </section>
    </div>
  );
}
