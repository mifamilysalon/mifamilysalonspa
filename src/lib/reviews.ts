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

type PlacesReview = {
  authorAttribution?: { displayName?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
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
       ORDER BY sort_order ASC, id ASC
       LIMIT 24`,
    )
    .all<GoogleReview>();
  return res.results || [];
}

function normalizePlaceId(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("places/")) return trimmed.slice("places/".length);
  return trimmed;
}

function placesErrorHint(status: number, body: string): string {
  if (body.includes("API_KEY_SERVICE_BLOCKED")) {
    return (
      " Your API key cannot call Places API (New). In Google Cloud: enable Places API (New) " +
      "(not only legacy Places API), then edit the key → API restrictions → allow Places API (New). " +
      "On production run: npx wrangler secret put GOOGLE_PLACES_API_KEY."
    );
  }
  if (status === 403) {
    return " Check billing is enabled on the Google Cloud project and the key is unrestricted or allows Places API (New).";
  }
  return "";
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

  const placeId = normalizePlaceId(meta.place_id);
  if (!placeId) {
    return {
      ok: false,
      message: "Set a Google Place ID in Admin Settings to sync live reviews.",
    };
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    const hint = placesErrorHint(res.status, body);
    return {
      ok: false,
      message: `Places API error ${res.status}: ${body.slice(0, 280)}${hint}`,
    };
  }

  const data = (await res.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: PlacesReview[];
  };

  const reviews = data.reviews || [];
  await db.prepare("DELETE FROM google_reviews WHERE source = 'places'").run();

  let order = 1;
  for (const r of reviews) {
    const text = r.text?.text?.trim();
    const name = r.authorAttribution?.displayName?.trim() || "Google reviewer";
    const rating = Math.round(r.rating || 5);
    if (!text) continue;
    await db
      .prepare(
        `INSERT INTO google_reviews
         (author_name, rating, text, relative_time, publish_time, profile_photo_url, sort_order, source, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'places', datetime('now'))`,
      )
      .bind(
        name,
        rating,
        text,
        r.relativePublishTimeDescription || null,
        r.publishTime || null,
        r.authorAttribution?.photoUri || null,
        order++,
      )
      .run();
  }

  // Drop seed rows once live reviews exist so the carousel stays authentic
  if (reviews.length > 0) {
    await db.prepare("DELETE FROM google_reviews WHERE source = 'seed'").run();
  }

  const nextMeta: GoogleReviewsMeta = {
    ...meta,
    place_id: placeId,
    rating: typeof data.rating === "number" ? data.rating : meta.rating,
    review_count:
      typeof data.userRatingCount === "number" ? data.userRatingCount : meta.review_count,
    maps_url: data.googleMapsUri || meta.maps_url,
    last_synced_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json) VALUES ('google_reviews', ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
    )
    .bind(JSON.stringify(nextMeta))
    .run();

  return { ok: true, message: "Synced Google reviews", count: reviews.length };
}
