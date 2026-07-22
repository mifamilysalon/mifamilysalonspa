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

/** Official multicolor Google "G" mark */
function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
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
            <div className="flex items-center gap-2.5">
              <GoogleMark />
              <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">Reviews</p>
            </div>
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
                <p className="text-base font-medium text-salon-heading">{countLabel} reviews</p>
              </div>
            </div>
            <a
              href={meta.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 border border-salon-border bg-salon-panel px-5 py-3 text-sm font-medium text-salon-heading transition hover:border-salon-primary"
            >
              <GoogleMark />
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
