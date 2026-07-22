import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PALETTES, type PaletteId } from "@/lib/palettes";
import {
  getActivePaletteId,
  getBusinessInfo,
  getSmsSettings,
} from "@/lib/site";

const paletteSchema = z.enum([
  "farmington-rose-gold",
  "warm-earth-spa",
  "noir-salon-luxe",
  "terracotta-cashmere",
]);

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

const settingsUpdateSchema = z.object({
  palette: paletteSchema.optional(),
  business: businessSchema.optional(),
  sms: smsSchema.optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [palette, business, sms] = await Promise.all([
      getActivePaletteId(),
      getBusinessInfo(),
      getSmsSettings(),
    ]);

    return NextResponse.json({
      palette,
      palettes: Object.entries(PALETTES).map(([id, p]) => ({
        id: id as PaletteId,
        name: p.name,
      })),
      business,
      sms,
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
