import Link from "next/link";
import {
  IllustrationPanel,
  illustrationForService,
  type IllustrationId,
} from "@/components/illustrations";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { getServices } from "@/lib/site";

const CATEGORY_ART: Record<string, IllustrationId> = {
  hair: "hair",
  skin: "facial",
  facials: "facial",
  nails: "nails",
  threading: "face-mapping",
  waxing: "wax",
  lashes: "facial",
  makeup: "wash",
  henna: "polish",
  wellness: "wellness",
};

export default async function ServiceCategoryPage({
  title,
  category,
  intro,
  path,
}: {
  title: string;
  category: string;
  intro: string;
  path?: string;
}) {
  const services = await getServices(category);
  const artId = CATEGORY_ART[category] || "interior";
  const pagePath = path || `/${category === "hair" ? "hair-care" : category === "nails" ? "nail-care" : category === "skin" ? "skin-care" : category}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${title} at ${SITE_NAME}`,
    description: intro,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: {
      "@type": "City",
      name: "Farmington, MI",
    },
    url: absoluteUrl(pagePath),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: title, path: pagePath },
          ]),
          serviceSchema,
        ]}
      />
      <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
            Services
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-salon-body">{intro}</p>
          <hr className="gold-rule mt-10 max-w-xs" />
        </div>
        <IllustrationPanel id={artId} title={title} />
      </div>

      <div className="mt-12 space-y-10">
        {services.map((s) => {
          const sid = illustrationForService(s.id, s.category, s.name);
          return (
            <article
              key={s.id}
              className="grid items-center gap-6 border-t border-salon-border pt-10 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-8"
            >
              <div className="min-w-0">
                <h2 className="font-serif text-2xl text-salon-heading">{s.name}</h2>
                {s.description && (
                  <p className="mt-2 text-salon-body">{s.description}</p>
                )}
                <p className="mt-3 text-sm text-salon-body/70">
                  {s.duration_minutes} min
                  {s.booking_type === "request" ? " · request to confirm" : ""}
                </p>
                <Link
                  href={`/appointments?service=${s.id}`}
                  className="mt-5 inline-flex min-h-12 items-center justify-center border border-salon-border px-5 text-sm font-medium text-salon-heading transition hover:border-salon-primary hover:text-salon-primary"
                >
                  Book
                </Link>
              </div>
              <IllustrationPanel
                id={sid}
                title={s.name}
                aspect="4/3"
                className="w-full max-w-xs md:max-w-none"
              />
            </article>
          );
        })}
        {services.length === 0 && (
          <p className="border-t border-salon-border py-10 text-salon-body">
            No services are listed in this category right now. Call us or{" "}
            <Link
              href="/appointments"
              className="text-salon-heading underline underline-offset-4 hover:text-salon-primary"
            >
              request an appointment
            </Link>{" "}
            and we can help you choose.
          </p>
        )}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-salon-border pt-10">
        <Link
          href="/appointments"
          className="bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
        >
          Book an appointment
        </Link>
        <p className="text-sm text-salon-body">
          Current rates are available in the salon. Ask at the desk for our pricing brochure.
        </p>
      </div>
    </div>
  );
}
