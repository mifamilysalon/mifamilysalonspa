import { getEnv } from "./db";
import {
  bookingAckText,
  bookingConfirmationText,
  sendEmail,
} from "./email";

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
    await sendEmail({
      to: opts.clientEmail,
      subject: "Appointment confirmed - Family Hair Salon",
      text,
    });
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
  const staffEmail = "admin@familysalonspa.com";

  if (opts.clientEmail) {
    await sendEmail({
      to: opts.clientEmail,
      subject: "We received your appointment request",
      text: bookingAckText({
        clientName: opts.clientName,
        serviceName: opts.serviceName,
        when: opts.when,
        phone,
      }),
    });
  }

  await sendEmail({
    to: staffEmail,
    subject: `New booking request: ${opts.clientName}`,
    text: `${opts.clientName} requested ${opts.serviceName} on ${opts.when}. Phone: ${opts.clientPhone}`,
  });

  if (opts.smsEnabled && opts.smsOptIn) {
    await sendSms(
      opts.clientPhone,
      `Request received for ${opts.serviceName} on ${opts.when}. We will confirm soon. Family Hair Salon`,
    );
  }
}
