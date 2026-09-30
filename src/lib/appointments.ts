import type { SessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { format, parseISO } from "date-fns";
import { notifyAppointmentUpdated } from "@/lib/notifications";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentRow = {
  id: number;
  service_id: number;
  staff_id: number | null;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  booking_source: string;
  notes: string | null;
  duration_minutes: number;
  service_name: string;
  staff_name?: string | null;
};

export type ManageAppointmentInput = {
  status?: AppointmentStatus;
  notes?: string;
  /** Reassign / transfer to another staff member (null = unassign to open pool) */
  staffId?: number | null;
  /** Claim unassigned request for the acting stylist */
  claim?: boolean;
  /** Confirm while assigning to self (staff) */
  claimAndConfirm?: boolean;
  /** New start ISO datetime; end is recomputed from service duration */
  startDatetime?: string;
  /** Optional reason shown in history (e.g. overwhelmed / client request) */
  reason?: string;
  /** When true, skip hard conflict check (admin override) */
  force?: boolean;
};

export type ManageAppointmentResult =
  | { ok: true; appointment: AppointmentRow }
  | { ok: false; error: string; status?: number };

function addMinutesIso(startIso: string, minutes: number): string {
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid datetime");
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export async function getAppointmentById(
  appointmentId: number,
): Promise<AppointmentRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(
        `SELECT a.id, a.service_id, a.staff_id, a.client_name, a.client_email, a.client_phone,
                a.start_datetime, a.end_datetime,
                a.status, a.booking_source, a.notes, s.duration_minutes, s.name AS service_name,
                sp.display_name AS staff_name
         FROM appointments a
         JOIN services s ON s.id = a.service_id
         LEFT JOIN staff_profiles sp ON sp.id = a.staff_id
         WHERE a.id = ?`,
      )
      .bind(appointmentId)
      .first<AppointmentRow>()) || null
  );
}

