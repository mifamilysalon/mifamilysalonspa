"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardLink, WebAnalyticsSettings } from "@/lib/system-health";

type SystemHealth = {
  free_tier: Record<string, number>;
  tips: string[];
  dashboards: DashboardLink[];
  cache: { kv_key_count: number | null; kv_error: string | null };
  sync: {
    google_reviews_last_synced_at: string | null;
    google_reviews_rating: number;
    google_reviews_count: number;
    google_reviews_cached_rows: number | null;
    instagram_last_synced_at: string | null;
    instagram_enabled: boolean;
    instagram_cached_posts: number | null;
    cron: string;
  };
  web_analytics: WebAnalyticsSettings;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function AdminSystemPage() {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tokenDraft, setTokenDraft] = useState("");
  const [enabledDraft, setEnabledDraft] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system");
      const json = (await res.json()) as SystemHealth;
      setData(json);
      setTokenDraft(json.web_analytics?.token || "");
      setEnabledDraft(Boolean(json.web_analytics?.enabled));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function clearCache() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_cache" }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setMessage(json.message || (json.ok ? "Done." : "Failed."));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveAnalytics() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenDraft.trim(),
          enabled: enabledDraft && Boolean(tokenDraft.trim()),
        }),
      });
      if (!res.ok) {
        setMessage("Could not save analytics settings.");
        return;
      }
      setMessage("Web Analytics settings saved. Public pages will use the beacon when enabled.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return <p className="text-salon-body">Loading system health…</p>;
  }

  if (!data) {
    return <p className="text-salon-body">Could not load system health.</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl text-salon-heading">System &amp; analytics</h1>
      <p className="mt-2 text-sm text-salon-body">
        Keep the site on Cloudflare&apos;s free plan, clear page cache when needed, and open
        Cloudflare dashboards for visitors and traffic.
      </p>

      {message ? (
        <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm text-salon-heading">
          {message}
        </p>
      ) : null}

      <section className="editorial-panel mt-8 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Cloudflare dashboards</h2>
        <p className="mt-2 text-sm text-salon-body">
          Sign in as <strong className="font-medium text-salon-heading">Familysalonspa@gmail.com</strong>{" "}
          (the client Cloudflare account). Start with Web Analytics to track visitors — it is free and
          privacy-friendly (no cookie banner required for the basic beacon).
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-salon-body">
          <li>
            Open <strong className="font-medium text-salon-heading">Web Analytics</strong> → Add a site
            → choose <code className="text-salon-heading">www.mifamilysalon.com</code> (or enable
            automatic setup for the proxied zone).
          </li>
          <li>
            If Cloudflare shows a JS snippet, copy the <strong className="font-medium">token</strong>{" "}
            and paste it below, then enable the beacon.
          </li>
          <li>
            Use <strong className="font-medium">Traffic</strong> and{" "}
            <strong className="font-medium">Worker metrics</strong> to watch free-tier usage monthly.
          </li>
        </ol>
        <ul className="mt-6 space-y-3">
          {data.dashboards.map((link) => (
            <li key={link.id} className="border-t border-salon-border pt-3 first:border-t-0 first:pt-0">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-salon-primary underline-offset-4 hover:text-salon-hover hover:underline"
              >
                {link.title}
              </a>
              <p className="mt-1 text-sm text-salon-body">{link.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Web Analytics beacon</h2>
        <p className="mt-2 text-sm text-salon-body">
          Optional. If automatic injection is off (or you want the beacon on Worker HTML for sure),
          paste the token from Cloudflare → Web Analytics → Manage site.
        </p>
        <label className="mt-4 block text-sm text-salon-body">
          Site token
          <input
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
            className="mt-1 w-full border border-salon-border bg-white px-3 py-2 text-salon-heading"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label className="mt-4 flex min-h-12 items-center gap-3 text-sm text-salon-heading">
          <input
            type="checkbox"
            checked={enabledDraft}
            onChange={(e) => setEnabledDraft(e.target.checked)}
            className="size-4"
          />
          Enable beacon on the public website
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveAnalytics()}
          className="mt-4 min-h-12 bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
        >
          Save analytics
        </button>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Page cache (KV)</h2>
        <p className="mt-2 text-sm text-salon-body">
          OpenNext may store rendered pages in Workers KV. Clear this if a deploy looks stuck on an
          old page. Prefer not to clear daily — free KV writes are limited.
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-salon-body">Cached keys</dt>
            <dd className="font-serif text-2xl text-salon-heading">
              {data.cache.kv_error
                ? "—"
                : data.cache.kv_key_count === null
                  ? "—"
                  : data.cache.kv_key_count}
            </dd>
            {data.cache.kv_error ? (
              <p className="text-xs text-salon-body">{data.cache.kv_error}</p>
            ) : null}
          </div>
          <div>
            <dt className="text-salon-body">KV writes free / day</dt>
            <dd className="font-serif text-2xl text-salon-heading">
              {data.free_tier.kv_writes_per_day.toLocaleString()}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={busy}
          onClick={() => void clearCache()}
          className="mt-4 min-h-12 border border-salon-border px-5 text-sm font-medium text-salon-heading hover:border-salon-primary disabled:opacity-60"
        >
          Clear page cache
        </button>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Nightly syncs</h2>
        <p className="mt-2 text-sm text-salon-body">{data.sync.cron}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2 border-b border-salon-border pb-3">
            <dt className="text-salon-body">Google reviews</dt>
            <dd className="text-right text-salon-heading">
              {formatWhen(data.sync.google_reviews_last_synced_at)}
              <span className="mt-1 block text-xs text-salon-body">
                {data.sync.google_reviews_rating.toFixed(1)}★ ·{" "}
                {data.sync.google_reviews_count.toLocaleString()} on Google ·{" "}
                {data.sync.google_reviews_cached_rows ?? "—"} cached rows
              </span>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-salon-body">Instagram</dt>
            <dd className="text-right text-salon-heading">
              {data.sync.instagram_enabled ? formatWhen(data.sync.instagram_last_synced_at) : "Feed off"}
              <span className="mt-1 block text-xs text-salon-body">
                {data.sync.instagram_cached_posts ?? "—"} cached posts
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="editorial-panel mt-6 p-6">
        <h2 className="font-serif text-lg text-salon-heading">Free-tier allowances</h2>
        <ul className="mt-4 grid gap-2 text-sm text-salon-body sm:grid-cols-2">
          <li>Workers: {data.free_tier.workers_requests_per_day.toLocaleString()} req/day</li>
          <li>KV reads: {data.free_tier.kv_reads_per_day.toLocaleString()}/day</li>
          <li>KV writes: {data.free_tier.kv_writes_per_day.toLocaleString()}/day</li>
          <li>D1 reads: {data.free_tier.d1_reads_per_day.toLocaleString()}/day</li>
          <li>D1 writes: {data.free_tier.d1_writes_per_day.toLocaleString()}/day</li>
          <li>R2 storage: {data.free_tier.r2_storage_gb} GB</li>
        </ul>
        <h3 className="mt-6 text-sm font-medium text-salon-heading">Stay free — maintenance tips</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-salon-body">
          {data.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
