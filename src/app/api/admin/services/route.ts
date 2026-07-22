import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { Service } from "@/lib/site";

const serviceCreateSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  description: z.string().max(2000).optional().nullable(),
  duration_minutes: z.number().int().min(5).max(480),
  price: z.number().min(0).nullable().optional(),
  booking_type: z.enum(["instant", "request"]),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const res = await db
      .prepare("SELECT * FROM services ORDER BY category, name")
      .all<Service>();

    return NextResponse.json({ services: res.results || [] });
  } catch {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = serviceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid service data" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .prepare(
        `INSERT INTO services (name, category, description, duration_minutes, price, booking_type, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
      )
      .bind(
        parsed.data.name,
        parsed.data.category,
        parsed.data.description ?? null,
        parsed.data.duration_minutes,
        parsed.data.price ?? null,
        parsed.data.booking_type,
      )
      .run();

    return NextResponse.json(
      { id: Number(result.meta.last_row_id) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
