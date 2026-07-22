import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb, getEnv } from "./db";

export type UserRole = "owner" | "manager" | "stylist" | "receptionist";

export type SessionUser = {
  id: number;
  email: string | null;
  name: string;
  role: UserRole;
  staffProfileId?: number | null;
};

const COOKIE_NAME = "fss_session";
const SESSION_DAYS = 7;
const STAFF_SESSION_HOURS = 8;

function randomId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: number,
  opts?: { staffHours?: boolean },
): Promise<string> {
  const db = await getDb();
  const id = randomId();
  const hours = opts?.staffHours ? STAFF_SESSION_HOURS : SESSION_DAYS * 24;
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(id, userId, expires)
    .run();

  const jar = await cookies();
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });

  return id;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const db = await getDb();
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.is_active, s.expires_at,
              sp.id AS staff_profile_id
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE s.id = ?`,
    )
    .bind(token)
    .first<{
      id: number;
      email: string | null;
      name: string;
      role: UserRole;
      is_active: number;
      expires_at: string;
      staff_profile_id: number | null;
    }>();

  if (!row || !row.is_active) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    staffProfileId: row.staff_profile_id,
  };
}

export function requireRole(
  user: SessionUser | null,
  roles: UserRole[],
): SessionUser {
  if (!user || !roles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const db = await getDb();
  const user = await db
    .prepare(
      "SELECT id, email, name, role, password_hash, is_active FROM users WHERE email = ?",
    )
    .bind(email.toLowerCase())
    .first<{
      id: number;
      email: string;
      name: string;
      role: UserRole;
      password_hash: string | null;
      is_active: number;
    }>();

  if (!user || !user.is_active || !user.password_hash) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;

  await createSession(user.id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function loginWithPin(
  staffId: number,
  pin: string,
): Promise<SessionUser | null> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.pin_hash, u.is_active, sp.id AS staff_profile_id
       FROM staff_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE sp.id = ?`,
    )
    .bind(staffId)
    .first<{
      id: number;
      email: string | null;
      name: string;
      role: UserRole;
      pin_hash: string | null;
      is_active: number;
      staff_profile_id: number;
    }>();

  if (!row || !row.is_active || !row.pin_hash) return null;
  const ok = await verifyPassword(pin, row.pin_hash);
  if (!ok) return null;

  await createSession(row.id, { staffHours: true });
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    staffProfileId: row.staff_profile_id,
  };
}

export async function getSessionSecret(): Promise<string> {
  const env = await getEnv();
  return env.SESSION_SECRET || "dev-insecure-session-secret";
}
