import Link from "next/link";
import Image from "next/image";
import { IllustrationPanel } from "@/components/illustrations";
import { heroToneFilter, type HeroToneId } from "@/lib/media";

export function HeroSection({
  headline,
  subhead,
  image,
  tone = "color",
  ctaPrimary,
  ctaPrimaryHref,
  ctaSecondary,
  ctaSecondaryHref,
  illustrated = true,
}: {
  headline: string;
  subhead: string;
  image?: string;
  tone?: HeroToneId;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
  illustrated?: boolean;
}) {
  const usePhoto = !illustrated && Boolean(image);

  if (usePhoto && image) {
    return (
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            style={{ filter: heroToneFilter(tone) }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                tone === "color"
                  ? "linear-gradient(105deg, rgba(12,10,9,0.52) 0%, rgba(12,10,9,0.28) 48%, rgba(12,10,9,0.08) 100%)"
                  : "linear-gradient(105deg, rgba(12,10,9,0.78) 0%, rgba(12,10,9,0.58) 42%, rgba(12,10,9,0.28) 100%)",
            }}
          />
        </div>
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
          <div className="fade-in max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/85">
              Farmington, Michigan
            </p>
            <h1 className="hero-brand-title font-serif text-4xl leading-tight md:text-6xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/92 md:text-lg">
              {subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaPrimaryHref}
                className="bg-salon-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-salon-hover"
              >
                {ctaPrimary}
              </Link>
              {ctaSecondary && ctaSecondaryHref && (
                <a
                  href={ctaSecondaryHref}
                  className="border border-white/75 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {ctaSecondary}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* Illustrated hero: text left (always dark/readable), scene right — no fade wash */
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-8 px-4 pb-16 pt-28 md:grid-cols-2 md:gap-10 md:px-6 md:pb-20 md:pt-24">
        <div className="fade-in relative z-10 order-2 md:order-1">
          <p className="hero-illustrated-kicker mb-4 text-sm uppercase tracking-[0.2em]">
            Farmington, Michigan
          </p>
          <h1 className="hero-illustrated-title font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="hero-illustrated-body mt-5 max-w-xl text-base md:text-lg">
            {subhead}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ctaPrimaryHref}
              className="bg-salon-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-salon-hover"
            >
              {ctaPrimary}
            </Link>
            {ctaSecondary && ctaSecondaryHref && (
              <a
                href={ctaSecondaryHref}
                className="hero-illustrated-ghost border px-6 py-3 text-sm font-medium transition"
              >
                {ctaSecondary}
              </a>
            )}
          </div>
        </div>
        <div className="order-1 fade-in md:order-2">
          <IllustrationPanel
            id="hero"
            aspect="16/9"
            priority
            title="Stylist cutting hair in the salon"
            objectPosition="center center"
          />
        </div>
      </div>
    </section>
  );
}
