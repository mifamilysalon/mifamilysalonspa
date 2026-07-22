import Link from "next/link";
import Image from "next/image";

export function HeroSection({
  headline,
  subhead,
  image,
  ctaPrimary,
  ctaPrimaryHref,
  ctaSecondary,
  ctaSecondaryHref,
}: {
  headline: string;
  subhead: string;
  image: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
}) {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      <Image
        src={image}
        alt="Salon interior and styling atmosphere"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
        <div className="fade-in max-w-2xl text-white">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/80">
            Farmington, Michigan
          </p>
          <h1 className="font-serif text-4xl leading-tight text-white md:text-6xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/90 md:text-lg">{subhead}</p>
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
                className="border border-white/70 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
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
