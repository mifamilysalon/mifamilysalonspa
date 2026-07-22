import Link from "next/link";
import Image from "next/image";
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
}: {
  headline: string;
  subhead: string;
  image: string;
  tone?: HeroToneId;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
}) {
  // Full color needs a much lighter wash so pinks/warms stay visible
  const overlay =
    tone === "color"
      ? "linear-gradient(105deg, rgba(12,10,9,0.52) 0%, rgba(12,10,9,0.28) 48%, rgba(12,10,9,0.08) 100%)"
      : "linear-gradient(105deg, rgba(12,10,9,0.78) 0%, rgba(12,10,9,0.58) 42%, rgba(12,10,9,0.28) 100%)";

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Salon interior and styling atmosphere"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          style={{ filter: heroToneFilter(tone) }}
        />
      </div>
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
        <div className="fade-in max-w-2xl">
          <p
            className="mb-4 text-sm uppercase tracking-[0.2em]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Farmington, Michigan
          </p>
          <h1 className="hero-brand-title font-serif text-4xl leading-tight md:text-6xl">
            {headline}
          </h1>
          <p
            className="mt-5 max-w-xl text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
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
                className="border px-6 py-3 text-sm font-medium transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.75)", color: "#FFFFFF" }}
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
