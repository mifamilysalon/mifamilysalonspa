import { getDb } from "./db";
import type { Promo, PromoInput, PromoPlacement } from "./promos-shared";

export type { Promo, PromoInput, PromoPlacement } from "./promos-shared";
export { formatPromoDate } from "./promos-shared";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPlacement(
  value: string | null | undefined,
): value is PromoPlacement {
  return value === "banner" || value === "list" || value === "both";
}

export async function listPromos(): Promise<Promo[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM promos
       ORDER BY is_active DESC, sort_order ASC, starts_at DESC, id DESC`,
    )
    .all<Promo>();
  return res.results || [];
}

export async function getPromo(id: number): Promise<Promo | null> {
  const db = await getDb();
  return (
    (await db
      .prepare("SELECT * FROM promos WHERE id = ?")
      .bind(id)
      .first<Promo>()) || null
  );
}

/** Public: active + within date window. */
export async function getActivePromos(opts?: {
  placement?: PromoPlacement | "any";
}): Promise<Promo[]> {
  try {
    const db = await getDb();
    const today = todayIso();
    const placement = opts?.placement || "any";

    let sql = `
      SELECT * FROM promos
      WHERE is_active = 1
        AND starts_at <= ?
        AND ends_at >= ?
    `;
    const binds: string[] = [today, today];

    if (placement === "banner") {
      sql += ` AND placement IN ('banner', 'both')`;
    } else if (placement === "list") {
      sql += ` AND placement IN ('list', 'both')`;
    }

    sql += ` ORDER BY is_featured DESC, sort_order ASC, starts_at DESC, id DESC`;

    const res = await db.prepare(sql).bind(...binds).all<Promo>();
    return res.results || [];
  } catch {
    return [];
  }
}

/** Primary homepage banner: featured first, else first active banner promo. */
export async function getFeaturedBannerPromo(): Promise<Promo | null> {
  const promos = await getActivePromos({ placement: "banner" });
  return promos[0] || null;
}

export async function createPromo(input: PromoInput): Promise<Promo> {
  if (input.ends_at < input.starts_at) {
    throw new Error("End date must be on or after start date");
  }
  const placement = input.placement || "both";
  if (!isPlacement(placement)) throw new Error("Invalid placement");

  const db = await getDb();
  if (input.is_featured) {
    await db
      .prepare("UPDATE promos SET is_featured = 0, updated_at = datetime('now')")
      .run();
  }

  const result = await db
    .prepare(
      `INSERT INTO promos (
        title, body, cta_label, cta_href, starts_at, ends_at,
        is_active, is_featured, placement, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.title.trim(),
      (input.body || "").trim(),
      input.cta_label?.trim() || null,
      input.cta_href?.trim() || null,
      input.starts_at,
      input.ends_at,
      input.is_active === false ? 0 : 1,
      input.is_featured ? 1 : 0,
      placement,
      input.sort_order ?? 0,
    )
    .run();

  const id = Number(result.meta.last_row_id);
  const row = await getPromo(id);
  if (!row) throw new Error("Failed to create promo");
  return row;
}

export async function updatePromo(
  id: number,
  input: PromoInput,
): Promise<Promo> {
  if (input.ends_at < input.starts_at) {
    throw new Error("End date must be on or after start date");
  }
  const placement = input.placement || "both";
  if (!isPlacement(placement)) throw new Error("Invalid placement");

  const existing = await getPromo(id);
  if (!existing) throw new Error("Not found");

  const db = await getDb();
  if (input.is_featured) {
    await db
      .prepare(
        "UPDATE promos SET is_featured = 0, updated_at = datetime('now') WHERE id != ?",
      )
      .bind(id)
      .run();
  }

  await db
    .prepare(
      `UPDATE promos SET
        title = ?,
        body = ?,
        cta_label = ?,
        cta_href = ?,
        starts_at = ?,
        ends_at = ?,
        is_active = ?,
        is_featured = ?,
        placement = ?,
        sort_order = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      input.title.trim(),
      (input.body || "").trim(),
      input.cta_label?.trim() || null,
      input.cta_href?.trim() || null,
      input.starts_at,
      input.ends_at,
      input.is_active === false ? 0 : 1,
      input.is_featured ? 1 : 0,
      placement,
      input.sort_order ?? existing.sort_order,
      id,
    )
    .run();

  const row = await getPromo(id);
  if (!row) throw new Error("Not found after update");
  return row;
}

export async function deletePromo(id: number): Promise<void> {
  const db = await getDb();
  const result = await db
    .prepare("DELETE FROM promos WHERE id = ?")
    .bind(id)
    .run();
  if (!result.meta.changes) throw new Error("Not found");
}
