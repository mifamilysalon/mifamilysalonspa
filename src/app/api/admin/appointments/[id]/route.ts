import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { manageAppointment } from "@/lib/appointments";
import { updateAppointmentStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
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
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update" },
        { status: 400 },
      );
    }

    const result = await manageAppointment(appointmentId, user!, parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: result.appointment.status,
      staffId: result.appointment.staff_id,
      startDatetime: result.appointment.start_datetime,
      endDatetime: result.appointment.end_datetime,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
