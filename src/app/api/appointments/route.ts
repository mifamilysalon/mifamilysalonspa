import { addMinutes, format, parseISO } from "date-fns";
import { NextResponse } from "next/server";
import {
  createAppointmentTransactional,
} from "@/lib/availability";
import { getDb } from "@/lib/db";
import {
  notifyBookingConfirmed,
  notifyBookingRequest,
} from "@/lib/notifications";
import { getSmsSettings } from "@/lib/site";
import { bookAppointmentSchema } from "@/lib/validation";
import { createWalkInAppointment } from "@/lib/walkins";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your booking details and try again." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const smsSettings = await getSmsSettings();
    const clientEmail = data.clientEmail?.trim() || null;

    if (data.mode === "walk_in") {
      const result = await createWalkInAppointment({
        serviceId: data.serviceId,
        staffId: data.staffId,
        clientName: data.clientName,
        clientEmail,
        clientPhone: data.clientPhone,
        startDatetime: data.startDatetime,
        arriveInMinutes: data.arriveInMinutes ?? 0,
        notes: data.notes,
        status: "confirmed",
        smsOptIn: data.smsOptIn,
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      const when = format(parseISO(result.startDatetime), "EEE, MMM d 'at' h:mm a");
      await notifyBookingConfirmed({
        clientName: data.clientName,
        clientEmail,
        clientPhone: data.clientPhone,
        serviceName: result.serviceName,
        when,
        smsOptIn: data.smsOptIn,
        smsEnabled: smsSettings.enabled,
      });

      return NextResponse.json(
        {
          id: result.id,
          status: result.status,
          bookingSource: "walk_in",
          startDatetime: result.startDatetime,
        },
        { status: 201 },
      );
    }

    const db = await getDb();

    const service = await db
      .prepare(
        "SELECT id, name, duration_minutes, booking_type, is_active FROM services WHERE id = ?",
      )
      .bind(data.serviceId)
      .first<{
        id: number;
        name: string;
        duration_minutes: number;
        booking_type: "instant" | "request";
        is_active: number;
      }>();

    if (!service || !service.is_active) {
      return NextResponse.json(
        { error: "We couldn't find that service. Please choose another service." },
        { status: 404 },
      );
    }

    if (service.booking_type === "instant") {
      if (!data.staffId) {
        return NextResponse.json({ error: "Staff is required" }, { status: 400 });
      }

      const endDatetime = format(
        addMinutes(parseISO(data.startDatetime!), service.duration_minutes),
        "yyyy-MM-dd'T'HH:mm:ss",
      );

      const result = await createAppointmentTransactional({
        serviceId: data.serviceId,
        staffId: data.staffId,
        clientName: data.clientName,
        clientEmail,
        clientPhone: data.clientPhone,
        startDatetime: data.startDatetime!,
        endDatetime,
        status: "confirmed",
        bookingSource: "instant",
        notes: data.notes,
        smsOptIn: data.smsOptIn,
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }

      const staff = await db
        .prepare("SELECT display_name FROM staff_profiles WHERE id = ?")
        .bind(data.staffId)
        .first<{ display_name: string }>();

      const when = format(parseISO(data.startDatetime!), "EEE, MMM d 'at' h:mm a");

      await notifyBookingConfirmed({
        clientName: data.clientName,
        clientEmail,
        clientPhone: data.clientPhone,
        serviceName: service.name,
        when,
        staffName: staff?.display_name,
        smsOptIn: data.smsOptIn,
        smsEnabled: smsSettings.enabled,
      });

      return NextResponse.json(
        { id: result.id, status: "confirmed", bookingSource: "instant" },
        { status: 201 },
      );
    }

    const endDatetime = format(
      addMinutes(parseISO(data.startDatetime!), service.duration_minutes),
      "yyyy-MM-dd'T'HH:mm:ss",
    );

    const result = await createAppointmentTransactional({
      serviceId: data.serviceId,
      staffId: data.staffId ?? null,
      clientName: data.clientName,
      clientEmail,
      clientPhone: data.clientPhone,
      startDatetime: data.startDatetime!,
      endDatetime,
      status: "pending",
      bookingSource: "request",
      notes: data.notes,
      smsOptIn: data.smsOptIn,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const when = format(parseISO(data.startDatetime!), "EEE, MMM d 'at' h:mm a");

    await notifyBookingRequest({
      clientName: data.clientName,
      clientEmail,
      clientPhone: data.clientPhone,
      serviceName: service.name,
      when,
      smsOptIn: data.smsOptIn,
      smsEnabled: smsSettings.enabled,
    });

    return NextResponse.json(
      { id: result.id, status: "pending", bookingSource: "request" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
