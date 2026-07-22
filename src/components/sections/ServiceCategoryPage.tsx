import Link from "next/link";
import { getServices } from "@/lib/site";

export default async function ServiceCategoryPage({
  title,
  category,
  intro,
}: {
  title: string;
  category: string;
  intro: string;
}) {
  const services = await getServices(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
        Services
      </p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-salon-body">{intro}</p>
      <hr className="gold-rule mt-10 max-w-xs" />

      <div className="mt-12 divide-y divide-salon-border border-y border-salon-border">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-3 py-8 md:flex-row md:items-start md:justify-between"
          >
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl">{s.name}</h2>
              {s.description && (
                <p className="mt-2 text-salon-body">{s.description}</p>
              )}
              <p className="mt-3 text-sm text-salon-body/70">
                {s.duration_minutes} min
                {s.price != null && s.price > 0 ? ` · from $${s.price}` : ""}
                {s.booking_type === "request" ? " · request to confirm" : ""}
              </p>
            </div>
            <Link
              href={`/appointments?service=${s.id}`}
              className="inline-flex min-h-12 items-center justify-center border border-salon-border px-5 text-sm font-medium text-salon-heading transition hover:border-salon-primary hover:text-salon-primary"
            >
              Book
            </Link>
          </div>
        ))}
        {services.length === 0 && (
          <p className="py-10 text-salon-body">
            Services will appear here once the database is connected.
          </p>
        )}
      </div>

      <div className="mt-12">
        <Link
          href="/appointments"
          className="bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
        >
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
