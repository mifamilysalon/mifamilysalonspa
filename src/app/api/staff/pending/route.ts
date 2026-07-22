import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["stylist", "receptionist", "owner", "manager"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT a.id, a.staff_id, a.service_id, a.client_name, a.client_phone,
                a.start_datetime, a.status, a.notes, s.name AS service_name,
                sp.display_name AS staff_name
         FROM appointments a
         JOIN services s ON s.id = a.service_id
         LEFT JOIN staff_profiles sp ON sp.id = a.staff_id
         WHERE a.status = 'pending'
         ORDER BY a.start_datetime ASC`,
      )
      .all<{
        id: number;
        staff_id: number | null;
        service_id: number;
        service_name: string;
        staff_name: string | null;
        client_name: string;
        client_phone: string;
        start_datetime: string;
        status: string;
        notes: string | null;
      }>();

    return NextResponse.json({ appointments: res.results || [] });
  } catch {
    return NextResponse.json({ error: "Failed to load pending appointments" }, { status: 500 });
  }
}
