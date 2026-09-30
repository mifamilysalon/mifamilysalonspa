import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./auth";
import { absoluteUrl } from "./seo";
import { sendEmail, transactionalEmailHeaders } from "./email";
import { escapeHtml } from "./email-templates";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const MIN_PASSWORD_LEN = 8;

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function validateNewPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LEN) {
    return `Password must be at least ${MIN_PASSWORD_LEN} characters.`;
  }
  return null;
}

type AdminUserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  password_hash: string | null;
  is_active: number;
};

async function findResettableAdmin(email: string): Promise<AdminUserRow | null> {
  const db = await getDb();
  const user = await db
    .prepare(
      `SELECT id, email, name, role, password_hash, is_active
       FROM users WHERE lower(email) = lower(?)`,
    )
    .bind(email.trim())
    .first<AdminUserRow>();

  if (!user || !user.is_active || !user.password_hash) return null;
  if (!["owner", "manager"].includes(user.role)) return null;
  return user;
}

/** Always returns a generic success shape — does not reveal whether email exists. */
export async function requestPasswordReset(email: string): Promise<{
  ok: boolean;
  detail?: string;
}> {
  const user = await findResettableAdmin(email);
  if (!user) {
    return { ok: true };
  }

  const db = await getDb();
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();

  // Invalidate unused tokens for this user
  await db
    .prepare(
      `UPDATE password_reset_tokens
       SET used_at = datetime('now')
       WHERE user_id = ? AND used_at IS NULL`,
    )
    .bind(user.id)
    .run();

  await db
    .prepare(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
    )
    .bind(user.id, tokenHash, expiresAt)
    .run();

  const resetUrl = absoluteUrl(
    `/admin/reset-password?token=${encodeURIComponent(token)}`,
  );
  const first = user.name.trim().split(/\s+/)[0] || "there";

  const text = [
    `Hi ${first},`,
    "",
    "We received a request to reset the admin password for Family Hair Salon & Wellness Spa.",
    "",
    `Open this link within 1 hour to choose a new password:`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email — your password will stay the same.",
    "",
    "— Family Hair Salon & Wellness Spa",
  ].join("\n");

  const html = `
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#0d0b10;">
      Hi ${escapeHtml(first)},
    </p>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#0d0b10;">
      We received a request to reset the admin password for Family Hair Salon &amp; Wellness Spa.
    </p>
    <p style="margin:28px 0;">
      <a href="${escapeHtml(resetUrl)}"
         style="display:inline-block;background:#d946a8;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:48px;height:48px;padding:0 28px;border-radius:4px;text-decoration:none;">
        Reset password
      </a>
    </p>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#555;">
      This link expires in 1 hour. If you did not request a reset, ignore this email.
    </p>
  `;

  const sent = await sendEmail(
    {
      to: user.email,
      subject: "Reset your admin password",
      text,
      html,
      headers: transactionalEmailHeaders("staff"),
    },
    { kind: "staff" },
  );

  if (!sent.ok) {
    console.error("password reset email failed", sent.detail);
    return { ok: false, detail: sent.detail || "email_failed" };
  }

  return { ok: true };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const raw = token.trim();
  if (!raw || raw.length < 32) {
    return { ok: false, error: "Invalid or expired reset link." };
  }

  const db = await getDb();
  const tokenHash = await sha256Hex(raw);
  const row = await db
    .prepare(
      `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.role, u.is_active, u.password_hash
       FROM password_reset_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = ?`,
    )
    .bind(tokenHash)
    .first<{
      id: number;
      user_id: number;
      expires_at: string;
      used_at: string | null;
      role: string;
      is_active: number;
      password_hash: string | null;
    }>();

  if (!row || row.used_at || !row.is_active || !row.password_hash) {
    return { ok: false, error: "Invalid or expired reset link." };
  }
  if (!["owner", "manager"].includes(row.role)) {
    return { ok: false, error: "Invalid or expired reset link." };
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This reset link has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(passwordHash, row.user_id)
    .run();
  await db
    .prepare(
      "UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?",
    )
    .bind(row.id)
    .run();
  // Sign out all existing sessions for this account
  await db
    .prepare("DELETE FROM sessions WHERE user_id = ?")
    .bind(row.user_id)
    .run();

  return { ok: true };
}

export async function changePasswordForUser(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const db = await getDb();
  const user = await db
    .prepare(
      "SELECT id, role, password_hash, is_active FROM users WHERE id = ?",
    )
    .bind(userId)
    .first<{
      id: number;
      role: string;
      password_hash: string | null;
      is_active: number;
    }>();

  if (!user || !user.is_active || !user.password_hash) {
    return { ok: false, error: "Account not found." };
  }
  if (!["owner", "manager"].includes(user.role)) {
    return { ok: false, error: "Only admin accounts use a password." };
  }

  const matches = await verifyPassword(currentPassword, user.password_hash);
  if (!matches) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(passwordHash, user.id)
    .run();

  return { ok: true };
}
