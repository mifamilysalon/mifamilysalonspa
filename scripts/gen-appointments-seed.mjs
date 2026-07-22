/**
 * Generates ~30 days of realistic appointment seed data.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SERVICES = [
  { id: 1, staffId: 1, duration: 60, name: "Creative Cut and Style" },
  { id: 2, staffId: 1, duration: 120, name: "Full Color" },
  { id: 3, staffId: 1, duration: 150, name: "Highlights" },
  { id: 5, staffId: 1, duration: 120, name: "Permanent Wave" },
  { id: 7, staffId: 1, duration: 75, name: "Dermatological Facial" },
  { id: 8, staffId: 1, duration: 30, name: "Face Mapping Analysis" },
  { id: 15, staffId: 1, duration: 75, name: "Private Suite Service" },
  { id: 9, staffId: 2, duration: 45, name: "Classic Manicure" },
  { id: 10, staffId: 2, duration: 60, name: "Classic Pedicure" },
  { id: 11, staffId: 2, duration: 60, name: "Shellac Manicure" },
  { id: 12, staffId: 2, duration: 20, name: "Polish Change" },
  { id: 13, staffId: 2, duration: 60, name: "Body Wax" },
];

const CLIENTS = [
  ["Aisha Rahman", "aisha.r@example.com", "(248) 555-0101"],
  ["Jennifer Walsh", "j.walsh@example.com", "(248) 555-0102"],
  ["Priya Patel", "priya.p@example.com", "(248) 555-0103"],
  ["Maria Santos", "m.santos@example.com", "(248) 555-0104"],
  ["Emily Chen", "emily.c@example.com", "(248) 555-0105"],
  ["Fatima Hassan", "f.hassan@example.com", "(248) 555-0106"],
  ["Laura Kim", "laura.k@example.com", "(248) 555-0107"],
  ["Nadia Ali", "nadia.a@example.com", "(248) 555-0108"],
  ["Sarah Brooks", "s.brooks@example.com", "(248) 555-0109"],
  ["Olivia Nguyen", "o.nguyen@example.com", "(248) 555-0110"],
  ["Hannah Lee", "h.lee@example.com", "(248) 555-0111"],
  ["Amira Yusuf", "amira.y@example.com", "(248) 555-0112"],
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatLocal(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function addMinutes(d, mins) {
  return new Date(d.getTime() + mins * 60_000);
}

const lines = [
  "-- Seed appointments for the next ~30 working days",
  "-- Realistic durations by service type; no overlapping staff slots",
  "DELETE FROM appointments WHERE notes = 'seed-demo';",
  "",
];

const start = new Date();
start.setHours(0, 0, 0, 0);

let clientIdx = 0;
let inserted = 0;

for (let dayOffset = 0; dayOffset < 35 && inserted < 90; dayOffset++) {
  const day = new Date(start);
  day.setDate(start.getDate() + dayOffset);
  const dow = day.getDay();
  if (dow === 0) continue;

  const closeHour = dow === 6 ? 17 : 18;
  const nextFree = { 1: 9 * 60, 2: 9 * 60 };
  const closeMin = closeHour * 60;
  const slotsPerStaff = dow === 6 ? 2 : 3 + (dayOffset % 2);

  for (const staffId of [1, 2]) {
    const pool = SERVICES.filter((s) => s.staffId === staffId);
    for (let i = 0; i < slotsPerStaff; i++) {
      const svc = pool[(dayOffset + staffId + i) % pool.length];
      let cursor = nextFree[staffId];
      if (cursor >= 12 * 60 && cursor < 13 * 60) cursor = 13 * 60;
      if (cursor + svc.duration + 15 > closeMin) break;

      const startDt = new Date(day);
      startDt.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      const endDt = addMinutes(startDt, svc.duration);

      if (startDt.getTime() < Date.now() - 60 * 60_000) {
        nextFree[staffId] = cursor + svc.duration + 15;
        continue;
      }

      const client = CLIENTS[clientIdx % CLIENTS.length];
      clientIdx++;

      const isPast = startDt.getTime() < Date.now();
      const isSoon = startDt.getTime() < Date.now() + 2 * 24 * 60 * 60_000;
      let status = "confirmed";
      if (!isPast && i === 0 && dayOffset % 5 === 0) status = "pending";
      if (isPast) status = dayOffset % 7 === 0 ? "completed" : "confirmed";
      if (isSoon && status === "confirmed" && i === 1 && dayOffset % 9 === 0) {
        status = "in_progress";
      }

      const source = status === "pending" ? "request" : "instant";

      lines.push(
        `INSERT INTO appointments (service_id, staff_id, client_name, client_email, client_phone, start_datetime, end_datetime, status, booking_source, notes, sms_opt_in) VALUES (${svc.id}, ${staffId}, '${client[0].replace(/'/g, "''")}', '${client[1]}', '${client[2]}', '${formatLocal(startDt)}', '${formatLocal(endDt)}', '${status}', '${source}', 'seed-demo', 0);`,
      );
      inserted++;
      nextFree[staffId] = cursor + svc.duration + 15;
    }
  }
}

lines.push("");
lines.push(`-- Inserted ${inserted} demo appointments`);

const out = join(__dirname, "..", "migrations", "0003_seed_appointments.sql");
writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${inserted} appointments to ${out}`);
