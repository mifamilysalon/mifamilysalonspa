export type PromoPlacement = "banner" | "list" | "both";

export type Promo = {
  id: number;
  title: string;
  body: string;
  cta_label: string | null;
  cta_href: string | null;
  starts_at: string;
  ends_at: string;
  is_active: number;
  is_featured: number;
  placement: PromoPlacement;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PromoInput = {
  title: string;
  body?: string;
  cta_label?: string | null;
  cta_href?: string | null;
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
  is_featured?: boolean;
  placement?: PromoPlacement;
  sort_order?: number;
};

export function formatPromoDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
