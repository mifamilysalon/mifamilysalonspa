import { addMinutes, format } from "date-fns";
import { createAppointmentTransactional } from "@/lib/availability";
import { getDb } from "@/lib/db";

export function roundToNearestMinutes(date: Date, step = 5): Date {
  const ms = step * 60 * 1000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

export function walkInStartIso(arriveInMinutes = 0): string {
  const start = roundToNearestMinutes(addMinutes(new Date(), arriveInMinutes), 5);
  return format(start, "yyyy-MM-dd'T'HH:mm:ss");
}

export async function createWalkInAppointment(input: {
  serviceId: number;
  staffId?: number | null;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  startDatetime?: string;
  arriveInMinutes?: number;
  notes?: string;
  status?: "confirmed" | "in_progress";
  smsOptIn?: boolean;
}): Promise<
  | { id: number; status: string; bookingSource: "walk_in"; startDatetime: string; endDatetime: string; serviceName: string }
  | { error: string; status: number }
> {
  const db = await getDb();
  const service = await db
    .prepare(
      "SELECT id, name, duration_minutes, is_active FROM services WHERE id = ?",
    )
    .bind(input.serviceId)
    .first<{
      id: number;
      name: string;
      duration_minutes: number;
      is_active: number;
    }>();

  if (!service || !service.is_active) {
    return { error: "Service not found", status: 404 };
  }

  if (input.staffId) {
    const staff = await db
      .prepare("SELECT id FROM staff_profiles WHERE id = ? AND is_bookable = 1")
      .bind(input.staffId)
      .first();
    if (!staff) {
      return { error: "Staff not found", status: 400 };
    }
  }

  const startDatetime =
    input.startDatetime || walkInStartIso(input.arriveInMinutes ?? 0);
  const endDatetime = format(
    addMinutes(new Date(startDatetime), service.duration_minutes),
    "yyyy-MM-dd'T'HH:mm:ss",
  );
  const status = input.status || "confirmed";

  const result = await createAppointmentTransactional({
    serviceId: input.serviceId,
    staffId: input.staffId ?? null,
    clientName: input.clientName,
    clientEmail: input.clientEmail?.trim() || null,
    clientPhone: input.clientPhone,
    startDatetime,
    endDatetime,
    status,
    bookingSource: "walk_in",
    notes: input.notes,
    smsOptIn: input.smsOptIn,
  });

  if ("error" in result) {
    return { error: result.error, status: 409 };
  }

  return {
    id: result.id,
    status,
    bookingSource: "walk_in",
    startDatetime,
    endDatetime,
    serviceName: service.name,
  };
}
