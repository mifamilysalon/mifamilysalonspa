import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthSettings, getBookableStaff } from "@/lib/site";
import type { StaffProfile } from "@/lib/site";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const forLogin = searchParams.get("forLogin") === "1";
    const auth = await getAuthSettings();

    if (forLogin) {
      const db = await getDb();
      const res = await db
        .prepare(
          `SELECT sp.id, sp.display_name, sp.bio, sp.photo_url, sp.is_bookable
           FROM staff_profiles sp
           JOIN users u ON u.id = sp.user_id
           WHERE u.is_active = 1 AND u.pin_hash IS NOT NULL AND u.pin_hash != ''
           ORDER BY sp.display_name`,
        )
        .all<StaffProfile>();
      return NextResponse.json({ staff: res.results || [], pinLength: auth.pin_length });
    }

    if (!serviceId) {
      const staff = await getBookableStaff();
      return NextResponse.json({ staff, pinLength: auth.pin_length });
    }

    const sid = Number(serviceId);
    if (!Number.isFinite(sid) || sid <= 0) {
      return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
    }

    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT sp.id, sp.display_name, sp.bio, sp.photo_url, sp.is_bookable
         FROM staff_profiles sp
         JOIN staff_services ss ON ss.staff_id = sp.id
         JOIN users u ON u.id = sp.user_id
         WHERE sp.is_bookable = 1 AND u.is_active = 1 AND ss.service_id = ?
         ORDER BY sp.display_name`,
      )
      .bind(sid)
      .all<StaffProfile>();

    return NextResponse.json({ staff: res.results || [], pinLength: auth.pin_length });
  } catch {
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }
}
