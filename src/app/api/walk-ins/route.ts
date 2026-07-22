import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { recordWalkInSchema } from "@/lib/validation";
import { createWalkInAppointment } from "@/lib/walkins";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["stylist", "receptionist", "owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = recordWalkInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid walk-in data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const staffId =
      data.staffId ??
      (user?.role === "stylist" || user?.role === "receptionist"
        ? user.staffProfileId
        : null);

    const result = await createWalkInAppointment({
      serviceId: data.serviceId,
      staffId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startDatetime: data.startDatetime,
      arriveInMinutes: data.arriveInMinutes ?? 0,
      notes: data.notes,
      status: data.status || "confirmed",
      smsOptIn: data.smsOptIn,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record walk-in" }, { status: 500 });
  }
}
