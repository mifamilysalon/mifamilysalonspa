import { format, parseISO } from "date-fns";
import { getEnv } from "./db";
import {
  bookingAckText,
  bookingConfirmationText,
  sendEmail,
  transactionalEmailHeaders,
  type EmailAttachment,
} from "./email";
import {
  appointmentConfirmedHtml,
  appointmentRequestHtml,
  appointmentUpdatedHtml,
  formatBookingId,
  leaveReviewText,
} from "./email-templates";
import {
  buildAppointmentIcs,
  icsToBase64,
} from "./calendar";
import { SITE_ADMIN_EMAIL } from "./seo";

function appointmentCalendarAttachment(opts: {
  bookingId: number;
  bookingRef: string;
  serviceName: string;
  startIso?: string;
  durationMinutes?: number;
  address: string;
  phone: string;
  stylistName: string;
}): EmailAttachment | null {
  if (!opts.startIso || !opts.durationMinutes || opts.durationMinutes <= 0) {
    return null;
  }
  const ics = buildAppointmentIcs({
    bookingId: opts.bookingId,
    bookingRef: opts.bookingRef,
    title: `${opts.serviceName} at Family Hair Salon`,
    startIso: opts.startIso,
    durationMinutes: opts.durationMinutes,
    location: opts.address,
    details: `Booking ${opts.bookingRef} with ${opts.stylistName}. Questions? Call ${opts.phone}.`,
  });
  if (!ics) return null;
  return {
    filename: `${opts.bookingRef}.ics`,
    content: icsToBase64(ics),
    type: "text/calendar; charset=utf-8; method=PUBLISH",
    disposition: "attachment",
  };
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  const env = await getEnv();
  const sid = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from = env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from || !to) {
    console.log("[sms:skipped]", to, body);
    return false;
  }

  try {
    const auth = btoa(`${sid}:${token}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    );
    return res.ok;
  } catch (err) {
    console.error("SMS failed", err);
    return false;
  }
}

function splitWhen(when: string, startIso?: string): { date: string; time: string } {
  if (startIso) {
    try {
      const d = parseISO(startIso);
      if (!Number.isNaN(d.getTime())) {
        return {
          date: format(d, "EEE, MMM d"),
          time: format(d, "h:mm a"),
        };
      }
    } catch {
      /* fall through */
    }
  }
  const parts = when.split(/\s+at\s+/i);
  if (parts.length === 2) return { date: parts[0], time: parts[1] };
  return { date: when, time: "" };
}

function durationLabel(minutes?: number): string {
  if (!minutes || minutes <= 0) return "Ask at desk";
  return `About ${minutes} min`;
}

export async function notifyBookingConfirmed(opts: {
  bookingId: number;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  serviceName: string;
  when: string;
  startIso?: string;
  durationMinutes?: number;
  staffName?: string;
  smsOptIn?: boolean;
  smsEnabled?: boolean;
}): Promise<void> {
  const env = await getEnv();
  const address = env.SALON_ADDRESS || "34777 Grand River Ave, Farmington, MI 48335";
  const phone = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const { date, time } = splitWhen(opts.when, opts.startIso);
  const bookingRef = formatBookingId(opts.bookingId);
  const stylist = opts.staffName || "Our team";

  const text = [
    bookingConfirmationText({
      clientName: opts.clientName,
      serviceName: opts.serviceName,
      when: opts.when,
      staffName: opts.staffName,
      address,
      phone,
    }),
    "",
    `Booking reference: ${bookingRef}`,
  ].join("\n");

  if (opts.clientEmail) {
    const attachment = appointmentCalendarAttachment({
      bookingId: opts.bookingId,
      bookingRef,
      serviceName: opts.serviceName,
      startIso: opts.startIso,
      durationMinutes: opts.durationMinutes,
      address,
      phone,
      stylistName: stylist,
    });
    const sent = await sendEmail(
      {
        to: opts.clientEmail,
        subject: `${opts.clientName.split(/\s+/)[0] || "Hi"}, you're booked — ${opts.serviceName} (${bookingRef})`,
        text,
        html: appointmentConfirmedHtml({
          bookingId: opts.bookingId,
          clientName: opts.clientName,
          serviceName: opts.serviceName,
          appointmentDate: date,
          appointmentTime: time || opts.when,
          durationLabel: durationLabel(opts.durationMinutes),
          stylistName: stylist,
          address,
          phone,
          startIso: opts.startIso,
          durationMinutes: opts.durationMinutes,
        }),
        attachments: attachment ? [attachment] : undefined,
        headers: transactionalEmailHeaders("appointment"),
      },
      { kind: "appointment" },
    );
    if (!sent.ok) {
      console.error("booking confirmation email failed", opts.clientEmail, sent.detail);
    }
  }

  if (opts.smsEnabled && opts.smsOptIn) {
    await sendSms(
      opts.clientPhone,
      `Confirmed: ${opts.serviceName} on ${opts.when}. Ref ${bookingRef}. Family Hair Salon ${phone}`,
    );
  }
}