async function staffCanDoService(staffId: number, serviceId: number): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT 1 AS ok
       FROM staff_profiles sp
       JOIN staff_services ss ON ss.staff_id = sp.id
       WHERE sp.id = ? AND sp.is_bookable = 1 AND ss.service_id = ?`,
    )
    .bind(staffId, serviceId)
    .first();
  return !!row;
}

function formatWhen(iso: string): string {
  try {
    return format(parseISO(iso), "EEE, MMM d 'at' h:mm a");
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

async function notifyGuestOfAppointmentChanges(input: {
  before: AppointmentRow;
  after: AppointmentRow;
  eventTypes: string[];
}): Promise<void> {
  const guestEvents = input.eventTypes.filter((t) => t !== "notes");
  if (guestEvents.length === 0) return;
  if (!input.after.client_email?.trim()) return;

  const changeLines: string[] = [];
  const { before, after } = input;

  if (
    guestEvents.some((t) =>
      ["reassign", "claim", "claim_self", "unassign"].includes(t),
    ) &&
    before.staff_id !== after.staff_id
  ) {
    const prev = before.staff_name ?? (before.staff_id ? "previous stylist" : "unassigned");
    const next =
      after.staff_name ??
      (after.staff_id ? "your stylist" : "our team (stylist to be confirmed)");
    changeLines.push(`Stylist: ${prev} → ${next}`);
  }

  if (guestEvents.includes("reschedule") && before.start_datetime !== after.start_datetime) {
    changeLines.push(
      `Time: ${formatWhen(before.start_datetime)} → ${formatWhen(after.start_datetime)}`,
    );
  }

  if (guestEvents.includes("status_change") && before.status !== after.status) {
    changeLines.push(
      `Status: ${statusLabel(before.status)} → ${statusLabel(after.status)}`,
    );
  }

  if (changeLines.length === 0) return;

  const emailResult = await notifyAppointmentUpdated({
    bookingId: after.id,
    clientName: after.client_name,
    clientEmail: after.client_email,
    serviceName: after.service_name,
    when: formatWhen(after.start_datetime),
    startIso: after.start_datetime,
    durationMinutes: after.duration_minutes,
    staffName: after.staff_name,
    changeLines,
  });

  if (!emailResult.ok) {
    console.error(
      "Appointment update email failed",
      after.id,
      emailResult.detail,
    );
  }
}

async function hasStaffConflict(input: {
  staffId: number;
  startDatetime: string;
  endDatetime: string;
  excludeAppointmentId: number;
}): Promise<boolean> {
  const db = await getDb();
  const conflict = await db
    .prepare(
      `SELECT id FROM appointments
       WHERE staff_id = ?
         AND id != ?
         AND status NOT IN ('cancelled', 'no_show', 'completed')
         AND start_datetime < ?
         AND end_datetime > ?`,
    )
    .bind(
      input.staffId,
      input.excludeAppointmentId,
      input.endDatetime,
      input.startDatetime,
    )
    .first();
  return !!conflict;
}

function canSeeAll(user: SessionUser): boolean {
  return ["receptionist", "owner", "manager"].includes(user.role);
}

function canManageAppointment(user: SessionUser, appt: AppointmentRow): boolean {
  if (canSeeAll(user)) return true;
  if (user.role !== "stylist" || !user.staffProfileId) return false;
  // Own appointments, or unassigned open pool (claim / confirm)
  return appt.staff_id === user.staffProfileId || appt.staff_id === null;
}

async function logEvent(input: {
  appointmentId: number;
  user: SessionUser;
  eventType: string;
  fromStaffId?: number | null;
  toStaffId?: number | null;
  fromStatus?: string | null;
  toStatus?: string | null;
  fromStart?: string | null;
  toStart?: string | null;
  fromEnd?: string | null;
  toEnd?: string | null;
  note?: string | null;
}) {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO appointment_events
        (appointment_id, actor_user_id, actor_role, event_type,
         from_staff_id, to_staff_id, from_status, to_status,
         from_start, to_start, from_end, to_end, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.appointmentId,
      input.user.id,
      input.user.role,
      input.eventType,
      input.fromStaffId ?? null,
      input.toStaffId ?? null,
      input.fromStatus ?? null,
      input.toStatus ?? null,
      input.fromStart ?? null,
      input.toStart ?? null,
      input.fromEnd ?? null,
      input.toEnd ?? null,
      input.note ?? null,
    )
    .run();
}

/**
 * Unified appointment management for staff + admin:
 * status changes, claim, transfer/reassign, unassign, reschedule.
 */
export async function manageAppointment(
  appointmentId: number,
  user: SessionUser,
  input: ManageAppointmentInput,
): Promise<ManageAppointmentResult> {
  const appt = await getAppointmentById(appointmentId);
  if (!appt) return { ok: false, error: "Appointment not found", status: 404 };

  if (!canManageAppointment(user, appt)) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const closed = ["cancelled", "completed", "no_show"].includes(appt.status);
  const wantsStructuralChange =
    input.staffId !== undefined ||
    input.claim ||
    input.claimAndConfirm ||
    !!input.startDatetime;

  if (closed && wantsStructuralChange) {
    return {
      ok: false,
      error: "Cannot reassign or reschedule a completed, cancelled, or no-show appointment.",
      status: 400,
    };
  }

  let nextStaffId = appt.staff_id;
  let nextStatus = appt.status;
  let nextStart = appt.start_datetime;
  let nextEnd = appt.end_datetime;
  let nextNotes = appt.notes;
  const eventTypes: string[] = [];
  const transferNote = input.reason?.trim() || null;

  // --- Claim / claim+confirm ---
  if (input.claim || input.claimAndConfirm) {
    if (!user.staffProfileId) {
      return { ok: false, error: "Only stylists can claim appointments.", status: 400 };
    }
    if (appt.staff_id !== null && appt.staff_id !== user.staffProfileId) {
      return {
        ok: false,
        error: "This request is already assigned to someone else. Ask admin to reassign.",
        status: 409,
      };
    }
    const eligible = await staffCanDoService(user.staffProfileId, appt.service_id);
    if (!eligible) {
      return {
        ok: false,
        error: "You are not set up for this service. Ask a manager to update staff services.",
        status: 400,
      };
    }
    nextStaffId = user.staffProfileId;
    eventTypes.push(appt.staff_id === null ? "claim" : "claim_self");
    if (input.claimAndConfirm) {
      nextStatus = "confirmed";
      eventTypes.push("status_change");
    }
  }

  // --- Explicit staff reassignment / transfer / unassign ---
  if (input.staffId !== undefined && !input.claim && !input.claimAndConfirm) {
    const target = input.staffId;

    // Stylists may only transfer their own work to someone else, or unassign their pending claims
    if (user.role === "stylist") {
      if (appt.staff_id !== user.staffProfileId) {
        return {
          ok: false,
          error: "You can only transfer appointments assigned to you.",
          status: 401,
        };
      }
      if (target === user.staffProfileId) {
        return { ok: false, error: "Already assigned to you.", status: 400 };
      }
    }

    if (target !== null) {
      const eligible = await staffCanDoService(target, appt.service_id);
      if (!eligible) {
        return {
          ok: false,
          error: "Selected staff cannot perform this service.",
          status: 400,
        };
      }
    }

    if (target !== appt.staff_id) {
      nextStaffId = target;
      eventTypes.push(target === null ? "unassign" : "reassign");
    }
  }

  // --- Reschedule ---
  if (input.startDatetime) {
    let end: string;
    try {
      end = addMinutesIso(input.startDatetime, appt.duration_minutes);
    } catch {
      return { ok: false, error: "Invalid start datetime.", status: 400 };
    }
    if (input.startDatetime !== appt.start_datetime) {
      nextStart = input.startDatetime;
      nextEnd = end;
      eventTypes.push("reschedule");
    }
  }

  // --- Status ---
  if (input.status && input.status !== nextStatus) {
    // Confirming an unassigned request: require assignment first unless claiming
    if (
      input.status === "confirmed" &&
      nextStaffId === null &&
      !input.claim &&
      !input.claimAndConfirm
    ) {
      // Allow confirm without staff for receptionist/admin (open desk), but stylists must claim
      if (user.role === "stylist") {
        return {
          ok: false,
          error: "Claim this request (assign to yourself) before confirming.",
          status: 400,
        };
      }
    }
    nextStatus = input.status;
    if (!eventTypes.includes("status_change")) eventTypes.push("status_change");
  }

  // --- Notes ---
  if (input.notes !== undefined) {
    nextNotes = input.notes;
    eventTypes.push("notes");
  }

  if (
    nextStaffId === appt.staff_id &&
    nextStatus === appt.status &&
    nextStart === appt.start_datetime &&
    nextEnd === appt.end_datetime &&
    nextNotes === appt.notes
  ) {
    return { ok: false, error: "No changes provided.", status: 400 };
  }

  // Force override only for owner/manager
  if (input.force && !["owner", "manager"].includes(user.role)) {
    return { ok: false, error: "Only managers can force through conflicts.", status: 401 };
  }

  // --- Conflict check when staff + time are set ---
  const shouldCheckConflict =
    nextStaffId !== null &&
    !input.force &&
    appt.booking_source !== "walk_in" &&
    !["cancelled", "no_show", "completed"].includes(nextStatus) &&
    (nextStaffId !== appt.staff_id ||
      nextStart !== appt.start_datetime ||
      nextEnd !== appt.end_datetime);

  if (shouldCheckConflict && nextStaffId !== null) {
    const conflict = await hasStaffConflict({
      staffId: nextStaffId,
      startDatetime: nextStart,
      endDatetime: nextEnd,
      excludeAppointmentId: appt.id,
    });
    if (conflict) {
      return {
        ok: false,
        error:
          "That staff member already has an overlapping appointment. Pick another person or time, or use Force (admin only).",
        status: 409,
      };
    }
  }

  const db = await getDb();
  await db
    .prepare(
      `UPDATE appointments
       SET staff_id = ?, status = ?, start_datetime = ?, end_datetime = ?,
           notes = ?
       WHERE id = ?`,
    )
    .bind(nextStaffId, nextStatus, nextStart, nextEnd, nextNotes, appt.id)
    .run();

  const primaryEvent =
    eventTypes.find((t) => t === "reassign" || t === "claim" || t === "unassign") ||
    eventTypes.find((t) => t === "reschedule") ||
    eventTypes[0] ||
    "update";

  await logEvent({
    appointmentId: appt.id,
    user,
    eventType: primaryEvent,
    fromStaffId: appt.staff_id,
    toStaffId: nextStaffId,
    fromStatus: appt.status,
    toStatus: nextStatus,
    fromStart: appt.start_datetime,
    toStart: nextStart,
    fromEnd: appt.end_datetime,
    toEnd: nextEnd,
    note: transferNote,
  });

  // Log secondary events when multiple actions in one request
  for (const t of eventTypes.filter((x) => x !== primaryEvent && x !== "notes")) {
    await logEvent({
      appointmentId: appt.id,
      user,
      eventType: t,
      fromStaffId: appt.staff_id,
      toStaffId: nextStaffId,
      fromStatus: appt.status,
      toStatus: nextStatus,
      fromStart: appt.start_datetime,
      toStart: nextStart,
      fromEnd: appt.end_datetime,
      toEnd: nextEnd,
      note: transferNote,
    });
  }

  const updated = await getAppointmentById(appt.id);
  if (!updated) return { ok: false, error: "Not found after update", status: 500 };

  await notifyGuestOfAppointmentChanges({
    before: appt,
    after: updated,
    eventTypes,
  });

  return { ok: true, appointment: updated };
}

export async function listEligibleStaffForService(serviceId: number) {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT sp.id, sp.display_name
       FROM staff_profiles sp
       JOIN staff_services ss ON ss.staff_id = sp.id
       WHERE sp.is_bookable = 1 AND ss.service_id = ?
       ORDER BY sp.display_name`,
    )
    .bind(serviceId)
    .all<{ id: number; display_name: string }>();
  return res.results || [];
}
