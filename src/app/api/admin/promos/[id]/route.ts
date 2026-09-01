import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { deletePromo, getPromo, updatePromo } from "@/lib/promos";

const promoSchema = z.object({
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().max(2000).optional().default(""),
  cta_label: z.string().trim().max(80).optional().nullable(),
  cta_href: z.string().trim().max(300).optional().nullable(),
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  placement: z.enum(["banner", "list", "both"]).optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const promo = await getPromo(id);
    if (!promo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ promo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load promo" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = promoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid promo data" },
        { status: 400 },
      );
    }

    const promo = await updatePromo(id, {
      ...parsed.data,
      cta_label: parsed.data.cta_label || null,
      cta_href: parsed.data.cta_href || null,
    });

    return NextResponse.json({ promo });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to update promo";
    const status = message === "Not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await deletePromo(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to delete promo";
    const status = message === "Not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
