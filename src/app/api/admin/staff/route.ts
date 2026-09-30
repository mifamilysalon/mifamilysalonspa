import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, requireRole } from "@/lib/auth";
import { getAuthSettings } from "@/lib/site";
import { getDb } from "@/lib/db";

export type AdminStaffMember = {
  id: number;
  user_id: number;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  is_bookable: number;
  name: string;
  email: string | null;
  role: string;
  is_active: number;
  has_pin: number;
  service_ids: number[];
};

const createSchema = z.object({
  display_name: z.string().min(2).max(120),
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(160).optional().nullable(),
  role: z.enum(["stylist", "receptionist", "manager"]),
  bio: z.string().max(2000).optional().nullable(),
  is_bookable: z.boolean().optional().default(true),
  pin: z.string().regex(/^\d{4}$|^\d{6}$/),
  service_ids: z.array(z.number().int().positive()).optional().default([]),
});

const DEFAULT_HOURS: Array<{ day: number; start: string; end: string }> = [
  { day: 1, start: "10:00", end: "18:00" },
  { day: 2, start: "10:00", end: "18:00" },
  { day: 3, start: "10:00", end: "18:00" },
  { day: 4, start: "10:00", end: "18:00" },
  { day: 5, start: "10:00", end: "18:00" },
  { day: 6, start: "10:00", end: "17:00" },
];

async function loadStaff(db: D1Database): Promise<AdminStaffMember[]> {
  const res = await db
    .prepare(
      `SELECT sp.id, sp.user_id, sp.display_name, sp.bio, sp.photo_url, sp.is_bookable,
              u.name, u.email, u.role, u.is_active,
              CASE WHEN u.pin_hash IS NOT NULL AND u.pin_hash != '' THEN 1 ELSE 0 END AS has_pin
       FROM staff_profiles sp
       JOIN users u ON u.id = sp.user_id
       ORDER BY u.is_active DESC, sp.display_name ASC`,
    )
    .all<Omit<AdminStaffMember, "service_ids">>();

  const rows = res.results || [];
  if (!rows.length) return [];

  const services = await db
    .prepare("SELECT staff_id, service_id FROM staff_services")
    .all<{ staff_id: number; service_id: number }>();

  const byStaff = new Map<number, number[]>();
  for (const row of services.results || []) {
    const list = byStaff.get(row.staff_id) || [];
    list.push(row.service_id);
    byStaff.set(row.staff_id, list);
  }

  return rows.map((row) => ({
    ...row,
    service_ids: byStaff.get(row.id) || [],
  }));
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
    const [staff, auth, services] = await Promise.all([
      loadStaff(db),
      getAuthSettings(),
      db
        .prepare(
          "SELECT id, name, category FROM services WHERE is_active = 1 ORDER BY category, name",
        )
        .all<{ id: number; name: string; category: string }>(),
    ]);

    return NextResponse.json({
      staff,
      pinLength: auth.pin_length,
      services: services.results || [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
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

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid staff data. Name, role, and a 4- or 6-digit PIN are required." },
        { status: 400 },
      );
    }

    const auth = await getAuthSettings();
    if (parsed.data.pin.length !== auth.pin_length) {
      return NextResponse.json(
        { error: `PIN must be ${auth.pin_length} digits (see Settings → Staff PIN length).` },
        { status: 400 },
      );
    }

    const db = await getDb();
    const displayName = parsed.data.display_name.trim();
    const name = (parsed.data.name || displayName).trim();
    const email = parsed.data.email?.trim().toLowerCase() || null;

    if (email) {
      const existing = await db
        .prepare("SELECT id FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (existing) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
      }
    }

    const pinHash = await hashPassword(parsed.data.pin);
    const userInsert = await db
      .prepare(
        `INSERT INTO users (email, password_hash, pin_hash, role, name, is_active)
         VALUES (?, NULL, ?, ?, ?, 1)`,
      )
      .bind(email, pinHash, parsed.data.role, name)
      .run();

    const userId = Number(userInsert.meta.last_row_id);
    const profileInsert = await db
      .prepare(
        `INSERT INTO staff_profiles (user_id, display_name, bio, is_bookable)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(
        userId,
        displayName,
        parsed.data.bio?.trim() || null,
        parsed.data.is_bookable === false ? 0 : 1,
      )
      .run();

    const staffId = Number(profileInsert.meta.last_row_id);

    for (const serviceId of parsed.data.service_ids || []) {
      await db
        .prepare(
          "INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)",
        )
        .bind(staffId, serviceId)
        .run();
    }

    for (const slot of DEFAULT_HOURS) {
      await db
        .prepare(
          `INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(staffId, slot.day, slot.start, slot.end)
        .run();
    }

    return NextResponse.json({ id: staffId, user_id: userId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
