import type { AppEnv } from "../../cloudflare-env";

export type GoogleReview = {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  relative_time: string | null;
  publish_time: string | null;
  profile_photo_url: string | null;
  sort_order: number;
  source: string;
};

export type GoogleReviewsMeta = {
  place_id: string;
  maps_url: string;
  rating: number;
  review_count: number;
  last_synced_at: string | null;
};

const DEFAULT_META: GoogleReviewsMeta = {
  place_id: "",
  maps_url:
    "https://www.google.com/maps/search/?api=1&query=Family+Hair+Salon+%26+Wellness+Spa+34777+Grand+River+Ave+Farmington+MI",
  rating: 4.4,
  review_count: 1012,
  last_synced_at: null,
};

type NormalizedReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time: string | null;
  publish_time: string | null;
  profile_photo_url: string | null;
};

type PlacesReviewNew = {
  authorAttribution?: { displayName?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
};

type PlacesReviewLegacy = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  time?: number;
  profile_photo_url?: string;
};

export async function getGoogleReviewsMeta(db: D1Database): Promise<GoogleReviewsMeta> {
  const row = await db
    .prepare("SELECT value_json FROM site_settings WHERE key = 'google_reviews'")
    .first<{ value_json: string }>();
  if (!row) return DEFAULT_META;
  try {
    return { ...DEFAULT_META, ...JSON.parse(row.value_json) };
  } catch {
    return DEFAULT_META;
  }
}

export async function listCachedGoogleReviews(db: D1Database): Promise<GoogleReview[]> {
  const res = await db
    .prepare(
      `SELECT id, author_name, rating, text, relative_time, publish_time, profile_photo_url, sort_order, source
       FROM google_reviews
       WHERE source != 'seed'
       ORDER BY sort_order ASC, updated_at DESC, id DESC
       LIMIT 24`,
    )
    .all<GoogleReview>();
  const live = res.results || [];
  if (live.length > 0) return live;

  // Fallback to seed only until the first successful Places sync.
  const seed = await db
    .prepare(
      `SELECT id, author_name, rating, text, relative_time, publish_time, profile_photo_url, sort_order, source
       FROM google_reviews
       ORDER BY sort_order ASC, id ASC
       LIMIT 24`,
    )
    .all<GoogleReview>();
  return seed.results || [];
}

function normalizePlaceId(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("places/")) return trimmed.slice("places/".length);
  return trimmed;
}

function placesErrorHint(status: number, body: string): string {
  if (body.includes("API_KEY_SERVICE_BLOCKED")) {
    return (
      " Your API key cannot call Places API (New). Enable Places API (New) in Google Cloud, " +
      "or keep Places API (legacy Place Details) enabled — sync falls back to legacy automatically. " +
      "On production: npx wrangler secret put GOOGLE_PLACES_API_KEY."
    );
  }
  if (status === 403) {
    return " Check billing is enabled on the Google Cloud project and the key allows Places API.";
  }
  return "";
}

async function fetchReviewsPlacesNew(
  placeId: string,
  apiKey: string,
): Promise<
  | { ok: true; rating?: number; reviewCount?: number; mapsUrl?: string; reviews: NormalizedReview[] }
  | { ok: false; status: number; body: string }
> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
    },
  });

  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }

  const data = (await res.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: PlacesReviewNew[];
  };

  const reviews: NormalizedReview[] = [];
  for (const r of data.reviews || []) {
    const text = r.text?.text?.trim();
    if (!text) continue;
    reviews.push({
      author_name: r.authorAttribution?.displayName?.trim() || "Google reviewer",
      rating: Math.round(r.rating || 5),
      text,
      relative_time: r.relativePublishTimeDescription || null,
      publish_time: r.publishTime || null,
      profile_photo_url: r.authorAttribution?.photoUri || null,
    });
  }

  return {
    ok: true,
    rating: data.rating,
    reviewCount: data.userRatingCount,
    mapsUrl: data.googleMapsUri,
    reviews,
  };
}

async function fetchReviewsPlacesLegacy(
  placeId: string,
  apiKey: string,
): Promise<
  | { ok: true; rating?: number; reviewCount?: number; mapsUrl?: string; reviews: NormalizedReview[] }
  | { ok: false; status: number; body: string }
> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "rating,user_ratings_total,reviews,url",
    key: apiKey,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
  );

  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    result?: {
      rating?: number;
      user_ratings_total?: number;
      url?: string;
      reviews?: PlacesReviewLegacy[];
    };
  };

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return {
      ok: false,
      status: 400,
      body: `${data.status}: ${data.error_message || "Place Details failed"}`,
    };
  }

  const reviews: NormalizedReview[] = [];
  for (const r of data.result?.reviews || []) {
    const text = r.text?.trim();
    if (!text) continue;
    reviews.push({
      author_name: r.author_name?.trim() || "Google reviewer",
      rating: Math.round(r.rating || 5),
      text,
      relative_time: r.relative_time_description || null,
      publish_time:
        typeof r.time === "number" ? new Date(r.time * 1000).toISOString() : null,
      profile_photo_url: r.profile_photo_url || null,
    });
  }

  return {
    ok: true,
    rating: data.result?.rating,
    reviewCount: data.result?.user_ratings_total,
    mapsUrl: data.result?.url,
    reviews,
  };
}

