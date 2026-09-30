/** Branded HTML templates for outbound guest emails (table-based for clients). */

import {
  googleCalendarUrl,
  outlookCalendarUrl,
  type AppointmentCalendarInput,
} from "./calendar";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatBookingId(id: number): string {
  return `FSS-${String(id).padStart(5, "0")}`;
}

export function firstNameFrom(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName.trim() || "there";
}

const ACCENT = "#d946a8";
const INK = "#0d0b10";
const SITE_URL = "https://www.mifamilysalon.com";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Family+Hair+Salon+%26+Wellness+Spa+34777+Grand+River+Ave+Farmington+MI";
/** Direct “write a review” link for the salon’s Google Business Profile. */
export const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJY5sJBbCxJIgRljxES6_nwbQ";

/** Plain-text review ask for multipart emails. */
export function leaveReviewText(): string {
  return [
    "Happy with our care? A quick Google review helps neighbors in Farmington find us:",
    GOOGLE_REVIEW_URL,
  ].join("\n");
}

function leaveReviewHtml(): string {
  return `<tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:8px 40px 34px;">
        <div class="rule" style="border-top:1px solid #eee6f1;padding-top:26px;">
          <p class="t-body" style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4a4453;">
            Happy with our care? A quick Google review helps neighbors in Farmington find us.
          </p>
          <a class="btn-full" href="${GOOGLE_REVIEW_URL}" style="display:inline-block;border:2px solid ${ACCENT};color:${ACCENT};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:44px;height:48px;padding:0 32px;border-radius:4px;text-decoration:none;text-align:center;box-sizing:border-box;">Leave a Google review</a>
        </div>
      </td>
    </tr>`;
}

