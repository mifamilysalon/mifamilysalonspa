import { getEnv } from "./db";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!payload.to) return false;

  const env = await getEnv();

  if (env.EMAIL?.send) {
    try {
      await env.EMAIL.send({
        to: payload.to,
        from: {
          email: "appointments@familysalonspa.com",
          name: "Family Hair Salon & Wellness Spa",
        },
        subject: payload.subject,
        text: payload.text,
        html: payload.html || `<pre>${payload.text}</pre>`,
      });
      return true;
    } catch (err) {
      console.error("Email send failed", err);
      return false;
    }
  }

  // Dev / unbound: log for local testing
  console.log("[email:dev]", payload.subject, "->", payload.to, payload.text);
  return true;
}

export function bookingConfirmationText(opts: {
  clientName: string;
  serviceName: string;
  when: string;
  staffName?: string;
  address: string;
  phone: string;
}): string {
  return [
    `Hi ${opts.clientName},`,
    "",
    `Your appointment is confirmed.`,
    `Service: ${opts.serviceName}`,
    opts.staffName ? `With: ${opts.staffName}` : null,
    `When: ${opts.when}`,
    `Where: ${opts.address}`,
    "",
    `Questions? Call ${opts.phone}.`,
    "",
    "Family Hair Salon & Wellness Spa",
  ]
    .filter(Boolean)
    .join("\n");
}

export function bookingAckText(opts: {
  clientName: string;
  serviceName: string;
  when: string;
  phone: string;
}): string {
  return [
    `Hi ${opts.clientName},`,
    "",
    `We received your appointment request for ${opts.serviceName} on ${opts.when}.`,
    "We will confirm shortly.",
    "",
    `Questions? Call ${opts.phone}.`,
    "",
    "Family Hair Salon & Wellness Spa",
  ].join("\n");
}
