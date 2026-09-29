import Link from "next/link";

/** Light local / salon facts for a friendlier 404. Stable pick per calendar day. */
const FUN_FACTS = [
  "Farmington sits on historic Grand River Avenue, one of Michigan's oldest continuous roads.",
  "Hair grows about half an inch a month on average, which is why regular trims keep ends looking fresh.",
  "A classic manicure is not only polish. Cuticle care and shaping do most of the tidy work.",
  "Threading can shape brows with precision and is a favorite for guests who prefer less heat than waxing.",
  "Farmington and Farmington Hills are neighbors, so many Metro Detroit guests visit from both cities.",
  "Keratin and straightening visits take longer than a quick cut because chemistry needs time to work.",
  "Shellac manicures usually last longer than regular polish when applied and cured correctly.",
  "A private suite appointment is simply a quieter setting. Ask when you book if you prefer one.",
  "Walk-ins are common for shorter services, while color and bridal looks are usually booked ahead.",
  "Facials often start with a skin check so the therapist can match the treatment to your skin that day.",
  "Henna designs for hands can take longer than you expect. Bridal henna is planned well in advance.",
  "Grand River Ave has been a Farmington corridor since the town's early days in the 1800s.",
] as const;

function factForToday(): string {
  const day = Math.floor(Date.now() / 86_400_000);
  return FUN_FACTS[day % FUN_FACTS.length]!;
}

export default function NotFound() {
  const fact = factForToday();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center md:px-6">
      <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">404</p>
      <h1 className="mt-3 font-serif text-4xl text-salon-heading md:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-5 max-w-md text-salon-body">
        The page may have moved, or the link might be outdated. While you are here,
        here is a quick Farmington salon fact:
      </p>
      <blockquote className="mt-8 max-w-lg border border-salon-border bg-salon-panel px-6 py-5 text-left text-salon-heading">
        <p className="text-xs uppercase tracking-[0.14em] text-salon-primary">
          Did you know?
        </p>
        <p className="mt-3 font-serif text-lg leading-relaxed">{fact}</p>
      </blockquote>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/hair-care"
          className="inline-flex min-h-12 items-center bg-salon-primary px-6 text-sm font-medium text-white hover:bg-salon-hover"
        >
          View services
        </Link>
        <Link
          href="/appointments"
          className="inline-flex min-h-12 items-center border border-salon-border px-6 text-sm font-medium text-salon-heading hover:border-salon-primary"
        >
          Book an appointment
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center px-6 text-sm font-medium text-salon-primary underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
