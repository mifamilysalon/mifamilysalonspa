/** Calendar helpers for appointment emails (ICS + Google Calendar). */

const SALON_TZ = "America/Detroit";

type Wall = {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
};

function parseWall(startIso: string): Wall | null {
  const m = startIso
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?/,
    );
  if (!m) return null;
  return {
    y: Number(m[1]),
    mo: Number(m[2]),
    d: Number(m[3]),
    h: Number(m[4]),
    mi: Number(m[5]),
    s: Number(m[6] || "0"),
  };
}

function wallToCompact(w: Wall): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${w.y}${p(w.mo)}${p(w.d)}T${p(w.h)}${p(w.mi)}${p(w.s)}`;
}

/** Add minutes in wall-clock arithmetic (salon local time, no TZ shift). */
function addMinutesWall(w: Wall, minutes: number): Wall {
  const ms = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) + minutes * 60_000;
  const d = new Date(ms);
  return {
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    mi: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
  };
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

export type AppointmentCalendarInput = {
  bookingId: number;
  bookingRef: string;
  title: string;
  startIso: string;
  durationMinutes: number;
  location: string;
  details: string;
};

export function googleCalendarUrl(input: AppointmentCalendarInput): string | null {
  const start = parseWall(input.startIso);
  if (!start || input.durationMinutes <= 0) return null;
  const end = addMinutesWall(start, input.durationMinutes);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${wallToCompact(start)}/${wallToCompact(end)}`,
    ctz: SALON_TZ,
    location: input.location,
    details: input.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Outlook.com deep link (also useful on Windows phones). */
export function outlookCalendarUrl(input: AppointmentCalendarInput): string | null {
  const start = parseWall(input.startIso);
  if (!start || input.durationMinutes <= 0) return null;
  const end = addMinutesWall(start, input.durationMinutes);
  const isoLocal = (w: Wall) =>
    `${w.y}-${String(w.mo).padStart(2, "0")}-${String(w.d).padStart(2, "0")}T${String(w.h).padStart(2, "0")}:${String(w.mi).padStart(2, "0")}:${String(w.s).padStart(2, "0")}`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    startdt: isoLocal(start),
    enddt: isoLocal(end),
    location: input.location,
    body: input.details,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function buildAppointmentIcs(input: AppointmentCalendarInput): string | null {
  const start = parseWall(input.startIso);
  if (!start || input.durationMinutes <= 0) return null;
  const end = addMinutesWall(start, input.durationMinutes);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const uid = `fss-${input.bookingId}@mifamilysalon.com`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family Hair Salon & Wellness Spa//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${SALON_TZ}:${wallToCompact(start)}`,
    `DTEND;TZID=${SALON_TZ}:${wallToCompact(end)}`,
    `SUMMARY:${icsEscape(input.title)}`,
    `LOCATION:${icsEscape(input.location)}`,
    `DESCRIPTION:${icsEscape(input.details)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

export function icsToBase64(ics: string): string {
  // Workers / Node: prefer Buffer; fall back to btoa for latin1 ICS text
  if (typeof Buffer !== "undefined") {
    return Buffer.from(ics, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(ics);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
