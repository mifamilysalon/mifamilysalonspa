"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  BROCHURE_CATEGORY_LABELS,
  BROCHURE_CATEGORY_ORDER,
  type BrochureCategoryKey,
} from "@/lib/service-categories";
import type { Service } from "@/lib/site";
import { PrintButton } from "@/components/brochure/PrintButton";

type CategoryGroup = {
  key: string;
  label: string;
  index: number;
  services: Service[];
};

function formatPrice(price: number | null): string {
  if (price == null || price <= 0) return "Ask";
  return `$${price.toFixed(0)}`;
}

function groupByCategory(services: Service[]): CategoryGroup[] {
  const map = new Map<string, Service[]>();
  for (const s of services) {
    const key = (BROCHURE_CATEGORY_LABELS as Record<string, string>)[s.category]
      ? s.category
      : "wellness";
    const list = map.get(key) || [];
    list.push(s);
    map.set(key, list);
  }
  const ordered = [
    ...BROCHURE_CATEGORY_ORDER,
    ...[...map.keys()].filter(
      (k) => !BROCHURE_CATEGORY_ORDER.includes(k as BrochureCategoryKey),
    ),
  ];
  return ordered
    .filter((c) => map.has(c))
    .map((c, index) => ({
      key: c,
      label:
        (BROCHURE_CATEGORY_LABELS as Record<string, string>)[c] || c,
      index: index + 1,
      services: map.get(c)!,
    }));
}

function ServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="brochure-list">
      {services.map((s) => (
        <li key={s.id} className="brochure-row">
          <div className="brochure-row-main">
            <p className="brochure-service-name">{s.name}</p>
            {s.description ? (
              <p className="brochure-service-desc">{s.description}</p>
            ) : null}
            <p className="brochure-service-meta">
              <span>{s.duration_minutes} min</span>
              {s.booking_type === "request" ? (
                <span>Request to confirm</span>
              ) : null}
            </p>
          </div>
          <p className="brochure-price">{formatPrice(s.price)}</p>
        </li>
      ))}
    </ul>
  );
}

export function PriceBrochure({
  salonName,
  services,
}: {
  salonName: string;
  services: Service[];
}) {
  const groups = useMemo(() => groupByCategory(services), [services]);
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? "");
  const tablistId = useId();

  useEffect(() => {
    if (!groups.some((g) => g.key === activeKey) && groups[0]) {
      setActiveKey(groups[0].key);
    }
  }, [activeKey, groups]);

  const active = groups.find((g) => g.key === activeKey) ?? groups[0];

  return (
    <div className="brochure-shell">
      <div className="brochure-atmosphere" aria-hidden />

      <header className="brochure-hero fade-in">
        <p className="brochure-kicker">In salon / Farmington</p>
        <h1 className="brochure-brand">{salonName}</h1>
        <p className="brochure-lede">
          Current rates. Length, texture, and add-ons may adjust the final
          amount - your stylist confirms before we begin.
        </p>
        <div className="brochure-hero-actions print:hidden">
          <PrintButton label="Print rates" />
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="brochure-empty">No services listed yet.</p>
      ) : (
        <>
          <div className="brochure-menu print:hidden" key={active?.key}>
            {active ? (
              <section
                className="brochure-chapter fade-in"
                id={active.key}
                aria-labelledby={`${tablistId}-${active.key}-label`}
              >
                <header className="brochure-chapter-head">
                  <span className="brochure-chapter-index" aria-hidden>
                    {String(active.index).padStart(2, "0")}
                  </span>
                  <h2
                    className="brochure-chapter-title"
                    id={`${tablistId}-${active.key}-label`}
                  >
                    {active.label}
                  </h2>
                </header>
                <ServiceList services={active.services} />
              </section>
            ) : null}
          </div>

          <div className="brochure-menu brochure-menu-print" aria-hidden="true">
            {groups.map((group) => (
              <section
                key={group.key}
                className="brochure-chapter break-inside-avoid"
                id={`print-${group.key}`}
              >
                <header className="brochure-chapter-head">
                  <span className="brochure-chapter-index" aria-hidden>
                    {String(group.index).padStart(2, "0")}
                  </span>
                  <h2 className="brochure-chapter-title">{group.label}</h2>
                </header>
                <ServiceList services={group.services} />
              </section>
            ))}
          </div>

          <nav
            className="brochure-tabs print:hidden"
            aria-label="Service categories"
          >
            <div className="brochure-tabs-inner" role="tablist">
              {groups.map((group) => {
                const selected = group.key === active?.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    role="tab"
                    id={`${tablistId}-${group.key}`}
                    aria-selected={selected}
                    aria-controls={group.key}
                    className={`brochure-tab${selected ? " is-active" : ""}`}
                    onClick={() => {
                      setActiveKey(group.key);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span className="brochure-tab-index" aria-hidden>
                      {String(group.index).padStart(2, "0")}
                    </span>
                    <span className="brochure-tab-label">{group.label}</span>
                    <span className="brochure-tab-count">
                      {group.services.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      )}

      <p className="brochure-closing fade-in print:hidden">
        Questions about a service or package? Ask at the front desk.
      </p>
    </div>
  );
}
