import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
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
  getSmsSettings,
} from "@/lib/site";

const paletteSchema = z.enum(PALETTE_IDS as [PaletteId, ...PaletteId[]]);

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

const settingsUpdateSchema = z.object({
  palette: paletteSchema.optional(),
  business: businessSchema.optional(),
  sms: smsSchema.optional(),
  auth: authSchema.optional(),
  google_reviews: googleReviewsSchema.optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const [palette, business, sms, auth, google_reviews] = await Promise.all([
      getActivePaletteId(),
      getBusinessInfo(),
      getSmsSettings(),
      getAuthSettings(),
      getGoogleReviewsMeta(db),
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
      await db
        .prepare(
          `INSERT INTO site_settings (key, value_json) VALUES ('palette', ?)
           ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        )
        .bind(JSON.stringify(parsed.data.palette))
        .run();
    }

    if (parsed.data.business) {
      await db
        .prepare(
          `INSERT INTO site_settings (key, value_json) VALUES ('business', ?)
           ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        )
        .bind(JSON.stringify(parsed.data.business))
        .run();
    }

    if (parsed.data.sms) {
      const current = await getSmsSettings();
      const merged = {
        ...current,
        ...parsed.data.sms,
      };
      await db
        .prepare(
          `INSERT INTO site_settings (key, value_json) VALUES ('sms', ?)
           ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        )
        .bind(JSON.stringify(merged))
        .run();
    }

    if (parsed.data.auth) {
      await db
        .prepare(
          `INSERT INTO site_settings (key, value_json) VALUES ('auth', ?)
           ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        )
        .bind(JSON.stringify(parsed.data.auth))
        .run();
    }

    if (parsed.data.google_reviews) {
      const current = await getGoogleReviewsMeta(db);
      const merged = { ...current, ...parsed.data.google_reviews };
      await db
        .prepare(
          `INSERT INTO site_settings (key, value_json) VALUES ('google_reviews', ?)
           ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        )
        .bind(JSON.stringify(merged))
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