function reviewFingerprint(author: string, text: string): string {
  return `${author.trim().toLowerCase()}::${text.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

/**
 * Merge Places results into the cache instead of wiping it.
 * Google usually returns the same ~5 "most relevant" reviews, but when the
 * set changes over time we keep prior unique reviews so the site accumulates.
 */
async function mergeCachedReviews(
  db: D1Database,
  reviews: NormalizedReview[],
): Promise<{ added: number; updated: number; total: number }> {
  // Drop placeholder seed rows once we have live Places data.
  await db.prepare("DELETE FROM google_reviews WHERE source = 'seed'").run();

  const existing = await db
    .prepare(
      `SELECT id, author_name, text, source FROM google_reviews WHERE source = 'places'`,
    )
    .all<{ id: number; author_name: string; text: string; source: string }>();

  const byFingerprint = new Map<string, number>();
  for (const row of existing.results || []) {
    byFingerprint.set(reviewFingerprint(row.author_name, row.text), row.id);
  }

  let added = 0;
  let updated = 0;
  // Freshly seen reviews get the lowest sort_order (shown first).
  let order = 1;

  for (const r of reviews) {
    const key = reviewFingerprint(r.author_name, r.text);
    const existingId = byFingerprint.get(key);
    if (existingId) {
      await db
        .prepare(
          `UPDATE google_reviews
           SET rating = ?, relative_time = ?, publish_time = ?, profile_photo_url = ?,
               sort_order = ?, updated_at = datetime('now')
           WHERE id = ?`,
        )
        .bind(
          r.rating,
          r.relative_time,
          r.publish_time,
          r.profile_photo_url,
          order++,
          existingId,
        )
        .run();
      updated++;
    } else {
      await db
        .prepare(
          `INSERT INTO google_reviews
           (author_name, rating, text, relative_time, publish_time, profile_photo_url, sort_order, source, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'places', datetime('now'))`,
        )
        .bind(
          r.author_name,
          r.rating,
          r.text,
          r.relative_time,
          r.publish_time,
          r.profile_photo_url,
          order++,
        )
        .run();
      byFingerprint.set(key, -1);
      added++;
    }
  }

  // Keep a reasonable cache size; drop oldest Places rows beyond the cap.
  const CAP = 48;
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM google_reviews WHERE source = 'places'`)
    .first<{ n: number }>();
  const total = countRow?.n ?? 0;
  if (total > CAP) {
    await db
      .prepare(
        `DELETE FROM google_reviews
         WHERE id IN (
           SELECT id FROM google_reviews
           WHERE source = 'places'
           ORDER BY updated_at ASC, id ASC
           LIMIT ?
         )`,
      )
      .bind(total - CAP)
      .run();
  }

  const after = await db
    .prepare(`SELECT COUNT(*) AS n FROM google_reviews WHERE source = 'places'`)
    .first<{ n: number }>();

  return { added, updated, total: after?.n ?? total };
}

export async function syncGoogleReviewsFromPlaces(
  env: AppEnv,
): Promise<{ ok: boolean; message: string; count?: number }> {
  const db = env.DB;
  if (!db) return { ok: false, message: "D1 not available" };

  const meta = await getGoogleReviewsMeta(db);
  const apiKey = env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      message:
        "GOOGLE_PLACES_API_KEY is not set on this environment. Add it to .dev.vars locally or run npx wrangler secret put GOOGLE_PLACES_API_KEY for production, then Sync again.",
    };
  }

  const placeId = normalizePlaceId(meta.place_id || env.GOOGLE_PLACE_ID || "");
  if (!placeId) {
    return {
      ok: false,
      message:
        "Set a Google Place ID in Admin Settings (or GOOGLE_PLACE_ID in .dev.vars / Wrangler vars) to sync live reviews.",
    };
  }

  let fetched = await fetchReviewsPlacesNew(placeId, apiKey);
  let via = "Places API (New)";

  if (!fetched.ok) {
    const legacy = await fetchReviewsPlacesLegacy(placeId, apiKey);
    if (legacy.ok) {
      fetched = legacy;
      via = "Places API (legacy)";
    } else {
      const hint = placesErrorHint(fetched.status, fetched.body);
      return {
        ok: false,
        message: `Places API error ${fetched.status}: ${fetched.body.slice(0, 280)}${hint}`,
      };
    }
  }

  if (!fetched.ok) {
    return { ok: false, message: "Places sync failed" };
  }

  const merge = await mergeCachedReviews(db, fetched.reviews);

  const nextMeta: GoogleReviewsMeta = {
    ...meta,
    place_id: placeId,
    rating: typeof fetched.rating === "number" ? fetched.rating : meta.rating,
    review_count:
      typeof fetched.reviewCount === "number" ? fetched.reviewCount : meta.review_count,
    maps_url: fetched.mapsUrl || meta.maps_url,
    last_synced_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json) VALUES ('google_reviews', ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
    )
    .bind(JSON.stringify(nextMeta))
    .run();

  return {
    ok: true,
    message: `Fetched ${fetched.reviews.length} via ${via}: ${merge.added} new, ${merge.updated} refreshed. Cache now holds ${merge.total} unique review${merge.total === 1 ? "" : "s"} (Google returns up to 5 per call; new ones accumulate over time).`,
    count: merge.total,
  };
}
