/**
 * One-off delivery check for Resend / Brevo keys in .dev.vars.
 * Usage: node scripts/send-test-email.mjs
 * Does not print secrets.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDevVars(path) {
  const out = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = loadDevVars(resolve(process.cwd(), ".dev.vars"));
const to = process.argv[2] || "familysalonspa@gmail.com";
const fromEmail = env.MAIL_FROM_APPOINTMENTS || env.MAIL_FROM || "appointments@mifamilysalon.com";
const fromName = env.MAIL_FROM_NAME || "Family Hair Salon & Wellness Spa";
const subject = "Family Hair Salon — email delivery test";
const text =
  "This is a test message from the Family Hair Salon & Wellness Spa website email setup. If you received it, outbound email is working.";
const html = `<p>This is a test message from <strong>Family Hair Salon &amp; Wellness Spa</strong>.</p><p>If you received it, outbound email is working.</p>`;

async function tryResend() {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, provider: "resend", detail: "RESEND_API_KEY missing" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  });
  const body = await res.text();
  return {
    ok: res.ok,
    provider: "resend",
    detail: res.ok ? `sent (HTTP ${res.status})` : `HTTP ${res.status}: ${body.slice(0, 240)}`,
  };
}

async function tryBrevo() {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, provider: "brevo", detail: "BREVO_API_KEY missing" };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });
  const body = await res.text();
  return {
    ok: res.ok,
    provider: "brevo",
    detail: res.ok ? `sent (HTTP ${res.status})` : `HTTP ${res.status}: ${body.slice(0, 240)}`,
  };
}

const results = [];
results.push(await tryResend());
if (!results[0].ok) results.push(await tryBrevo());

for (const r of results) {
  console.log(`${r.provider}: ${r.ok ? "OK" : "FAIL"} — ${r.detail}`);
}

if (!results.some((r) => r.ok)) {
  process.exitCode = 1;
  console.error(
    "No provider succeeded. Check domain verification for the From address and that API keys are valid.",
  );
} else {
  console.log(`Test email targeted at ${to}`);
}
