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
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const staffId = searchParams.get("staffId");
    const summary = searchParams.get("summary") === "1";

    const db = await getDb();

    if (summary) {
      const staffRes = await db
        .prepare(
          `SELECT sp.id, sp.display_name,
            SUM(CASE WHEN date(a.start_datetime) = date('now', 'localtime')
              AND a.status NOT IN ('cancelled') THEN 1 ELSE 0 END) AS today_count,
            SUM(CASE WHEN a.start_datetime >= datetime('now', 'localtime')
              AND a.status IN ('pending', 'confirmed', 'in_progress') THEN 1 ELSE 0 END) AS upcoming_count,
            SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
            SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
            COUNT(a.id) AS total_count
           FROM staff_profiles sp
           LEFT JOIN appointments a ON a.staff_id = sp.id
           WHERE sp.is_bookable = 1
           GROUP BY sp.id, sp.display_name
           ORDER BY sp.display_name`,
        )
        .all<{
          id: number;
          display_name: string;
          today_count: number;
          upcoming_count: number;
          pending_count: number;
          completed_count: number;
          total_count: number;
        }>();

      const statusRes = await db
        .prepare(
          `SELECT status, COUNT(*) AS count
           FROM appointments
           GROUP BY status`,
        )
        .all<{ status: string; count: number }>();

      return NextResponse.json({
        team: staffRes.results || [],
        statusCounts: Object.fromEntries(
          (statusRes.results || []).map((r) => [r.status, r.count]),
        ),
      });
    }

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
    if (from) {
      query += " AND date(a.start_datetime) >= ?";
      binds.push(from);
    }
    if (to) {
      query += " AND date(a.start_datetime) <= ?";
      binds.push(to);
    }
    if (staffId) {
      query += " AND a.staff_id = ?";
      binds.push(Number(staffId));
    }

    query += " ORDER BY a.start_datetime ASC LIMIT 400";

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
