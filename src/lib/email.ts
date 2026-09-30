import { getEnv } from "./db";
import { leaveReviewText } from "./email-templates";

export type EmailAttachment = {
  filename: string;
  /** Base64-encoded content */
  content: string;
  type: string;
  disposition?: "attachment" | "inline";
};

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
  /** Allowlisted or X- custom headers (Cloudflare Email Service). */
  headers?: Record<string, string>;
};

/** Which From address to use (same domain, different mailboxes). */
export type OutboundEmailKind = "appointment" | "gift_certificate" | "staff";

export function resolveOutboundFrom(
  env: Awaited<ReturnType<typeof getEnv>>,
  kind: OutboundEmailKind,
): { email: string; name: string } {
  const name =
    env.MAIL_FROM_NAME || env.SALON_NAME || "Family Hair Salon & Wellness Spa";
  const legacy = env.MAIL_FROM;

  switch (kind) {
    case "gift_certificate":
      return {
        email:
          env.MAIL_FROM_GIFTS || legacy || "gifts@mifamilysalon.com",
        name,
      };
    case "staff":
      return {
        email:
          env.MAIL_FROM_STAFF ||
          env.MAIL_FROM_APPOINTMENTS ||
          legacy ||
          "appointments@mifamilysalon.com",
        name,
      };
    case "appointment":
    default:
      return {
        email:
          env.MAIL_FROM_APPOINTMENTS ||
          legacy ||
          "appointments@mifamilysalon.com",
        name,
      };
  }
}

function fromAddress(
  env: Awaited<ReturnType<typeof getEnv>>,
  kind: OutboundEmailKind,
): { email: string; name: string } {
  return resolveOutboundFrom(env, kind);
}

function errorDetail(err: unknown): string {
  if (!err) return "unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) {
    const code = (err as Error & { code?: string }).code;
    return code ? `${code}: ${err.message}` : err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function sendViaCloudflareBinding(
  env: Awaited<ReturnType<typeof getEnv>>,
  payload: EmailPayload,
  from: { email: string; name: string },
): Promise<{ ok: boolean; detail?: string }> {
  const binder = env.EMAIL;
  if (!binder || typeof binder.send !== "function") {
    return { ok: false, detail: "EMAIL binding missing" };
  }

  const extras: Record<string, unknown> = {};
  if (payload.attachments?.length) extras.attachments = payload.attachments;
  if (payload.headers && Object.keys(payload.headers).length) {
    extras.headers = payload.headers;
  }

  // Prefer structured from; fall back to string from (both supported by Workers API)
  const attempts: Array<Record<string, unknown>> = [
    {
      to: payload.to,
      from: { email: from.email, name: from.name },
      subject: payload.subject,
      text: payload.text,
      html: payload.html || `<pre>${payload.text}</pre>`,
      ...extras,
    },
    {
      to: payload.to,
      from: from.email,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || `<pre>${payload.text}</pre>`,
      ...extras,
    },
  ];

  const errors: string[] = [];
  for (const message of attempts) {
    try {
      await binder.send(message as never);
      return { ok: true };
    } catch (err) {
      const detail = errorDetail(err);
      console.error("Cloudflare EMAIL.send failed", detail, message.from);
      errors.push(detail);
    }
  }
  return { ok: false, detail: errors.join(" | ") };
}

/** Resend HTTP API — optional fallback when EMAIL binding cannot send. */
async function sendViaResend(
  env: Awaited<ReturnType<typeof getEnv>>,
  payload: EmailPayload,
  from: { email: string; name: string },
): Promise<{ ok: boolean; detail?: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, detail: "RESEND_API_KEY not set" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${from.name} <${from.email}>`,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html || undefined,
        headers: payload.headers,
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          content_type: a.type,
        })),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend email failed", res.status, body);
      return { ok: false, detail: `Resend ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend email error", err);
    return { ok: false, detail: errorDetail(err) };
  }
}

/**
 * Cloudflare Email Sending REST API (account token).
 * Useful when the Worker binding is present but OpenNext cannot invoke it.
 */
