"use client";

import { useEffect, useState } from "react";
import type { GoogleReview, GoogleReviewsMeta } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="tracking-widest text-salon-primary" aria-label={`${rating} out of 5 stars`}>
      {"★★★★★".slice(0, full)}
      <span className="opacity-30">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export function GoogleReviewsSection({
  meta,
  reviews,
}: {
  meta: GoogleReviewsMeta;
  reviews: GoogleReview[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [reviews.length]);

  if (!reviews.length) return null;

  const active = reviews[index] || reviews[0];
  const countLabel =
    meta.review_count >= 1000
      ? `${meta.review_count.toLocaleString()}+`
      : meta.review_count.toLocaleString();

  return (
    <section className="relative overflow-hidden border-y border-salon-border bg-salon-light">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, var(--salon-accent-subtle) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="fade-in grid gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">Reviews</p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">Loved by Farmington clients</h2>
            <div className="mt-8 flex flex-wrap items-end gap-6">
              <div>
                <p className="font-serif text-5xl leading-none text-salon-heading md:text-6xl">
                  {meta.rating.toFixed(1)}
                </p>
                <p className="mt-2">
                  <Stars rating={meta.rating} />
                </p>
              </div>
              <div className="pb-1 text-sm text-salon-body">
                <p className="text-base font-medium text-salon-heading">{countLabel} Google reviews</p>
              </div>
            </div>
            <a
              href={meta.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block border border-salon-border bg-salon-panel px-5 py-3 text-sm font-medium text-salon-heading transition hover:border-salon-primary"
            >
              Read reviews on Google
            </a>
          </div>

          <div className="min-h-[220px]">
            <blockquote className="fade-in border-l-2 border-salon-primary pl-6">
              <p className="font-serif text-xl leading-relaxed text-salon-heading md:text-2xl">
                &ldquo;{active.text}&rdquo;
              </p>
              <footer className="mt-6 flex flex-wrap items-center gap-3 text-sm text-salon-body">
                <span className="font-medium text-salon-heading">{active.author_name}</span>
                <Stars rating={active.rating} />
                {active.relative_time && <span>{active.relative_time}</span>}
              </footer>
            </blockquote>
            {reviews.length > 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2 w-8 transition ${
                      i === index ? "bg-salon-primary" : "bg-salon-border hover:bg-salon-primary/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
