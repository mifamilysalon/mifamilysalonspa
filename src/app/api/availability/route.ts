import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = Number(searchParams.get("staffId"));
    const serviceId = Number(searchParams.get("serviceId"));
    const date = searchParams.get("date");

    if (!Number.isFinite(staffId) || staffId <= 0) {
      return NextResponse.json({ error: "staffId is required" }, { status: 400 });
    }
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const slots = await getAvailableSlots({ staffId, serviceId, date });
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
