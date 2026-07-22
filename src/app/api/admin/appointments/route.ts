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
      const focusDate = date || null;
      const selectBinds: (string | number)[] = [];
      const joinBinds: (string | number)[] = [];

      let appointmentJoin = "LEFT JOIN appointments a ON a.staff_id = sp.id";
      const joinFilters: string[] = [];
      if (focusDate) {
        joinFilters.push("date(a.start_datetime) = ?");
        joinBinds.push(focusDate);
      }
      if (status) {
        joinFilters.push("a.status = ?");
        joinBinds.push(status);
      }
      if (joinFilters.length) {
        appointmentJoin += ` AND ${joinFilters.join(" AND ")}`;
      }

      // On-day metric: selected day, or all matched rows when "All days"
      const dayCountSql = focusDate
        ? `SUM(CASE WHEN date(a.start_datetime) = ? AND a.status NOT IN ('cancelled') THEN 1 ELSE 0 END)`
        : `SUM(CASE WHEN a.id IS NOT NULL AND a.status NOT IN ('cancelled') THEN 1 ELSE 0 END)`;
      if (focusDate) selectBinds.push(focusDate);

      const staffRes = await db
        .prepare(
          `SELECT sp.id, sp.display_name,
            ${dayCountSql} AS day_count,
            SUM(CASE WHEN a.start_datetime >= datetime('now', 'localtime')
              AND a.status IN ('pending', 'confirmed', 'in_progress') THEN 1 ELSE 0 END) AS upcoming_count,
            SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
            SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_count,
            SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
            SUM(CASE WHEN a.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
            COUNT(a.id) AS total_count
           FROM staff_profiles sp
           ${appointmentJoin}
           WHERE sp.is_bookable = 1
           GROUP BY sp.id, sp.display_name
           ORDER BY sp.display_name`,
        )
        .bind(...selectBinds, ...joinBinds)
        .all<{
          id: number;
          display_name: string;
          day_count: number;
          upcoming_count: number;
          pending_count: number;
          confirmed_count: number;
          completed_count: number;
          in_progress_count: number;
          total_count: number;
        }>();

      // Status counts for chips (respect selected day when set)
      let statusQuery = `SELECT status, COUNT(*) AS count FROM appointments WHERE 1=1`;
      const statusBinds: string[] = [];
      if (focusDate) {
        statusQuery += " AND date(start_datetime) = ?";
        statusBinds.push(focusDate);
      }
      statusQuery += " GROUP BY status";
      const statusRes = await db
        .prepare(statusQuery)
        .bind(...statusBinds)
        .all<{ status: string; count: number }>();

      // Next 7 days (today + 6) with appointment counts for day strip
      const dayCountsRes = await db
        .prepare(
          `SELECT date(start_datetime) AS day, COUNT(*) AS count
           FROM appointments
           WHERE date(start_datetime) >= date('now', 'localtime')
             AND date(start_datetime) <= date('now', 'localtime', '+6 days')
           GROUP BY date(start_datetime)`,
        )
        .all<{ day: string; count: number }>();

      return NextResponse.json({
        team: (staffRes.results || []).map((row) => ({
          ...row,
          today_count: row.day_count,
        })),
        statusCounts: Object.fromEntries(
          (statusRes.results || []).map((r) => [r.status, r.count]),
        ),
        dayCounts: Object.fromEntries(
          (dayCountsRes.results || []).map((r) => [r.day, r.count]),
        ),
        focusDate,
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
