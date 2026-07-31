import type { Metadata } from "next";
import { PrintButton } from "@/components/brochure/PrintButton";
import { getServices, type Service } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service price list",
  description: "In-salon service rates for Family Hair Salon & Wellness Spa.",
  robots: { index: false, follow: false, nocache: true },
};

const CATEGORY_ORDER = ["hair", "skin", "nails", "wellness", "other"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  hair: "Hair care",
  skin: "Skin care",
  nails: "Nail care",
  wellness: "Wellness",
  other: "Other services",
};

function formatPrice(price: number | null): string {
  if (price == null || price <= 0) return "Ask at desk";
  return `$${price.toFixed(0)}`;
}

function groupByCategory(services: Service[]) {
  const map = new Map<string, Service[]>();
  for (const s of services) {
    const key = CATEGORY_LABELS[s.category] ? s.category : "other";
    const list = map.get(key) || [];
    list.push(s);
    map.set(key, list);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
    key: c,
    label: CATEGORY_LABELS[c],
    services: map.get(c)!,
  }));
}

export default async function MenuBrochurePage() {
  const services = await getServices();
  const groups = groupByCategory(services);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 print:mb-6">
        <div>
          <h1 className="font-serif text-3xl text-salon-heading md:text-4xl">
            Service menu
          </h1>
          <p className="mt-2 max-w-xl text-salon-body">
            Current rates for guests at the salon. Prices may vary with length,
            complexity, or add-ons — your stylist will confirm before starting.
          </p>
        </div>
        <PrintButton />
      </div>

      {groups.length === 0 ? (
        <p className="text-salon-body">No services listed yet.</p>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.key} className="break-inside-avoid">
              <h2 className="border-b border-salon-border pb-3 font-serif text-2xl text-salon-heading">
                {group.label}
              </h2>
              <ul className="mt-2 divide-y divide-salon-border">
                {group.services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-baseline justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-salon-heading">{s.name}</p>
                      {s.description && (
                        <p className="mt-1 text-sm text-salon-body">{s.description}</p>
                      )}
                      <p className="mt-1 text-xs text-salon-body/70">
                        {s.duration_minutes} min
                        {s.booking_type === "request" ? " · request to confirm" : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-serif text-xl tabular-nums text-salon-heading">
                      {formatPrice(s.price)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 border-t border-salon-border pt-6 text-sm text-salon-body">
        Thank you for visiting. Ask the front desk if you have questions about a
        service or package.
      </p>
    </div>
  );
}
