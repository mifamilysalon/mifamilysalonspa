import { getEnv } from "./db";
import {
  bookingAckText,
  bookingConfirmationText,
  sendEmail,
} from "./email";
import { SITE_ADMIN_EMAIL } from "./seo";

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

export async function notifyBookingConfirmed(opts: {
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  serviceName: string;
  when: string;
  staffName?: string;
  smsOptIn?: boolean;
  smsEnabled?: boolean;
}): Promise<void> {
  const env = await getEnv();
  const address = env.SALON_ADDRESS || "34777 Grand River Ave, Farmington, MI 48335";
  const phone = env.SALON_PHONE_PRIMARY || "(248) 474-6520";

  const text = bookingConfirmationText({
    clientName: opts.clientName,
    serviceName: opts.serviceName,
    when: opts.when,
    staffName: opts.staffName,
    address,
    phone,
  });

  if (opts.clientEmail) {
    const sent = await sendEmail(
      {
        to: opts.clientEmail,
        subject: "Appointment confirmed - Family Hair Salon",
        text,
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
      `Confirmed: ${opts.serviceName} on ${opts.when}. Family Hair Salon ${phone}`,
    );
  }
}

export async function notifyBookingRequest(opts: {
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  serviceName: string;
  when: string;
  smsOptIn?: boolean;
  smsEnabled?: boolean;
}): Promise<void> {
  const env = await getEnv();
  const phone = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const staffEmail = SITE_ADMIN_EMAIL;

  if (opts.clientEmail) {
    const sent = await sendEmail(
      {
        to: opts.clientEmail,
        subject: "We received your appointment request",
        text: bookingAckText({
          clientName: opts.clientName,
          serviceName: opts.serviceName,
          when: opts.when,
          phone,
        }),
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
      subject: `New booking request: ${opts.clientName}`,
      text: `${opts.clientName} requested ${opts.serviceName} on ${opts.when}. Phone: ${opts.clientPhone}`,
    },
    { kind: "staff" },
  );

  if (opts.smsEnabled && opts.smsOptIn) {
    await sendSms(
      opts.clientPhone,
      `Request received for ${opts.serviceName} on ${opts.when}. We will confirm soon. Family Hair Salon`,
    );
  }
}

function appointmentUpdatedText(opts: {
  clientName: string;
  serviceName: string;
  when: string;
  staffName?: string | null;
  address: string;
  phone: string;
  changeLines: string[];
}): string {
  return [
    `Hi ${opts.clientName},`,
    "",
    `Your appointment at Family Hair Salon & Wellness Spa was updated.`,
    "",
    ...opts.changeLines.map((line) => `- ${line}`),
    "",
    `Service: ${opts.serviceName}`,
    opts.staffName ? `With: ${opts.staffName}` : "Stylist: to be confirmed",
    `When: ${opts.when}`,
    `Where: ${opts.address}`,
    "",
    `Questions? Call ${opts.phone}.`,
    "",
    "Family Hair Salon & Wellness Spa",
  ].join("\n");
}

export async function notifyAppointmentUpdated(opts: {
  clientName: string;
  clientEmail?: string | null;
  serviceName: string;
  when: string;
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

  const text = appointmentUpdatedText({
    clientName: opts.clientName,
    serviceName: opts.serviceName,
    when: opts.when,
    staffName: opts.staffName,
    address,
    phone,
    changeLines: opts.changeLines,
  });

  return sendEmail(
    {
      to: opts.clientEmail.trim(),
      subject: "Your appointment was updated - Family Hair Salon",
      text,
    },
    { kind: "appointment" },
  );
}
