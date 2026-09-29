import {
  formatGiftAmount,
  formatIssuedDate,
  type GiftCertificate,
} from "./gift-certificates-shared";
import { sendEmail } from "./email";
import { getEnv } from "./db";
import { SITE_ADMIN_EMAIL } from "./seo";

export function giftCertificateEmailHtml(opts: {
  salonName: string;
  address: string;
  phonePrimary: string;
  phoneSecondary?: string;
  cert: Pick<
    GiftCertificate,
    | "code"
    | "recipient_name"
    | "from_name"
    | "amount_cents"
    | "issued_date"
    | "valid_until_date"
  >;
}): string {
  const amount = formatGiftAmount(opts.cert.amount_cents);
  const date = formatIssuedDate(opts.cert.issued_date);
  const validUntil = formatIssuedDate(opts.cert.valid_until_date);
  const phones = opts.phoneSecondary
    ? `${opts.phonePrimary} · ${opts.phoneSecondary}`
    : opts.phonePrimary;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Gift Certificate</title></head>
<body style="margin:0;padding:24px;background:#f7f4f0;font-family:Georgia,'Times New Roman',serif;color:#2a2420;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fffefb;border:1px solid rgba(42,36,32,0.14);">
    <tr>
      <td style="padding:36px 28px;">
        <p style="margin:0;text-align:center;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">A gift of care</p>
        <h1 style="margin:14px 0 0;text-align:center;font-size:28px;font-weight:500;line-height:1.15;color:#2a2420;">${escapeHtml(opts.salonName)}</h1>
        <p style="margin:10px 0 0;text-align:center;font-size:15px;letter-spacing:0.08em;text-transform:uppercase;color:#2a2420;">Gift Certificate</p>
        <div style="width:72px;height:1px;background:#9a7b4a;opacity:0.55;margin:22px auto 0;"></div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;max-width:360px;margin-left:auto;margin-right:auto;">
          <tr>
            <td style="padding:0 0 18px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">Presented to</p>
              <p style="margin:8px 0 0;padding-bottom:8px;border-bottom:1px solid rgba(42,36,32,0.14);font-size:18px;">${escapeHtml(opts.cert.recipient_name)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 18px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">From</p>
              <p style="margin:8px 0 0;padding-bottom:8px;border-bottom:1px solid rgba(42,36,32,0.14);font-size:18px;">${escapeHtml(opts.cert.from_name)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 18px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">Amount</p>
              <p style="margin:8px 0 0;padding-bottom:8px;border-bottom:1px solid rgba(42,36,32,0.14);font-size:26px;">${escapeHtml(amount)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 18px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">Date issued</p>
              <p style="margin:8px 0 0;padding-bottom:8px;border-bottom:1px solid rgba(42,36,32,0.14);font-size:18px;">${escapeHtml(date)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 8px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">Valid until</p>
              <p style="margin:8px 0 0;padding-bottom:8px;border-bottom:1px solid rgba(42,36,32,0.14);font-size:18px;">${escapeHtml(validUntil)}</p>
            </td>
          </tr>
        </table>

        <p style="margin:28px auto 0;max-width:420px;text-align:center;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#6a5f56;">
          Present this certificate code in salon. Staff will validate it at the desk and apply any amount up to the full value. You may use the remaining balance on later visits through the valid-until date. Not redeemable for cash.
        </p>

        <p style="margin:18px auto 0;text-align:center;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9a7b4a;font-weight:600;">
          Certificate code
        </p>
        <p style="margin:6px auto 0;text-align:center;font-family:Georgia,serif;font-size:22px;letter-spacing:0.08em;color:#2a2420;">
          ${escapeHtml(opts.cert.code)}
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(42,36,32,0.14);">
          <tr>
            <td>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2a2420;">${escapeHtml(opts.address)}</p>
              <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6a5f56;">${escapeHtml(phones)}</p>
            </td>
            <td align="right" style="vertical-align:bottom;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2a2420;opacity:0.7;">${escapeHtml(opts.cert.code)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendGiftCertificateEmail(
  cert: GiftCertificate,
): Promise<{ ok: boolean; detail?: string }> {
  const env = await getEnv();
  const salonName =
    env.SALON_NAME || "Family Hair Salon & Wellness Spa";
  const address =
    env.SALON_ADDRESS || "34777 Grand River Ave, Farmington, MI 48335";
  const phonePrimary = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const phoneSecondary = env.SALON_PHONE_SECONDARY || undefined;
  const amount = formatGiftAmount(cert.amount_cents);

  const text = [
    `Hi ${cert.recipient_name},`,
    "",
    `You received a gift certificate from ${cert.from_name}.`,
    `Amount: ${amount}`,
    `Certificate code: ${cert.code}`,
    `Issued: ${formatIssuedDate(cert.issued_date)}`,
    `Valid until: ${formatIssuedDate(cert.valid_until_date)}`,
    "",
    "This code may be used for multiple visits until the full amount is applied or it expires.",
    `Present this email or code at ${salonName}.`,
    address,
    `Questions? Call ${phonePrimary}.`,
    "",
    "Family Hair Salon & Wellness Spa",
  ].join("\n");

  return sendEmail(
    {
      to: cert.customer_email,
      subject: `Your gift certificate from ${salonName}`,
      text,
      html: giftCertificateEmailHtml({
        salonName,
        address,
        phonePrimary,
        phoneSecondary,
        cert,
      }),
    },
    { kind: "gift_certificate" },
  );
}

export async function notifyAdminGiftCertificatePending(
  cert: GiftCertificate,
  staffName: string,
): Promise<void> {
  const amount = formatGiftAmount(cert.amount_cents);
  await sendEmail(
    {
      to: SITE_ADMIN_EMAIL,
      subject: `Gift certificate needs approval: ${cert.recipient_name}`,
      text: [
        `${staffName} submitted a gift certificate for approval.`,
        "",
        `To: ${cert.recipient_name}`,
        `From: ${cert.from_name}`,
        `Amount: ${amount}`,
        `Email: ${cert.customer_email}`,
        `Valid until: ${formatIssuedDate(cert.valid_until_date)}`,
        `Code: ${cert.code}`,
        "",
        "Approve or reject in Admin → Gift certificates.",
      ].join("\n"),
    },
    { kind: "staff" },
  );
}
