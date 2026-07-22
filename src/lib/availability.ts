import { addMinutes, format, parseISO } from "date-fns";
import { getDb } from "./db";

export type TimeSlot = {
  start: string;
  end: string;
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function getAvailableSlots(opts: {
  staffId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD
}): Promise<TimeSlot[]> {
  const db = await getDb();
  const { staffId, serviceId, date } = opts;

  const service = await db
    .prepare(
      "SELECT duration_minutes, booking_type, is_active FROM services WHERE id = ?",
    )
    .bind(serviceId)
    .first<{ duration_minutes: number; booking_type: string; is_active: number }>();

  if (!service || !service.is_active) return [];

  const holiday = await db
    .prepare("SELECT id FROM salon_holidays WHERE date = ? AND is_closed = 1")
    .bind(date)
    .first();
  if (holiday) return [];

  const dow = parseISO(`${date}T12:00:00`).getDay();
  const availability = await db
    .prepare(
      "SELECT start_time, end_time FROM staff_availability WHERE staff_id = ? AND day_of_week = ?",
    )
    .bind(staffId, dow)
    .all<{ start_time: string; end_time: string }>();

  if (!availability.results?.length) return [];

  const bufferSetting = await db
    .prepare("SELECT value_json FROM site_settings WHERE key = 'booking'")
    .first<{ value_json: string }>();
  const bookingCfg = bufferSetting
    ? (JSON.parse(bufferSetting.value_json) as {
        buffer_minutes?: number;
        slot_minutes?: number;
      })
    : {};
  const buffer = bookingCfg.buffer_minutes ?? 15;
  const step = bookingCfg.slot_minutes ?? 15;
  const duration = service.duration_minutes;

  const appointments = await db
    .prepare(
      `SELECT start_datetime, end_datetime FROM appointments
       WHERE staff_id = ?
         AND status NOT IN ('cancelled', 'no_show')
         AND date(start_datetime) = ?`,
    )
    .bind(staffId, date)
    .all<{ start_datetime: string; end_datetime: string }>();

  const timeOff = await db
    .prepare(
      `SELECT start_datetime, end_datetime FROM staff_time_off
       WHERE (staff_id = ? OR staff_id IS NULL)
         AND date(start_datetime) <= ?
         AND date(end_datetime) >= ?`,
    )
    .bind(staffId, date, date)
    .all<{ start_datetime: string; end_datetime: string }>();

  const busy = [
    ...(appointments.results || []).map((a: { start_datetime: string; end_datetime: string }) => ({
      start: new Date(a.start_datetime).getTime(),
      end: new Date(a.end_datetime).getTime() + buffer * 60_000,
    })),
    ...(timeOff.results || []).map((t: { start_datetime: string; end_datetime: string }) => ({
      start: new Date(t.start_datetime).getTime(),
      end: new Date(t.end_datetime).getTime(),
    })),
  ];

  const slots: TimeSlot[] = [];
  const now = Date.now();

  for (const window of availability.results) {
    let cursor = toMinutes(window.start_time);
    const end = toMinutes(window.end_time);

    while (cursor + duration <= end) {
      const startStr = `${date}T${fromMinutes(cursor)}:00`;
      const endDate = addMinutes(parseISO(startStr), duration);
      const startMs = parseISO(startStr).getTime();
      const endMs = endDate.getTime();

      if (startMs > now) {
        const overlaps = busy.some(
          (b) => startMs < b.end && endMs + buffer * 60_000 > b.start,
        );
        if (!overlaps) {
          slots.push({
            start: startStr,
            end: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
          });
        }
      }

      cursor += step;
    }
  }

  return slots;
}

export async function createAppointmentTransactional(input: {
  serviceId: number;
  staffId: number | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  bookingSource: string;
  notes?: string;
  smsOptIn?: boolean;
}): Promise<{ id: number } | { error: string }> {
  const db = await getDb();

  if (input.staffId && input.bookingSource === "instant") {
    const conflict = await db
      .prepare(
        `SELECT id FROM appointments
         WHERE staff_id = ?
           AND status NOT IN ('cancelled', 'no_show')
           AND start_datetime < ?
           AND end_datetime > ?`,
      )
      .bind(input.staffId, input.endDatetime, input.startDatetime)
      .first();

    if (conflict) {
      return { error: "That time slot was just booked. Please pick another." };
    }
  }

  const result = await db
    .prepare(
      `INSERT INTO appointments
        (service_id, staff_id, client_name, client_email, client_phone,
         start_datetime, end_datetime, status, booking_source, notes, sms_opt_in, sms_opt_in_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.serviceId,
      input.staffId,
      input.clientName,
      input.clientEmail,
      input.clientPhone,
      input.startDatetime,
      input.endDatetime,
      input.status,
      input.bookingSource,
      input.notes || null,
      input.smsOptIn ? 1 : 0,
      input.smsOptIn ? new Date().toISOString() : null,
    )
    .run();

  return { id: Number(result.meta.last_row_id) };
}
