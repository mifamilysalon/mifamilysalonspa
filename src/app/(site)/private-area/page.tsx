import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Private Women's Suite" };

export default function PrivateAreaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
        Privacy
      </p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">
        Private women&apos;s suite
      </h1>
      <p className="mt-8 text-lg text-salon-body">
        A private area has been created to cater to our female clientele. This
        area was designed to accommodate women who require or prefer services in
        a complete private setting, such as women who wear hijab.
      </p>
      <p className="mt-5 text-salon-body">
        Ask for the private suite when you book. We will schedule a time that
        fits your needs.
      </p>
      <Link
        href="/appointments?service=15"
        className="mt-10 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
      >
        Request private suite booking
      </Link>
    </div>
  );
}
