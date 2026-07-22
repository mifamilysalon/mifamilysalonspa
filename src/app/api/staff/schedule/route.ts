import { format } from "date-fns";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["stylist", "receptionist", "owner", "manager"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam || format(new Date(), "yyyy-MM-dd");

    const db = await getDb();
    let query = `
      SELECT a.*, s.name AS service_name, sp.display_name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      LEFT JOIN staff_profiles sp ON sp.id = a.staff_id
      WHERE date(a.start_datetime) = ?
        AND a.status NOT IN ('cancelled')
    `;
    const binds: (string | number)[] = [date];

    const seeAll = ["receptionist", "owner", "manager"].includes(user.role);
    if (!seeAll && user.staffProfileId) {
      query += " AND a.staff_id = ?";
      binds.push(user.staffProfileId);
    }

    query += " ORDER BY a.start_datetime ASC";

    const res = await db.prepare(query).bind(...binds).all<{
      id: number;
      service_id: number;
      service_name: string;
      staff_id: number | null;
      staff_name: string | null;
      client_name: string;
      client_email: string | null;
      client_phone: string;
      start_datetime: string;
      end_datetime: string;
      status: string;
      booking_source: string;
      notes: string | null;
    }>();

    return NextResponse.json({ appointments: res.results || [], date });
  } catch {
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}
