import { getDb } from "@/lib/db";

/** Hard-to-guess desk QR path segment (not linked from the public site). */
export const DEFAULT_PRICE_LIST_SLUG = "f9k2m7xq4wp8n3c6";

export type PriceListSettings = {
  slug: string;
};

export const DEFAULT_PRICE_LIST: PriceListSettings = {
  slug: DEFAULT_PRICE_LIST_SLUG,
};

const SLUG_RE = /^[a-z0-9]{12,32}$/;

export function isValidPriceListSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

/** New unguessable slug for QR rotation after a leak. */
export function generatePriceListSlug(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

export async function getPriceListSettings(): Promise<PriceListSettings> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'price_list'")
      .first<{ value_json: string }>();
    if (!row) return DEFAULT_PRICE_LIST;
    const parsed = JSON.parse(row.value_json) as Partial<PriceListSettings>;
    const slug = (parsed.slug || "").trim().toLowerCase();
    if (!isValidPriceListSlug(slug)) return DEFAULT_PRICE_LIST;
    return { slug };
  } catch {
    return DEFAULT_PRICE_LIST;
  }
}

export function priceListPath(slug: string): string {
  return `/r/${slug}`;
}
