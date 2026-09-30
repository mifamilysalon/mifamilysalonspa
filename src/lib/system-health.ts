import { LOCAL_BUSINESS, SITE_HOST, SITE_URL } from "./seo";

/** Client Cloudflare account (Familysalonspa@gmail.com). */
export const CF_ACCOUNT_ID = "b51ded38b292d1a89fdd26e99e1bb7e9";
/** Zone for mifamilysalon.com on that account. */
export const CF_ZONE_ID = "ffbb30061a666037909be28a6ea73273";
export const CF_WORKER_NAME = "mifamilysalonspa";

export type WebAnalyticsSettings = {
  /** Cloudflare Web Analytics site token (public beacon token). */
  token: string;
  enabled: boolean;
};

export const DEFAULT_WEB_ANALYTICS: WebAnalyticsSettings = {
  token: "",
  enabled: false,
};

/** Workers Free plan allowances — keep client off paid until traffic grows. */
export const FREE_TIER_LIMITS = {
  workers_requests_per_day: 100_000,
  kv_reads_per_day: 100_000,
  kv_writes_per_day: 1_000,
  kv_storage_gb: 1,
  d1_reads_per_day: 5_000_000,
  d1_writes_per_day: 100_000,
  d1_storage_gb: 5,
  r2_storage_gb: 10,
  r2_class_a_per_month: 1_000_000,
  r2_class_b_per_month: 10_000_000,
} as const;

export type DashboardLink = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export function cloudflareDashboardLinks(): DashboardLink[] {
  const acct = CF_ACCOUNT_ID;
  const zone = CF_ZONE_ID;
  return [
    {
      id: "web-analytics",
      title: "Web Analytics (visitors)",
      description:
        "Privacy-friendly page views, visits, and top pages. Free. Enable the site here if the beacon is not installed yet.",
      href: `https://dash.cloudflare.com/${acct}/web-analytics`,
    },
    {
      id: "traffic",
      title: "Traffic (zone)",
      description:
        "Requests, bandwidth, and threats for mifamilysalon.com on the Free Website plan.",
      href: `https://dash.cloudflare.com/${acct}/${zone}/analytics/traffic`,
    },
    {
      id: "workers-metrics",
      title: "Worker metrics",
      description:
        "How often the site Worker runs — useful for staying under the free 100k requests/day.",
      href: `https://dash.cloudflare.com/${acct}/workers/services/view/${CF_WORKER_NAME}/production/metrics`,
    },
    {
      id: "workers-overview",
      title: "Workers & storage overview",
      description: "Workers, KV, D1, and R2 usage for this Cloudflare account.",
      href: `https://dash.cloudflare.com/${acct}/workers/overview`,
    },
    {
      id: "r2",
      title: "R2 media bucket",
      description: "Uploaded photos and media storage (free up to 10 GB).",
      href: `https://dash.cloudflare.com/${acct}/r2/default/buckets/familysalonspa-media`,
    },
    {
      id: "d1",
      title: "D1 database",
      description: "Appointments, settings, and cached reviews storage.",
      href: `https://dash.cloudflare.com/${acct}/workers/d1`,
    },
  ];
}

export async function getWebAnalyticsSettings(
  db: D1Database,
): Promise<WebAnalyticsSettings> {
  const row = await db
    .prepare(
      "SELECT value_json FROM site_settings WHERE key = 'web_analytics'",
    )
    .first<{ value_json: string }>();
  if (!row) return DEFAULT_WEB_ANALYTICS;
  try {
    const parsed = JSON.parse(row.value_json) as Partial<WebAnalyticsSettings>;
    return {
      token: typeof parsed.token === "string" ? parsed.token.trim() : "",
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : Boolean(parsed.token?.trim()),
    };
  } catch {
    return DEFAULT_WEB_ANALYTICS;
  }
}

export async function clearKvCache(
  kv: KVNamespace,
): Promise<{ deleted: number }> {
  let deleted = 0;
  let cursor: string | undefined;

  do {
    const listed = await kv.list({ limit: 1000, cursor });
    if (listed.keys.length) {
      await Promise.all(listed.keys.map((key) => kv.delete(key.name)));
      deleted += listed.keys.length;
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  return { deleted };
}

export async function countKvKeys(kv: KVNamespace): Promise<number> {
  let total = 0;
  let cursor: string | undefined;
  do {
    const listed = await kv.list({ limit: 1000, cursor });
    total += listed.keys.length;
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
  return total;
}

export function freeTierTips(): string[] {
  return [
    `Static images and JS are served from CDN assets — they barely touch the Worker free quota.`,
    `Google reviews stay in D1 (capped) and sync once nightly — not on every page view.`,
    `Clear the page cache only after a deploy looks stuck; KV writes are limited to ${FREE_TIER_LIMITS.kv_writes_per_day.toLocaleString()}/day on Free.`,
    `Keep R2 under ${FREE_TIER_LIMITS.r2_storage_gb} GB by removing unused uploads from Admin media or the R2 dashboard.`,
    `Watch Worker metrics monthly. A local salon site almost never needs Workers Paid ($5/mo) unless traffic spikes hard.`,
    `Site: ${SITE_URL} · ${LOCAL_BUSINESS.addressLocality}, ${LOCAL_BUSINESS.addressRegion} · host ${SITE_HOST}`,
  ];
}
