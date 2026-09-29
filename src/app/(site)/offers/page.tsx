import type { Metadata } from "next";
import Link from "next/link";
import { formatPromoDate } from "@/lib/promos-shared";
import { getActivePromos } from "@/lib/promos";
import { buildPageMetadata } from "@/lib/seo";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Current Offers in Farmington, MI",
  description:
    "Current promotions and specials at Family Hair Salon & Wellness Spa in Farmington, MI. Check back for seasonal offers or call the salon.",
  path: "/offers",
});

export default async function OffersPage() {
  const [promos, business] = await Promise.all([
    getActivePromos({ placement: "list" }),
    getBusinessInfo(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
        Specials
      </p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Current offers</h1>
      <p className="mt-6 text-lg text-salon-body">
        Time-limited promotions from the salon. Ask at the desk for details when
        you book.
      </p>

      {promos.length === 0 ? (
        <div className="mt-12 border-t border-salon-border pt-10">
          <h2 className="font-serif text-2xl text-salon-heading">
            No current specials
          </h2>
          <p className="mt-4 text-salon-body">
            We don&apos;t have a published special right now. Check back for
            seasonal offers, or contact us to ask about current services.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/appointments"
              className="inline-flex min-h-12 items-center bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover"
            >
              Book an appointment
            </Link>
            <a
              href={`tel:${business.phone_primary.replace(/\D/g, "")}`}
              className="inline-flex min-h-12 items-center border border-salon-border px-5 text-sm font-medium text-salon-heading hover:border-salon-primary"
            >
              Call {business.phone_primary}
            </a>
          </div>
        </div>
      ) : (
        <ul className="mt-12 space-y-10">
          {promos.map((promo) => {
            const ctaHref = promo.cta_href?.trim() || "";
            const ctaLabel = promo.cta_label?.trim() || "";
            const isExternal =
              ctaHref.startsWith("http://") ||
              ctaHref.startsWith("https://") ||
              ctaHref.startsWith("tel:");

            return (
              <li
                key={promo.id}
                className="border-t border-salon-border pt-10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salon-primary">
                  Through {formatPromoDate(promo.ends_at)}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-salon-heading md:text-3xl">
                  {promo.title}
                </h2>
                {promo.body ? (
                  <p className="mt-3 text-salon-body">{promo.body}</p>
                ) : null}
                {ctaHref && ctaLabel ? (
                  isExternal ? (
                    <a
                      href={ctaHref}
                      className="mt-5 inline-flex min-h-12 items-center bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover"
                    >
                      {ctaLabel}
                    </a>
                  ) : (
                    <Link
                      href={ctaHref}
                      className="mt-5 inline-flex min-h-12 items-center bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover"
                    >
                      {ctaLabel}
                    </Link>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
