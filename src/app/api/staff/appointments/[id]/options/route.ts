import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppointmentById, listEligibleStaffForService } from "@/lib/appointments";

/** Eligible staff for transferring / reassigning an appointment */
export async function GET(
  _request: Request,
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

    const appt = await getAppointmentById(appointmentId);
    if (!appt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const staff = await listEligibleStaffForService(appt.service_id);
    return NextResponse.json({
      appointment: {
        id: appt.id,
        serviceId: appt.service_id,
        serviceName: appt.service_name,
        staffId: appt.staff_id,
        startDatetime: appt.start_datetime,
        endDatetime: appt.end_datetime,
        status: appt.status,
        bookingSource: appt.booking_source,
        durationMinutes: appt.duration_minutes,
      },
      staff,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load options" }, { status: 500 });
  }
}
