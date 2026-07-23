import { SITE_FAQS, buildFaqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export function FaqSection({
  faqs = SITE_FAQS,
  title = "Common questions",
  includeSchema = true,
}: {
  faqs?: Array<{ question: string; answer: string }>;
  title?: string;
  includeSchema?: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20" aria-labelledby="faq-heading">
      {includeSchema && <JsonLd data={buildFaqJsonLd(faqs)} />}
      <h2 id="faq-heading" className="font-serif text-3xl md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-salon-body">
        Straight answers for Farmington clients planning a visit, walk-in, or private-suite appointment.
      </p>
      <dl className="mt-10 divide-y divide-salon-border border-y border-salon-border">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-6">
            <dt className="font-serif text-xl text-salon-heading">{faq.question}</dt>
            <dd className="mt-3 max-w-3xl text-salon-body">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