async function sendViaCloudflareRest(
  env: Awaited<ReturnType<typeof getEnv>>,
  payload: EmailPayload,
  from: { email: string; name: string },
): Promise<{ ok: boolean; detail?: string }> {
  const token = env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN;
  const accountId =
    env.CLOUDFLARE_ACCOUNT_ID || "b51ded38b292d1a89fdd26e99e1bb7e9";
  if (!token) return { ok: false, detail: "CLOUDFLARE_API_TOKEN not set" };

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [payload.to],
          from: { address: from.email, name: from.name },
          subject: payload.subject,
          text: payload.text,
          html: payload.html || undefined,
          headers: payload.headers,
          attachments: payload.attachments?.map((a) => ({
            content: a.content,
            filename: a.filename,
            type: a.type,
            disposition: a.disposition || "attachment",
          })),
        }),
      },
    );
    const body = (await res.json()) as {
      success?: boolean;
      errors?: { message?: string }[];
    };
    if (!res.ok || !body.success) {
      const msg = body.errors?.map((e) => e.message).join("; ") || res.statusText;
      console.error("Cloudflare REST email failed", res.status, msg);
      return { ok: false, detail: `CF REST: ${msg}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Cloudflare REST email error", err);
    return { ok: false, detail: errorDetail(err) };
  }
}

async function sendViaBrevo(
  env: Awaited<ReturnType<typeof getEnv>>,
  payload: EmailPayload,
  from: { email: string; name: string },
): Promise<{ ok: boolean; detail?: string }> {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, detail: "BREVO_API_KEY not set" };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: from.name, email: from.email },
        to: [{ email: payload.to }],
        subject: payload.subject,
        textContent: payload.text,
        htmlContent: payload.html || undefined,
        headers: payload.headers
          ? Object.entries(payload.headers).map(([name, value]) => ({
              name,
              value,
            }))
          : undefined,
        attachment: payload.attachments?.map((a) => ({
          name: a.filename,
          content: a.content,
          type: a.type,
        })),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Brevo email failed", res.status, body);
      return { ok: false, detail: `Brevo ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Brevo email error", err);
    return { ok: false, detail: errorDetail(err) };
  }
}

export async function sendEmail(
  payload: EmailPayload,
  options?: { kind?: OutboundEmailKind },
): Promise<{ ok: boolean; detail?: string }> {
  if (!payload.to) return { ok: false, detail: "missing recipient" };

  const env = await getEnv();
  const kind = options?.kind ?? "appointment";
  const from = fromAddress(env, kind);

  const viaBinding = await sendViaCloudflareBinding(env, payload, from);
  if (viaBinding.ok) return { ok: true, detail: "email-binding" };

  const viaRest = await sendViaCloudflareRest(env, payload, from);
  if (viaRest.ok) return { ok: true, detail: "cloudflare-rest" };

  const viaResend = await sendViaResend(env, payload, from);
  if (viaResend.ok) return { ok: true, detail: "resend" };

  const viaBrevo = await sendViaBrevo(env, payload, from);
  if (viaBrevo.ok) return { ok: true, detail: "brevo" };

  // Local / unbound: log only — do not pretend production delivery succeeded
  const isDev = (env.ENVIRONMENT || "").toLowerCase() !== "production";
  console.log(
    "[email:dev]",
    from.email,
    payload.subject,
    "->",
    payload.to,
    payload.text,
  );
  if (isDev) return { ok: true, detail: "dev-log" };

  return {
    ok: false,
    detail: [viaBinding.detail, viaRest.detail, viaResend.detail, viaBrevo.detail]
      .filter(Boolean)
      .join(" | "),
  };
}

export function bookingConfirmationText(opts: {
  clientName: string;
  serviceName: string;
  when: string;
  staffName?: string;
  address: string;
  phone: string;
}): string {
  const first = opts.clientName.trim().split(/\s+/)[0] || opts.clientName;
  return [
    `Hi ${first},`,
    "",
    `You're all set — we've saved your spot for ${opts.serviceName}.`,
    opts.staffName ? `You'll be with ${opts.staffName}.` : null,
    `When: ${opts.when}`,
    `Where: ${opts.address}`,
    "",
    "We've attached a calendar invite so you can add a reminder on your phone.",
    `Need to change anything? Just call us at ${opts.phone} — we're happy to help.`,
    "",
    leaveReviewText(),
    "",
    "See you soon,",
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
  const first = opts.clientName.trim().split(/\s+/)[0] || opts.clientName;
  return [
    `Hi ${first},`,
    "",
    `Thanks for reaching out — we got your request for ${opts.serviceName} on ${opts.when}.`,
    "Someone from the salon will confirm as soon as we check the book.",
    "",
    `Questions in the meantime? Call ${opts.phone}.`,
    "",
    leaveReviewText(),
    "",
    "Talk soon,",
    "Family Hair Salon & Wellness Spa",
  ].join("\n");
}

/** Headers that help inbox providers treat salon mail as personal/transactional. */
export function transactionalEmailHeaders(kind: OutboundEmailKind): Record<string, string> {
  return {
    "Auto-Submitted": "auto-generated",
    Organization: "Family Hair Salon & Wellness Spa",
    "X-Entity-Ref-ID": `mifamilysalon-${kind}-${Date.now()}`,
    "X-Auto-Response-Suppress": "OOF, AutoReply",
  };
}
