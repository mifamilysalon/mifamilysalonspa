import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb, getEnv } from "@/lib/db";
import { getInstagramFeedSettings } from "@/lib/instagram";
import { getGoogleReviewsMeta } from "@/lib/reviews";
import {
  clearKvCache,
  cloudflareDashboardLinks,
  countKvKeys,
  DEFAULT_WEB_ANALYTICS,
  FREE_TIER_LIMITS,
  freeTierTips,
  getWebAnalyticsSettings,
} from "@/lib/system-health";

async function upsertSetting(db: D1Database, key: string, value: unknown) {
  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
    )
    .bind(key, JSON.stringify(value))
    .run();
}

const analyticsSchema = z.object({
  token: z.string().max(200).optional(),
  enabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = await getEnv();
    const db = await getDb();
    const [reviews, instagram, webAnalytics] = await Promise.all([
      getGoogleReviewsMeta(db),
      getInstagramFeedSettings(db),
      getWebAnalyticsSettings(db),
    ]);

    let kvKeyCount: number | null = null;
    let kvError: string | null = null;
    if (env.CACHE) {
      try {
        kvKeyCount = await countKvKeys(env.CACHE);
      } catch {
        kvError = "Could not list KV keys.";
      }
    } else {
      kvError = "CACHE binding not available.";
    }

    const reviewCountRow = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM google_reviews WHERE source = 'places'`,
      )
      .first<{ n: number }>()
      .catch(() => null);

    const igCountRow = await db
      .prepare(`SELECT COUNT(*) AS n FROM instagram_posts`)
      .first<{ n: number }>()
      .catch(() => null);

    return NextResponse.json({
      free_tier: FREE_TIER_LIMITS,
      tips: freeTierTips(),
      dashboards: cloudflareDashboardLinks(),
      cache: {
        kv_key_count: kvKeyCount,
        kv_error: kvError,
      },
      sync: {
        google_reviews_last_synced_at: reviews.last_synced_at,
        google_reviews_rating: reviews.rating,
        google_reviews_count: reviews.review_count,
        google_reviews_cached_rows: reviewCountRow?.n ?? null,
        instagram_last_synced_at: instagram.last_synced_at,
        instagram_enabled: instagram.enabled,
        instagram_cached_posts: igCountRow?.n ?? null,
        cron: "Daily at 04:00 UTC (reviews + Instagram)",
      },
      web_analytics: webAnalytics,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load system health" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = analyticsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics settings" }, { status: 400 });
    }

    const db = await getDb();
    const current = await getWebAnalyticsSettings(db);
    const next = {
      token:
        typeof parsed.data.token === "string"
          ? parsed.data.token.trim()
          : current.token,
      enabled:
        typeof parsed.data.enabled === "boolean"
          ? parsed.data.enabled
          : current.enabled,
    };
    if (!next.token) next.enabled = false;

    await upsertSetting(db, "web_analytics", next);
    return NextResponse.json({ ok: true, web_analytics: next });
  } catch {
    return NextResponse.json({ error: "Failed to save analytics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
    };
    const action = body.action || "clear_cache";

    if (action !== "clear_cache") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const env = await getEnv();
    if (!env.CACHE) {
      return NextResponse.json(
        { ok: false, message: "CACHE binding not available" },
        { status: 503 },
      );
    }

    const result = await clearKvCache(env.CACHE);
    return NextResponse.json({
      ok: true,
      message:
        result.deleted === 0
          ? "Page cache was already empty."
          : `Cleared ${result.deleted} cache ${result.deleted === 1 ? "key" : "keys"}.`,
      deleted: result.deleted,
      web_analytics_default: DEFAULT_WEB_ANALYTICS,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Cache clear failed" }, { status: 500 });
  }
}
