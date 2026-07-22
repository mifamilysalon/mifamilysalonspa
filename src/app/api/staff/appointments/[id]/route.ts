import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { updateAppointmentStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["stylist", "receptionist", "owner", "manager"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const appointmentId = Number(id);
    if (!Number.isFinite(appointmentId) || appointmentId <= 0) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateAppointmentStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
    }

    const db = await getDb();
    const appointment = await db
      .prepare("SELECT id, staff_id FROM appointments WHERE id = ?")
      .bind(appointmentId)
      .first<{ id: number; staff_id: number | null }>();

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const seeAll = ["receptionist", "owner", "manager"].includes(user.role);
    if (
      !seeAll &&
      user.staffProfileId &&
      appointment.staff_id !== user.staffProfileId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .prepare("UPDATE appointments SET status = ?, notes = COALESCE(?, notes) WHERE id = ?")
      .bind(parsed.data.status, parsed.data.notes ?? null, appointmentId)
      .run();

    return NextResponse.json({ ok: true, status: parsed.data.status });
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
