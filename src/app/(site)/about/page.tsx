import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const business = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">About us</h1>
      <p className="mt-8 text-lg text-salon-body">
        {business.name} serves clients at {business.address}. We provide hair,
        skin, nail, and wellness services, plus a private suite for women who
        prefer complete privacy.
      </p>
      <p className="mt-5 text-salon-body">
        Call {business.phone_primary} or {business.phone_secondary} to speak
        with our team, or book online when you are ready.
      </p>
      <Link
        href="/appointments"
        className="mt-10 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
      >
        Book an appointment
      </Link>
    </div>
  );
}
