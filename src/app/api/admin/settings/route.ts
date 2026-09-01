import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  DEFAULT_INSTAGRAM_FEED,
  getInstagramFeedSettings,
  profileUrlFromHandle,
} from "@/lib/instagram";
import {
  DEFAULT_MEDIA,
  DEFAULT_SOCIAL,
  HERO_TONE_IDS,
  type HeroToneId,
} from "@/lib/media";
import {
  DEFAULT_PRICE_LIST,
  generatePriceListSlug,
  getPriceListSettings,
  isValidPriceListSlug,
  priceListPath,
} from "@/lib/price-list";
import {
  PALETTE_IDS,
  PALETTES,
  paletteDisplayName,
  type PaletteId,
} from "@/lib/palettes";
import { getGoogleReviewsMeta } from "@/lib/reviews";
import {
  getActivePaletteId,
  getAuthSettings,
  getBusinessInfo,
  getMediaSettings,
  getSmsSettings,
  getSocialLinks,
} from "@/lib/site";

const paletteSchema = z.enum(PALETTE_IDS as [PaletteId, ...PaletteId[]]);
const heroToneSchema = z.enum(HERO_TONE_IDS as [HeroToneId, ...HeroToneId[]]);

const businessSchema = z.object({
  name: z.string().min(1).max(200),
  phone_primary: z.string().min(7).max(30),
  phone_secondary: z.string().max(30).optional(),
  address: z.string().min(5).max(300),
  hours: z.string().min(3).max(300),
});

const smsSchema = z.object({
  enabled: z.boolean(),
  monthly_cap: z.number().int().positive().optional(),
  sent_this_month: z.number().int().min(0).optional(),
});

const authSchema = z.object({
  pin_length: z.union([z.literal(4), z.literal(6)]),
});

const googleReviewsSchema = z.object({
  place_id: z.string().max(200).optional(),
  maps_url: z.string().url().max(500).optional(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().int().min(0).optional(),
  last_synced_at: z.string().nullable().optional(),
});

const mediaSchema = z.object({
  hero_image: z.union([z.string().url().max(500), z.literal("")]).optional(),
  hero_tone: heroToneSchema.optional(),
});

const socialSchema = z.object({
  facebook: z.string().max(300).optional(),
  instagram: z.string().max(300).optional(),
  yelp: z.string().max(300).optional(),
  threads: z.string().max(300).optional(),
  tiktok: z.string().max(300).optional(),
});

const instagramFeedSchema = z.object({
  handle: z.string().max(80).optional(),
  profile_url: z.string().max(300).optional(),
  behold_feed_url: z.string().max(300).optional(),
  trustindex_widget_id: z.string().max(80).optional(),
});

const priceListSchema = z.object({
  /** Set true to mint a new unguessable QR slug (invalidates old printed codes). */
  rotate: z.boolean().optional(),
  slug: z.string().max(32).optional(),
});

const settingsUpdateSchema = z.object({
  palette: paletteSchema.optional(),
  business: businessSchema.optional(),
  sms: smsSchema.optional(),
  auth: authSchema.optional(),
  google_reviews: googleReviewsSchema.optional(),
  media: mediaSchema.optional(),
  social: socialSchema.optional(),
  instagram_feed: instagramFeedSchema.optional(),
  price_list: priceListSchema.optional(),
});

async function upsertSetting(db: D1Database, key: string, value: unknown) {
  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
    )
    .bind(key, JSON.stringify(value))
    .run();
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const [
      palette,
      business,
      sms,
      auth,
      google_reviews,
      media,
      social,
      instagram_feed,
      price_list,
    ] = await Promise.all([
      getActivePaletteId(),
      getBusinessInfo(),
      getSmsSettings(),
      getAuthSettings(),
      getGoogleReviewsMeta(db),
      getMediaSettings(),
      getSocialLinks(),
      getInstagramFeedSettings(db),
      getPriceListSettings(),
    ]);

    return NextResponse.json({
      palette,
      palettes: PALETTE_IDS.map((id) => ({
        id,
        name: paletteDisplayName(id),
        isCurrentSiteInspired: !!PALETTES[id].isCurrentSiteInspired,
        suffix: PALETTES[id].suffix,
      })),
      business,
      sms,
      auth,
      google_reviews,
      media,
      social,
      instagram_feed,
      price_list: {
        ...price_list,
        path: priceListPath(price_list.slug),
      },
      defaults: {
        media: DEFAULT_MEDIA,
        social: DEFAULT_SOCIAL,
        instagram_feed: DEFAULT_INSTAGRAM_FEED,
        price_list: DEFAULT_PRICE_LIST,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
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
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
    }

    const db = await getDb();

    if (parsed.data.palette) {
      await upsertSetting(db, "palette", parsed.data.palette);
    }

    if (parsed.data.business) {
      await upsertSetting(db, "business", parsed.data.business);
    }

    if (parsed.data.sms) {
      const current = await getSmsSettings();
      await upsertSetting(db, "sms", { ...current, ...parsed.data.sms });
    }

    if (parsed.data.auth) {
      await upsertSetting(db, "auth", parsed.data.auth);
    }

    if (parsed.data.google_reviews) {
      const current = await getGoogleReviewsMeta(db);
      await upsertSetting(db, "google_reviews", {
        ...current,
        ...parsed.data.google_reviews,
      });
    }

    if (parsed.data.media) {
      const current = await getMediaSettings();
      await upsertSetting(db, "media", { ...current, ...parsed.data.media });
    }

    if (parsed.data.social) {
      const current = await getSocialLinks();
      await upsertSetting(db, "social", { ...current, ...parsed.data.social });
    }

    if (parsed.data.instagram_feed) {
      const current = await getInstagramFeedSettings(db);
      const handle =
        (parsed.data.instagram_feed.handle ?? current.handle)
          .replace(/^@/, "")
          .trim() || current.handle;
      const profile_url =
        parsed.data.instagram_feed.profile_url?.trim() ||
        profileUrlFromHandle(handle);
      await upsertSetting(db, "instagram_feed", {
        ...current,
        ...parsed.data.instagram_feed,
        handle,
        profile_url,
        behold_feed_url:
          parsed.data.instagram_feed.behold_feed_url?.trim() ??
          current.behold_feed_url,
        trustindex_widget_id:
          parsed.data.instagram_feed.trustindex_widget_id?.trim() ??
          current.trustindex_widget_id,
      });
    }

    if (parsed.data.price_list) {
      let slug = (parsed.data.price_list.slug || "").trim().toLowerCase();
      if (parsed.data.price_list.rotate) {
        slug = generatePriceListSlug();
      }
      if (!isValidPriceListSlug(slug)) {
        return NextResponse.json(
          { error: "Invalid price list slug" },
          { status: 400 },
        );
      }
      await upsertSetting(db, "price_list", { slug });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
