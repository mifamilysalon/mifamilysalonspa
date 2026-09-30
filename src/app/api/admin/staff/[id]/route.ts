import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, requireRole } from "@/lib/auth";
import { getAuthSettings } from "@/lib/site";
import { getDb } from "@/lib/db";

const updateSchema = z.object({
  display_name: z.string().min(2).max(120).optional(),
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(160).optional().nullable(),
  role: z.enum(["stylist", "receptionist", "manager"]).optional(),
  bio: z.string().max(2000).optional().nullable(),
  is_bookable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  pin: z
    .string()
    .regex(/^\d{4}$|^\d{6}$/)
    .optional(),
  service_ids: z.array(z.number().int().positive()).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = Number(id);
    if (!Number.isFinite(staffId) || staffId <= 0) {
      return NextResponse.json({ error: "Invalid staff id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Invalid staff update" }, { status: 400 });
    }

    if (parsed.data.pin) {
      const auth = await getAuthSettings();
      if (parsed.data.pin.length !== auth.pin_length) {
        return NextResponse.json(
          { error: `PIN must be ${auth.pin_length} digits.` },
          { status: 400 },
        );
      }
    }

    const db = await getDb();
    const existing = await db
      .prepare(
        `SELECT sp.id, sp.user_id, u.role
         FROM staff_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE sp.id = ?`,
      )
      .bind(staffId)
      .first<{ id: number; user_id: number; role: string }>();

    if (!existing) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    if (existing.role === "owner") {
      return NextResponse.json(
        { error: "Owner accounts are managed separately from staff." },
        { status: 400 },
      );
    }

    if (parsed.data.email) {
      const email = parsed.data.email.trim().toLowerCase();
      const clash = await db
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .bind(email, existing.user_id)
        .first();
      if (clash) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
      }
    }

    const profileFields: string[] = [];
    const profileValues: (string | number | null)[] = [];
    if (parsed.data.display_name !== undefined) {
      profileFields.push("display_name = ?");
      profileValues.push(parsed.data.display_name.trim());
    }
    if (parsed.data.bio !== undefined) {
      profileFields.push("bio = ?");
      profileValues.push(parsed.data.bio?.trim() || null);
    }
    if (parsed.data.is_bookable !== undefined) {
      profileFields.push("is_bookable = ?");
      profileValues.push(parsed.data.is_bookable ? 1 : 0);
    }

    if (profileFields.length) {
      profileValues.push(staffId);
      await db
        .prepare(`UPDATE staff_profiles SET ${profileFields.join(", ")} WHERE id = ?`)
        .bind(...profileValues)
        .run();
    }

    const userFields: string[] = [];
    const userValues: (string | number | null)[] = [];
    if (parsed.data.name !== undefined) {
      userFields.push("name = ?");
      userValues.push(parsed.data.name.trim());
    }
    if (parsed.data.email !== undefined) {
      userFields.push("email = ?");
      userValues.push(parsed.data.email?.trim().toLowerCase() || null);
    }
    if (parsed.data.role !== undefined) {
      userFields.push("role = ?");
      userValues.push(parsed.data.role);
    }
    if (parsed.data.is_active !== undefined) {
      userFields.push("is_active = ?");
      userValues.push(parsed.data.is_active ? 1 : 0);
      if (!parsed.data.is_active && parsed.data.is_bookable === undefined) {
        await db
          .prepare("UPDATE staff_profiles SET is_bookable = 0 WHERE id = ?")
          .bind(staffId)
          .run();
      }
    }
    if (parsed.data.pin) {
      userFields.push("pin_hash = ?");
      userValues.push(await hashPassword(parsed.data.pin));
    }

    if (userFields.length) {
      userValues.push(existing.user_id);
      await db
        .prepare(`UPDATE users SET ${userFields.join(", ")} WHERE id = ?`)
        .bind(...userValues)
        .run();
    }

    if (parsed.data.service_ids) {
      await db
        .prepare("DELETE FROM staff_services WHERE staff_id = ?")
        .bind(staffId)
        .run();
      for (const serviceId of parsed.data.service_ids) {
        await db
          .prepare(
            "INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)",
          )
          .bind(staffId, serviceId)
          .run();
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = Number(id);
    if (!Number.isFinite(staffId) || staffId <= 0) {
      return NextResponse.json({ error: "Invalid staff id" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db
      .prepare(
        `SELECT sp.id, sp.user_id, u.role
         FROM staff_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE sp.id = ?`,
      )
      .bind(staffId)
      .first<{ id: number; user_id: number; role: string }>();

    if (!existing) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    if (existing.role === "owner") {
      return NextResponse.json({ error: "Cannot remove the owner account." }, { status: 400 });
    }

    // Soft-remove: keep appointment history, hide from booking and PIN login.
    await db
      .prepare("UPDATE staff_profiles SET is_bookable = 0 WHERE id = ?")
      .bind(staffId)
      .run();
    await db
      .prepare("UPDATE users SET is_active = 0 WHERE id = ?")
      .bind(existing.user_id)
      .run();
    await db
      .prepare("DELETE FROM sessions WHERE user_id = ?")
      .bind(existing.user_id)
      .run();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove staff" }, { status: 500 });
  }
}
