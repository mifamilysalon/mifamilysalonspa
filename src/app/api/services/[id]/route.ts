import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Service } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const serviceId = Number(id);
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
    }

    const db = await getDb();
    const service = await db
      .prepare("SELECT * FROM services WHERE id = ? AND is_active = 1")
      .bind(serviceId)
      .first<Service>();

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const { price, ...publicService } = service;
    void price;
    return NextResponse.json({ service: publicService });
  } catch {
    return NextResponse.json({ error: "Failed to load service" }, { status: 500 });
  }
}
