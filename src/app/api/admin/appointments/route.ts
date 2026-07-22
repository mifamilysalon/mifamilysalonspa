import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const db = await getDb();
    let query = `
      SELECT a.*, s.name AS service_name, sp.display_name AS staff_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      LEFT JOIN staff_profiles sp ON sp.id = a.staff_id
      WHERE 1=1
    `;
    const binds: (string | number)[] = [];

    if (status) {
      query += " AND a.status = ?";
      binds.push(status);
    }
    if (date) {
      query += " AND date(a.start_datetime) = ?";
      binds.push(date);
    }

    query += " ORDER BY a.start_datetime DESC LIMIT 200";

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
      sms_opt_in: number;
      created_at: string;
    }>();

    return NextResponse.json({ appointments: res.results || [] });
  } catch {
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 });
  }
}
