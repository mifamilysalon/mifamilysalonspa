import type { AppEnv } from "../../cloudflare-env";

export type InstagramFeedSettings = {
  /** When false, the public Instagram section is hidden. */
  enabled: boolean;
  handle: string;
  profile_url: string;
  /** Free Behold JSON feed URL — preferred for custom-styled grid + nightly sync */
  behold_feed_url: string;
  /** Free Trustindex Instagram widget ID — same provider City Side Cafe uses */
  trustindex_widget_id: string;
  last_synced_at: string | null;
};

export type InstagramPost = {
  id: string;
  permalink: string;
  media_type: string;
  image_url: string;
  caption: string | null;
  posted_at: string | null;
  sort_order: number;
};

export const DEFAULT_INSTAGRAM_FEED: InstagramFeedSettings = {
  enabled: false,
  handle: "familysalonandspa",
  profile_url: "https://www.instagram.com/familysalonandspa/",
  behold_feed_url: "",
  trustindex_widget_id: "",
  last_synced_at: null,
};

type BeholdSize = { mediaUrl?: string };
type BeholdPost = {
  id?: string;
  permalink?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  prunedCaption?: string;
  timestamp?: string;
  sizes?: {
    small?: BeholdSize;
    medium?: BeholdSize;
    large?: BeholdSize;
    full?: BeholdSize;
  };
  children?: Array<{
    mediaType?: string;
    mediaUrl?: string;
    sizes?: BeholdPost["sizes"];
  }>;
};

type BeholdFeed = {
  username?: string;
  posts?: BeholdPost[];
};

export function profileUrlFromHandle(handle: string): string {
  const clean = handle.replace(/^@/, "").trim() || "familysalonandspa";
  return `https://www.instagram.com/${clean}/`;
}

export async function getInstagramFeedSettings(
  db: D1Database,
): Promise<InstagramFeedSettings> {
  const row = await db
    .prepare("SELECT value_json FROM site_settings WHERE key = 'instagram_feed'")
    .first<{ value_json: string }>();
  if (!row) return DEFAULT_INSTAGRAM_FEED;
  try {
    const parsed = JSON.parse(row.value_json) as Partial<InstagramFeedSettings>;
    const handle =
      (parsed.handle || DEFAULT_INSTAGRAM_FEED.handle).replace(/^@/, "").trim() ||
      DEFAULT_INSTAGRAM_FEED.handle;
    return {
      ...DEFAULT_INSTAGRAM_FEED,
      ...parsed,
      enabled: parsed.enabled === true,
      handle,
      profile_url:
        parsed.profile_url?.trim() ||
        profileUrlFromHandle(handle),
      behold_feed_url: parsed.behold_feed_url?.trim() || "",
      trustindex_widget_id: parsed.trustindex_widget_id?.trim() || "",
    };
  } catch {
    return DEFAULT_INSTAGRAM_FEED;
  }
}

export async function listCachedInstagramPosts(
  db: D1Database,
  limit = 12,
): Promise<InstagramPost[]> {
  const res = await db
    .prepare(
      `SELECT id, permalink, media_type, image_url, caption, posted_at, sort_order
       FROM instagram_posts
       ORDER BY sort_order ASC, posted_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<InstagramPost>();
  return res.results || [];
}

function pickImageUrl(post: BeholdPost): string | null {
  const fromSizes =
    post.sizes?.medium?.mediaUrl ||
    post.sizes?.large?.mediaUrl ||
    post.sizes?.small?.mediaUrl ||
    post.sizes?.full?.mediaUrl;
  if (fromSizes) return fromSizes;

  if (post.mediaType === "VIDEO" || post.mediaType === "CAROUSEL_ALBUM") {
    const child = post.children?.find((c) => c.mediaType === "IMAGE") || post.children?.[0];
    const childUrl =
      child?.sizes?.medium?.mediaUrl ||
      child?.sizes?.large?.mediaUrl ||
      child?.mediaUrl;
    if (childUrl) return childUrl;
    if (post.thumbnailUrl) return post.thumbnailUrl;
  }

  return post.mediaUrl || post.thumbnailUrl || null;
}

export async function syncInstagramFromBehold(
  env: AppEnv,
): Promise<{ ok: boolean; message: string; count?: number }> {
  const db = env.DB;
  if (!db) return { ok: false, message: "D1 not available" };

  const settings = await getInstagramFeedSettings(db);
  const feedUrl = settings.behold_feed_url.trim();

  if (!feedUrl) {
    return {
      ok: true,
      message:
        "No Behold feed URL yet. Create a free Behold JSON feed for @familysalonandspa, paste the URL in Settings, then sync.",
    };
  }

  if (!/^https:\/\/feeds\.behold\.so\/[A-Za-z0-9_-]+\/?$/.test(feedUrl)) {
    return {
      ok: false,
      message: "Behold feed URL must look like https://feeds.behold.so/yourFeedId",
    };
  }

  let data: BeholdFeed;
  try {
    const res = await fetch(feedUrl, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, message: `Behold feed returned HTTP ${res.status}` };
    }
    data = (await res.json()) as BeholdFeed;
  } catch {
    return { ok: false, message: "Failed to fetch Behold feed" };
  }

  const posts = Array.isArray(data.posts) ? data.posts : [];
  const rows: Array<{
    id: string;
    permalink: string;
    media_type: string;
    image_url: string;
    caption: string | null;
    posted_at: string | null;
    sort_order: number;
  }> = [];

  posts.forEach((post, index) => {
    const id = post.id?.trim();
    const permalink = post.permalink?.trim();
    const image_url = pickImageUrl(post);
    if (!id || !permalink || !image_url) return;
    rows.push({
      id,
      permalink,
      media_type: post.mediaType || "IMAGE",
      image_url,
      caption: (post.prunedCaption || post.caption || "").trim() || null,
      posted_at: post.timestamp || null,
      sort_order: index + 1,
    });
  });

  await db.prepare("DELETE FROM instagram_posts").run();

  for (const row of rows) {
    await db
      .prepare(
        `INSERT INTO instagram_posts
          (id, permalink, media_type, image_url, caption, posted_at, sort_order, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        row.id,
        row.permalink,
        row.media_type,
        row.image_url,
        row.caption,
        row.posted_at,
        row.sort_order,
      )
      .run();
  }

  const handle =
    (data.username || settings.handle).replace(/^@/, "").trim() || settings.handle;
  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
    )
    .bind(
      "instagram_feed",
      JSON.stringify({
        ...settings,
        handle,
        profile_url: profileUrlFromHandle(handle),
        last_synced_at: new Date().toISOString(),
      } satisfies InstagramFeedSettings),
    )
    .run();

  return {
    ok: true,
    message: `Synced ${rows.length} Instagram posts from Behold.`,
    count: rows.length,
  };
}