function emailShell(opts: {
  title: string;
  preheader: string;
  headerInner: string;
  bodyRows: string;
  footerNote: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(opts.title)}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  img{border:0;outline:none;text-decoration:none}
  a{color:${ACCENT}}
  @media (max-width:620px){
    .wrap{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .stack{display:block!important;width:100%!important;padding:0 0 14px 0!important}
    .btn-full{display:block!important;width:100%!important}
    .amt{font-size:52px!important;line-height:58px!important}
  }
  @media (prefers-color-scheme:dark){
    .bg-page{background:#0d0b10!important}
    .bg-card{background:#17131c!important}
    .t-body{color:#e9e4ee!important}
    .t-head{color:#ffffff!important}
    .t-muted{color:#b9b1c4!important}
    .bg-soft{background:#211b29!important;border-color:#2a2431!important}
    .rule{border-color:#2a2431!important}
  }
</style>
</head>
<body class="bg-page" style="margin:0;padding:0;background:#f4eff6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4eff6;font-size:1px;line-height:1px;">
  ${escapeHtml(opts.preheader)}
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page" style="background:#f4eff6;">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
    ${opts.headerInner}
    ${opts.bodyRows}
    ${leaveReviewHtml()}
    <tr>
      <td align="center" style="background:${INK};padding:28px 24px 30px;border-radius:0 0 10px 10px;">
        <div style="font-family:Georgia,serif;font-size:17px;color:#ffffff;margin-bottom:10px;">Family Hair Salon &amp; Wellness Spa</div>
        <div style="font-family:Arial,sans-serif;font-size:13px;line-height:21px;color:#b9b1c4;">
          34777 Grand River Ave, Farmington, MI 48335<br>
          Mon-Fri 10am-6pm &nbsp;|&nbsp; Sat 10am-5pm &nbsp;|&nbsp; Sun closed<br>
          Walk-ins welcome
        </div>
        <div style="font-family:Arial,sans-serif;font-size:13px;margin-top:14px;">
          <a href="tel:+12484746520" style="color:#ffffff;text-decoration:none;">(248) 474-6520</a>
          <span style="color:#5d5468;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <a href="tel:+12486355127" style="color:#ffffff;text-decoration:none;">(248) 635-5127</a>
          <span style="color:#5d5468;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <a href="${SITE_URL}/" style="color:#ffffff;text-decoration:none;">Visit our website</a>
        </div>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:18px 20px 0;font-family:Arial,sans-serif;font-size:12px;line-height:18px;color:#8a8194;">
        ${opts.footerNote}
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function brandHeader(): string {
  return `<tr>
      <td align="center" style="background:${INK};padding:30px 24px 26px;border-radius:10px 10px 0 0;">
        <div style="font-family:Georgia,'Playfair Display','Times New Roman',serif;font-size:24px;line-height:30px;color:#ffffff;letter-spacing:.3px;">
          Family Hair Salon &amp; Wellness Spa
        </div>
        <div style="width:48px;height:2px;background:${ACCENT};margin:14px auto 0;line-height:2px;font-size:2px;">&nbsp;</div>
      </td>
    </tr>`;
}

function calendarInputFromAppointment(
  data: AppointmentEmailData,
): AppointmentCalendarInput | null {
  if (!data.startIso || !data.durationMinutes || data.durationMinutes <= 0) {
    return null;
  }
  const bookingRef = formatBookingId(data.bookingId);
  return {
    bookingId: data.bookingId,
    bookingRef,
    title: `${data.serviceName} at Family Hair Salon`,
    startIso: data.startIso,
    durationMinutes: data.durationMinutes,
    location: data.address,
    details: `Booking ${bookingRef} with ${data.stylistName}. Questions? Call ${data.phone}.`,
  };
}

function calendarActionsHtml(data: AppointmentEmailData): string {
  const cal = calendarInputFromAppointment(data);
  if (!cal) return "";
  const google = googleCalendarUrl(cal);
  const outlook = outlookCalendarUrl(cal);
  if (!google && !outlook) return "";

  return `<tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:26px 40px 8px;">
        <p class="t-body" style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4a4453;">
          Want a reminder on your phone? Tap below, or open the calendar invite attached to this email.
        </p>
        ${
          google
            ? `<a class="btn-full" href="${escapeHtml(google)}" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:48px;height:48px;padding:0 36px;border-radius:4px;text-decoration:none;text-align:center;">Add to Google Calendar</a>`
            : ""
        }
        <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
          ${
            outlook
              ? `<a href="${escapeHtml(outlook)}" style="color:${ACCENT};text-decoration:underline;">Add in Outlook</a>`
              : ""
          }
          ${outlook ? `<span class="t-muted" style="color:#b0a7ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>` : ""}
          <a href="${SITE_URL}/contact" style="color:${ACCENT};text-decoration:underline;">Need to reschedule?</a>
          <span class="t-muted" style="color:#b0a7ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <a href="tel:+12484746520" style="color:${ACCENT};text-decoration:underline;">Call us</a>
          <span class="t-muted" style="color:#b0a7ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <a href="${escapeHtml(MAPS_URL)}" style="color:${ACCENT};text-decoration:underline;">Get directions</a>
        </p>
      </td>
    </tr>`;
}

export type AppointmentEmailData = {
  bookingId: number;
  clientName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationLabel: string;
  stylistName: string;
  address: string;
  phone: string;
  startIso?: string;
  durationMinutes?: number;
  changeLines?: string[];
};

export function appointmentConfirmedHtml(data: AppointmentEmailData): string {
  const first = firstNameFrom(data.clientName);
  const bookingRef = formatBookingId(data.bookingId);

  const body = `
    <tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:40px 40px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td align="center" width="52" height="52" style="width:52px;height:52px;border-radius:26px;background:#fbe4f3;font-family:Arial,sans-serif;font-size:26px;line-height:52px;color:${ACCENT};font-weight:bold;">&#10003;</td>
        </tr></table>
        <h1 class="t-head" style="margin:20px 0 10px;font-family:Georgia,'Playfair Display',serif;font-weight:normal;font-size:30px;line-height:38px;color:#1c1822;">
          You're all set, ${escapeHtml(first)}.
        </h1>
        <p class="t-body" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#4a4453;">
          We've saved your spot for ${escapeHtml(data.serviceName)}. Can't wait to take care of you.
        </p>
      </td>
    </tr>
    ${appointmentCard(data)}
    ${calendarActionsHtml(data)}
    ${goodToKnow()}`;

  return emailShell({
    title: "You're booked with us",
    preheader: `You're booked for ${data.serviceName} on ${data.appointmentDate} at ${data.appointmentTime}. See you soon.`,
    headerInner: brandHeader(),
    bodyRows: body,
    footerNote: `This note is just for your booking with us.<br>Reference: <strong>${escapeHtml(bookingRef)}</strong>`,
  });
}

export function appointmentRequestHtml(data: AppointmentEmailData): string {
  const first = firstNameFrom(data.clientName);
  const bookingRef = formatBookingId(data.bookingId);
  const body = `
    <tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:40px 40px 8px;">
        <h1 class="t-head" style="margin:0 0 10px;font-family:Georgia,'Playfair Display',serif;font-weight:normal;font-size:30px;line-height:38px;color:#1c1822;">
          We got your request, ${escapeHtml(first)}.
        </h1>
        <p class="t-body" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#4a4453;">
          Thanks for choosing us. Someone from the salon will confirm your time as soon as we check the book.
        </p>
      </td>
    </tr>
    ${appointmentCard(data)}
    <tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:26px 40px 34px;">
        <p class="t-body" style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#4a4453;">
          Prefer to sort it out by phone? We're happy to help.
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
          <a href="tel:+12484746520" style="color:${ACCENT};text-decoration:underline;">Call ${escapeHtml(data.phone)}</a>
          <span class="t-muted" style="color:#b0a7ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <a href="${escapeHtml(MAPS_URL)}" style="color:${ACCENT};text-decoration:underline;">Get directions</a>
        </p>
      </td>
    </tr>`;

  return emailShell({
    title: "We received your request",
    preheader: `Thanks — we received your request for ${data.serviceName} on ${data.appointmentDate}.`,
    headerInner: brandHeader(),
    bodyRows: body,
    footerNote: `We'll follow up soon.<br>Reference: <strong>${escapeHtml(bookingRef)}</strong>`,
  });
}

export function appointmentUpdatedHtml(data: AppointmentEmailData): string {
  const first = firstNameFrom(data.clientName);
  const bookingRef = formatBookingId(data.bookingId);
  const changes =
    data.changeLines
      ?.map(
        (line) =>
          `<tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:8px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:8px;">${escapeHtml(line)}</td></tr>`,
      )
      .join("") || "";

  const calendarBlock =
    calendarActionsHtml(data) ||
    `<tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:26px 40px 34px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
          <a href="tel:+12484746520" style="color:${ACCENT};text-decoration:underline;">Questions? Call ${escapeHtml(data.phone)}</a>
        </p>
      </td>
    </tr>`;

  const body = `
    <tr>
      <td class="bg-card px" align="center" style="background:#ffffff;padding:40px 40px 8px;">
        <h1 class="t-head" style="margin:0 0 10px;font-family:Georgia,'Playfair Display',serif;font-weight:normal;font-size:30px;line-height:38px;color:#1c1822;">
          A quick update for you, ${escapeHtml(first)}.
        </h1>
        <p class="t-body" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#4a4453;">
          Your visit details changed a bit. Here's what's new, plus your current booking.
        </p>
      </td>
    </tr>
    ${
      changes
        ? `<tr><td class="bg-card px" style="background:#ffffff;padding:18px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;line-height:22px;">${changes}</table></td></tr>`
        : ""
    }
    ${appointmentCard(data)}
    ${calendarBlock}`;

  return emailShell({
    title: "Your visit details were updated",
    preheader: `Your appointment details were updated. Updated time: ${data.appointmentDate} at ${data.appointmentTime}.`,
    headerInner: brandHeader(),
    bodyRows: body,
    footerNote: `If anything looks off, give us a call — we're glad to help.<br>Reference: <strong>${escapeHtml(bookingRef)}</strong>`,
  });
}

function appointmentCard(data: AppointmentEmailData): string {
  return `<tr>
      <td class="bg-card px" style="background:#ffffff;padding:26px 40px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-soft" style="background:#faf6fb;border:1px solid #eadff0;border-left:4px solid ${ACCENT};border-radius:8px;">
          <tr><td style="padding:24px 26px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="stack" width="50%" valign="top" style="padding:0 10px 18px 0;">
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;margin-bottom:4px;">Date</div>
                  <div class="t-head" style="font-family:Georgia,serif;font-size:19px;line-height:24px;color:#1c1822;">${escapeHtml(data.appointmentDate)}</div>
                </td>
                <td class="stack" width="50%" valign="top" style="padding:0 0 18px 10px;">
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;margin-bottom:4px;">Time</div>
                  <div class="t-head" style="font-family:Georgia,serif;font-size:19px;line-height:24px;color:#1c1822;">${escapeHtml(data.appointmentTime)}</div>
                </td>
              </tr>
              <tr>
                <td class="stack" width="50%" valign="top" style="padding:0 10px 18px 0;">
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;margin-bottom:4px;">Service</div>
                  <div class="t-head" style="font-family:Arial,sans-serif;font-size:16px;line-height:22px;font-weight:bold;color:#1c1822;">${escapeHtml(data.serviceName)}</div>
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:13px;color:#7b7285;margin-top:2px;">${escapeHtml(data.durationLabel)}</div>
                </td>
                <td class="stack" width="50%" valign="top" style="padding:0 0 18px 10px;">
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;margin-bottom:4px;">With</div>
                  <div class="t-head" style="font-family:Arial,sans-serif;font-size:16px;line-height:22px;font-weight:bold;color:#1c1822;">${escapeHtml(data.stylistName)}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="rule" style="border-top:1px solid #eadff0;padding-top:16px;">
                  <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;margin-bottom:4px;">Where</div>
                  <div class="t-body" style="font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:#1c1822;">
                    ${escapeHtml(data.address)}<br>
                    <a href="tel:+12484746520" style="color:${ACCENT};text-decoration:none;">${escapeHtml(data.phone)}</a>
                  </div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td>
    </tr>`;
}

function goodToKnow(): string {
  return `<tr>
      <td class="bg-card px" style="background:#ffffff;padding:30px 40px 34px;">
        <div class="rule" style="border-top:1px solid #eee6f1;padding-top:26px;">
          <h2 class="t-head" style="margin:0 0 14px;font-family:Georgia,serif;font-weight:normal;font-size:20px;line-height:26px;color:#1c1822;">A few friendly reminders</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
            <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:10px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:10px;">Come in about 5–10 minutes early so we can settle you in without rushing.</td></tr>
            <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:10px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:10px;">Plans change? Just let us know at least a day ahead when you can.</td></tr>
            <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:10px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:10px;">Want a quieter visit? Ask about our private women's suite when you arrive or call ahead.</td></tr>
            <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};">&bull;</td><td class="t-body" style="color:#4a4453;">Running late? Call <a href="tel:+12484746520" style="color:${ACCENT};">(248) 474-6520</a> — we'll do our best to keep your spot.</td></tr>
          </table>
        </div>
      </td>
    </tr>`;
}

export type GiftCertEmailData = {
  salonName: string;
  recipientName: string;
  fromName: string;
  /** Amount shown large on the certificate (remaining balance when updated). */
  amount: string;
  /** Original face value when different from remaining. */
  originalAmount?: string | null;
  certificateCode: string;
  dateIssued: string;
  validUntil: string;
  personalMessage?: string | null;
  phonePrimary: string;
  phoneSecondary?: string;
  /** When true, copy explains this is an updated remaining balance. */
  isBalanceUpdate?: boolean;
};

export function giftCertificateBrandedHtml(data: GiftCertEmailData): string {
  const first = firstNameFrom(data.recipientName);
  const messageRow = data.personalMessage?.trim()
    ? `<tr>
    <td class="bg-card px" style="background:#ffffff;padding:22px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-soft" style="background:#faf6fb;border:1px solid #eadff0;border-left:4px solid ${ACCENT};border-radius:8px;">
        <tr><td style="padding:18px 22px;font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:26px;color:#3a3341;" class="t-body">
          &ldquo;${escapeHtml(data.personalMessage.trim())}&rdquo;
        </td></tr>
      </table>
    </td>
  </tr>`
    : "";

  const body = `
  <tr>
    <td bgcolor="${INK}" align="center" class="px" style="background:${INK};padding:14px;border-radius:10px 10px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${ACCENT};border-radius:6px;">
        <tr><td align="center" style="padding:36px 24px 34px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;color:#e7a6d0;">A GIFT OF CARE</div>
          <div style="font-family:Georgia,'Playfair Display','Times New Roman',serif;font-size:26px;line-height:34px;color:#ffffff;margin-top:10px;">${escapeHtml(data.salonName)}</div>
          <div style="width:48px;height:2px;background:${ACCENT};margin:16px auto;line-height:2px;font-size:2px;">&nbsp;</div>
          <div style="font-family:Georgia,'Playfair Display',serif;font-size:36px;line-height:42px;color:#f6c6e6;">Gift Certificate</div>
          <div class="amt" style="font-family:Georgia,'Playfair Display',serif;font-size:64px;line-height:72px;color:#ffffff;margin-top:14px;">${escapeHtml(data.amount)}</div>
          ${
            data.isBalanceUpdate
              ? `<div style="font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:#e7a6d0;margin-top:6px;">Still available on your certificate${data.originalAmount ? ` · started at ${escapeHtml(data.originalAmount)}` : ""}</div>`
              : data.originalAmount && data.originalAmount !== data.amount
                ? `<div style="font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:#e7a6d0;margin-top:6px;">Remaining of ${escapeHtml(data.originalAmount)} original</div>`
                : ""
          }
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-card px" style="background:#ffffff;padding:36px 40px 6px;" align="center">
      <p class="t-head" style="margin:0 0 6px;font-family:Georgia,'Playfair Display',serif;font-size:24px;line-height:32px;color:#1c1822;">${
        data.isBalanceUpdate
          ? `Hi ${escapeHtml(first)} — here's your updated balance`
          : `${escapeHtml(data.fromName)} sent this for you, ${escapeHtml(first)}`
      }</p>
      <p class="t-body" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#4a4453;">${
        data.isBalanceUpdate
          ? "Part of your certificate was used at the salon. Keep this email (and the same code) for whatever is left."
          : "Whenever you're ready, come in for hair, skin, nails, or wellness — we'd love to take care of you."
      }</p>
    </td>
  </tr>
  ${messageRow}
  <tr>
    <td class="bg-card px" style="background:#ffffff;padding:28px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed ${ACCENT};border-radius:8px;">
        <tr><td align="center" style="padding:18px 16px;">
          <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;">Your certificate code</div>
          <div class="t-head" style="font-family:'Courier New',Courier,monospace;font-size:30px;line-height:38px;letter-spacing:4px;font-weight:bold;color:#1c1822;margin-top:4px;">${escapeHtml(data.certificateCode)}</div>
          <div class="t-muted" style="font-family:Arial,sans-serif;font-size:13px;color:#7b7285;margin-top:4px;">Show this email or tell us the code at the desk.</div>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-card px" style="background:#ffffff;padding:26px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="stack" width="50%" valign="top" style="padding:0 10px 16px 0;">
            <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;">Date issued</div>
            <div class="t-head" style="font-family:Georgia,serif;font-size:18px;line-height:26px;color:#1c1822;">${escapeHtml(data.dateIssued)}</div>
          </td>
          <td class="stack" width="50%" valign="top" style="padding:0 0 16px 10px;">
            <div class="t-muted" style="font-family:Arial,sans-serif;font-size:12px;color:#7b7285;">Valid until</div>
            <div class="t-head" style="font-family:Georgia,serif;font-size:18px;line-height:26px;color:#1c1822;">${escapeHtml(data.validUntil)}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-card px" align="center" style="background:#ffffff;padding:10px 40px 6px;">
      <a class="btn-full" href="${SITE_URL}/appointments" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:48px;height:48px;padding:0 36px;border-radius:4px;text-decoration:none;text-align:center;">Book your visit</a>
      <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
        <a href="tel:+12484746520" style="color:${ACCENT};text-decoration:underline;">Call ${escapeHtml(data.phonePrimary)}</a>
        <span style="color:#b0a7ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="${escapeHtml(MAPS_URL)}" style="color:${ACCENT};text-decoration:underline;">Get directions</a>
      </p>
    </td>
  </tr>
  <tr>
    <td class="bg-card px" style="background:#ffffff;padding:26px 40px 34px;">
      <div class="rule" style="border-top:1px solid #eee6f1;padding-top:24px;">
        <h2 class="t-head" style="margin:0 0 12px;font-family:Georgia,serif;font-weight:normal;font-size:20px;line-height:26px;color:#1c1822;">How to use it</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;line-height:22px;">
          <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:8px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:8px;">Book online, call us, or walk in whenever it works for you.</td></tr>
          <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};padding-bottom:8px;">&bull;</td><td class="t-body" style="color:#4a4453;padding-bottom:8px;">At the desk, show this email or share your code — that's all we need.</td></tr>
          <tr><td class="t-body" width="18" valign="top" style="color:${ACCENT};">&bull;</td><td class="t-body" style="color:#4a4453;">${
            data.isBalanceUpdate
              ? "This amount is what's left. Use the same code until the balance is gone or the valid-until date."
              : "Good for hair, skin, nail, and wellness services through the valid-until date. Not redeemable for cash."
          }</td></tr>
        </table>
      </div>
    </td>
  </tr>`;

  return emailShell({
    title: data.isBalanceUpdate
      ? "Your certificate balance update"
      : `${data.fromName} sent you a certificate`,
    preheader: data.isBalanceUpdate
      ? `Hi ${first} — you still have ${data.amount} on certificate ${data.certificateCode}.`
      : `${data.fromName} sent you a ${data.amount} certificate for Family Hair Salon. Code inside.`,
    headerInner: "",
    bodyRows: body,
    footerNote: `This message was sent for ${escapeHtml(data.fromName)} by Family Hair Salon &amp; Wellness Spa.<br>Keep this email for your records — it isn't a promotion.`,
  });
}