export async function notifyBookingRequest(opts: {
  bookingId: number;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  serviceName: string;
  when: string;
  startIso?: string;
  durationMinutes?: number;
  smsOptIn?: boolean;
  smsEnabled?: boolean;
}): Promise<void> {
  const env = await getEnv();
  const phone = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const address = env.SALON_ADDRESS || "34777 Grand River Ave, Farmington, MI 48335";
  const staffEmail = SITE_ADMIN_EMAIL;
  const { date, time } = splitWhen(opts.when, opts.startIso);
  const bookingRef = formatBookingId(opts.bookingId);

  if (opts.clientEmail) {
    const sent = await sendEmail(
      {
        to: opts.clientEmail,
        subject: `${opts.clientName.split(/\s+/)[0] || "Hi"}, we got your appointment request (${bookingRef})`,
        text: [
          bookingAckText({
            clientName: opts.clientName,
            serviceName: opts.serviceName,
            when: opts.when,
            phone,
          }),
          "",
          `Booking reference: ${bookingRef}`,
        ].join("\n"),
        html: appointmentRequestHtml({
          bookingId: opts.bookingId,
          clientName: opts.clientName,
          serviceName: opts.serviceName,
          appointmentDate: date,
          appointmentTime: time || opts.when,
          durationLabel: durationLabel(opts.durationMinutes),
          stylistName: "To be confirmed",
          address,
          phone,
          startIso: opts.startIso,
          durationMinutes: opts.durationMinutes,
        }),
        headers: transactionalEmailHeaders("appointment"),
      },
      { kind: "appointment" },
    );
    if (!sent.ok) {
      console.error("booking request email failed", opts.clientEmail, sent.detail);
    }
  }

  await sendEmail(
    {
      to: staffEmail,
      subject: `New booking request ${bookingRef}: ${opts.clientName}`,
      text: `${opts.clientName} requested ${opts.serviceName} on ${opts.when}. Phone: ${opts.clientPhone}. Ref: ${bookingRef}`,
    },
    { kind: "staff" },
  );

  if (opts.smsEnabled && opts.smsOptIn) {
    await sendSms(
      opts.clientPhone,
      `Request received for ${opts.serviceName} on ${opts.when}. Ref ${bookingRef}. We will confirm soon. Family Hair Salon`,
    );
  }
}

export async function notifyAppointmentUpdated(opts: {
  bookingId: number;
  clientName: string;
  clientEmail?: string | null;
  serviceName: string;
  when: string;
  startIso?: string;
  durationMinutes?: number;
  staffName?: string | null;
  changeLines: string[];
}): Promise<{ ok: boolean; detail?: string }> {
  if (!opts.clientEmail?.trim()) {
    return { ok: false, detail: "no client email" };
  }

  const env = await getEnv();
  const address =
    env.SALON_ADDRESS || "34777 Grand River Ave, Farmington, MI 48335";
  const phone = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const { date, time } = splitWhen(opts.when, opts.startIso);
  const bookingRef = formatBookingId(opts.bookingId);

  const text = [
    `Hi ${opts.clientName.trim().split(/\s+/)[0] || opts.clientName},`,
    "",
    `Just a quick note — your appointment details changed.`,
    "",
    ...opts.changeLines.map((line) => `- ${line}`),
    "",
    `Service: ${opts.serviceName}`,
    opts.staffName ? `With: ${opts.staffName}` : "Stylist: to be confirmed",
    `When: ${opts.when}`,
    `Where: ${address}`,
    `Booking reference: ${bookingRef}`,
    "",
    "We've attached an updated calendar invite so you can refresh the reminder on your phone.",
    `Questions? Call ${phone} — happy to help.`,
    "",
    leaveReviewText(),
    "",
    "Family Hair Salon & Wellness Spa",
  ].join("\n");

  const attachment = appointmentCalendarAttachment({
    bookingId: opts.bookingId,
    bookingRef,
    serviceName: opts.serviceName,
    startIso: opts.startIso,
    durationMinutes: opts.durationMinutes,
    address,
    phone,
    stylistName: opts.staffName || "Our team",
  });

  return sendEmail(
    {
      to: opts.clientEmail.trim(),
      subject: `${opts.clientName.split(/\s+/)[0] || "Hi"}, your visit was updated (${bookingRef})`,
      text,
      html: appointmentUpdatedHtml({
        bookingId: opts.bookingId,
        clientName: opts.clientName,
        serviceName: opts.serviceName,
        appointmentDate: date,
        appointmentTime: time || opts.when,
        durationLabel: durationLabel(opts.durationMinutes),
        stylistName: opts.staffName || "To be confirmed",
        address,
        phone,
        startIso: opts.startIso,
        durationMinutes: opts.durationMinutes,
        changeLines: opts.changeLines,
      }),
      attachments: attachment ? [attachment] : undefined,
      headers: transactionalEmailHeaders("appointment"),
    },
    { kind: "appointment" },
  );
}
