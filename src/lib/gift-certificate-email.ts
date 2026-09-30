import {
  formatGiftAmount,
  formatIssuedDate,
  giftCertificateBalanceCents,
  type GiftCertificate,
} from "./gift-certificates-shared";
import { sendEmail, transactionalEmailHeaders } from "./email";
import { firstNameFrom, giftCertificateBrandedHtml, leaveReviewText } from "./email-templates";
import { getEnv } from "./db";
import { SITE_ADMIN_EMAIL } from "./seo";

export async function sendGiftCertificateEmail(
  cert: GiftCertificate,
  opts?: { reason?: "issued" | "balance_update" },
): Promise<{ ok: boolean; detail?: string }> {
  const env = await getEnv();
  const salonName =
    env.SALON_NAME || "Family Hair Salon & Wellness Spa";
  const phonePrimary = env.SALON_PHONE_PRIMARY || "(248) 474-6520";
  const phoneSecondary = env.SALON_PHONE_SECONDARY || undefined;

  const remainingCents = giftCertificateBalanceCents(cert);
  const originalCents = cert.amount_cents;
  const isBalanceUpdate = opts?.reason === "balance_update";
  const displayAmount = formatGiftAmount(
    isBalanceUpdate || remainingCents < originalCents
      ? remainingCents
      : originalCents,
  );
  const originalAmount =
    remainingCents < originalCents ? formatGiftAmount(originalCents) : null;
  const first = firstNameFrom(cert.recipient_name);

  if (!cert.customer_email?.trim()) {
    return { ok: false, detail: "missing recipient email" };
  }

  if (isBalanceUpdate && remainingCents <= 0) {
    return { ok: false, detail: "no remaining balance to email" };
  }

  const text = isBalanceUpdate
    ? [
        `Hi ${first},`,
        "",
        `Just a quick update from the salon — part of the certificate from ${cert.from_name} was used.`,
        `You still have ${displayAmount} left.`,
        originalAmount ? `Original value: ${originalAmount}` : null,
        `Your code stays the same: ${cert.code}`,
        `Valid until: ${formatIssuedDate(cert.valid_until_date)}`,
        "",
        "Bring this email (or the code) next time you're in.",
        `Questions? Call ${phonePrimary}.`,
        "",
        leaveReviewText(),
        "",
        "See you soon,",
        salonName,
      ]
        .filter(Boolean)
        .join("\n")
    : [
        `Hi ${first},`,
        "",
        `${cert.from_name} sent you a certificate for ${salonName}.`,
        `Amount: ${displayAmount}`,
        `Your code: ${cert.code}`,
        `Issued: ${formatIssuedDate(cert.issued_date)}`,
        `Valid until: ${formatIssuedDate(cert.valid_until_date)}`,
        "",
        "Whenever you're ready, book online, call us, or walk in — we'd love to take care of you.",
        `Questions? Call ${phonePrimary}.`,
        "",
        leaveReviewText(),
        "",
        "Warmly,",
        salonName,
      ].join("\n");

  // Personal subject lines reduce Gmail Promotions classification vs. marketing-style titles.
  const subject = isBalanceUpdate
    ? `${first}, you still have ${displayAmount} on your certificate`
    : `${first}, ${cert.from_name} sent you a ${displayAmount} certificate`;

  return sendEmail(
    {
      to: cert.customer_email,
      subject,
      text,
      html: giftCertificateBrandedHtml({
        salonName,
        recipientName: cert.recipient_name,
        fromName: cert.from_name,
        amount: displayAmount,
        originalAmount,
        certificateCode: cert.code,
        dateIssued: formatIssuedDate(cert.issued_date),
        validUntil: formatIssuedDate(cert.valid_until_date),
        personalMessage: cert.note || null,
        phonePrimary,
        phoneSecondary,
        isBalanceUpdate,
      }),
      headers: {
        ...transactionalEmailHeaders("gift_certificate"),
        // Personal, not bulk marketing
        Sensitivity: "personal",
        Comments: "transactional-gift-certificate",
      },
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
      headers: transactionalEmailHeaders("staff"),
    },
    { kind: "staff" },
  );
}
