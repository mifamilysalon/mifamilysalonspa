import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

const serviceUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  category: z.string().min(2).max(60).optional(),
  description: z.string().max(2000).optional().nullable(),
  duration_minutes: z.number().int().min(5).max(480).optional(),
  price: z.number().min(0).nullable().optional(),
  booking_type: z.enum(["instant", "request"]).optional(),
  is_active: z.number().int().min(0).max(1).optional(),
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
    const serviceId = Number(id);
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = serviceUpdateSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Invalid service update" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db
      .prepare("SELECT id FROM services WHERE id = ?")
      .bind(serviceId)
      .first();

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    for (const [key, value] of Object.entries(parsed.data)) {
      fields.push(`${key} = ?`);
      values.push(value as string | number | null);
    }

    values.push(serviceId);
    await db
      .prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
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
    const serviceId = Number(id);
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .prepare("UPDATE services SET is_active = 0 WHERE id = ?")
      .bind(serviceId)
      .run();

    if (result.meta.changes === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
