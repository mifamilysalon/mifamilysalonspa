"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  BROCHURE_CATEGORY_LABELS,
  BROCHURE_CATEGORY_ORDER,
  type BrochureCategoryKey,
} from "@/lib/service-categories";
import type { BusinessInfo, Service } from "@/lib/site";
import { formatHoursLines } from "@/lib/site";
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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hr = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hr} hr ${rem} min` : `${hr} hr`;
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
      label: (BROCHURE_CATEGORY_LABELS as Record<string, string>)[c] || c,
      index: index + 1,
      services: map.get(c)!,
    }));
}

function ServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="brochure-list">
      {services.map((s) => (
        <li key={s.id} className="brochure-row">
          <span className="brochure-service-name">{s.name}</span>
          <span className="brochure-leader" aria-hidden />
          <span className="brochure-duration">
            {formatDuration(s.duration_minutes)}
          </span>
          <span className="brochure-price">{formatPrice(s.price)}</span>
        </li>
      ))}
    </ul>
  );
}

export function PriceBrochure({
  salonName,
  services,
  business,
}: {
  salonName: string;
  services: Service[];
  business: BusinessInfo;
}) {
  const groups = useMemo(() => groupByCategory(services), [services]);
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? "");
  const tablistId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);
  const phonePrimaryDigits = business.phone_primary.replace(/\D/g, "");
  const phoneSecondaryDigits = business.phone_secondary.replace(/\D/g, "");
  const hoursLines = formatHoursLines(business.hours);

  useEffect(() => {
    if (!groups.length) return;

    const sections = groups
      .map((g) => document.getElementById(`brochure-${g.key}`))
      .filter((el): el is HTMLElement => !!el);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id.replace(/^brochure-/, "");
          setActiveKey(id);
          const tab = tabsRef.current?.querySelector<HTMLElement>(
            `[data-brochure-tab="${id}"]`,
          );
          if (tab && tabsRef.current) {
            tabsRef.current.scrollTo({
              left: Math.max(0, tab.offsetLeft - 24),
              behavior: "smooth",
            });
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <div className="brochure-shell">
      <header className="brochure-hero">
        <p className="brochure-kicker">In salon · Farmington</p>
        <h1 className="brochure-brand">{salonName}</h1>
        <div className="brochure-hero-bar" aria-hidden />
        <p className="brochure-lede">
          Hair, skin, nails, and wellness under one roof. Walk-ins welcome.
        </p>
        <div className="brochure-hero-actions print:hidden">
          <a className="brochure-btn" href={`tel:${phonePrimaryDigits}`}>
            Call {business.phone_primary}
          </a>
          <PrintButton label="Print rates" />
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="brochure-empty">No services listed yet.</p>
      ) : (
        <>
          <nav
            className="brochure-tabs print:hidden"
            aria-label="Service categories"
          >
            <div
              className="brochure-tabs-inner"
              ref={tabsRef}
              id={tablistId}
            >
              {groups.map((group) => {
                const selected = group.key === activeKey;
                return (
                  <a
                    key={group.key}
                    href={`#brochure-${group.key}`}
                    data-brochure-tab={group.key}
                    className={`brochure-tab${selected ? " is-active" : ""}`}
                    aria-current={selected ? "true" : undefined}
                  >
                    {group.label}
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="brochure-body">
            <p className="brochure-note">
              Current rates. Length, texture, and add-ons may change the final
              amount. Your stylist will confirm the price before we begin.
            </p>

            <div className="brochure-menu">
              {groups.map((group) => (
                <section
                  key={group.key}
                  className="brochure-chapter"
                  id={`brochure-${group.key}`}
                  aria-labelledby={`${tablistId}-${group.key}-label`}
                >
                  <h2
                    className="brochure-chapter-title"
                    id={`${tablistId}-${group.key}-label`}
                  >
                    <span className="brochure-chapter-index" aria-hidden>
                      {String(group.index).padStart(2, "0")}
                    </span>
                    {group.label}
                  </h2>
                  <p className="brochure-chapter-count">
                    {group.services.length}{" "}
                    {group.services.length === 1 ? "service" : "services"}
                  </p>
                  <ServiceList services={group.services} />
                </section>
              ))}
            </div>
          </div>
        </>
      )}

      <footer className="brochure-footer">
        <div className="brochure-footer-grid">
          <div>
            <b className="brochure-footer-label">{salonName}</b>
            <p>{business.address}</p>
          </div>
          <div>
            <b className="brochure-footer-label">Call us</b>
            <p>
              <a href={`tel:${phonePrimaryDigits}`}>{business.phone_primary}</a>
              <br />
              <a href={`tel:${phoneSecondaryDigits}`}>
                {business.phone_secondary}
              </a>
            </p>
          </div>
          <div>
            <b className="brochure-footer-label">Hours</b>
            {hoursLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </footer>

      <nav className="brochure-sticky print:hidden" aria-label="Quick actions">
        <a href={`tel:${phonePrimaryDigits}`}>Call</a>
        <Link href="/appointments" className="brochure-sticky-book">
          Book
        </Link>
      </nav>
    </div>
  );
}
