import Link from "next/link";
import type { Promo } from "@/lib/promos-shared";
import { formatPromoDate } from "@/lib/promos-shared";

export function PromoBanner({ promo }: { promo: Promo }) {
  const ctaHref = promo.cta_href?.trim() || "";
  const ctaLabel = promo.cta_label?.trim() || "";
  const isExternal =
    ctaHref.startsWith("http://") ||
    ctaHref.startsWith("https://") ||
    ctaHref.startsWith("tel:");

  return (
    <section className="border-b border-salon-border bg-salon-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-salon-primary">
            Current offer · through {formatPromoDate(promo.ends_at)}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-salon-heading md:text-3xl">
            {promo.title}
          </h2>
          {promo.body ? (
            <p className="mt-2 max-w-2xl text-salon-body">{promo.body}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {ctaHref && ctaLabel ? (
            isExternal ? (
              <a
                href={ctaHref}
                className="inline-flex min-h-12 items-center bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover"
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaHref}
                className="inline-flex min-h-12 items-center bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover"
              >
                {ctaLabel}
              </Link>
            )
          ) : null}
          <Link
            href="/offers"
            className="inline-flex min-h-12 items-center border border-salon-border px-5 text-sm font-medium text-salon-heading hover:border-salon-primary hover:text-salon-primary"
          >
            All offers
          </Link>
        </div>
      </div>
    </section>
  );
}
