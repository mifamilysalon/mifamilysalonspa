"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/hair-care", label: "Hair Care" },
  { href: "/skin-care", label: "Skin Care" },
  { href: "/nail-care", label: "Nail Care" },
  { href: "/wellness", label: "Wellness" },
  { href: "/private-area", label: "Private Suite" },
  { href: "/gallery", label: "Gallery" },
  { href: "/gift-certificates", label: "Gift Certificates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  phone,
  salonName,
}: {
  phone: string;
  salonName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-salon-border bg-salon-bg/95 backdrop-blur-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="font-serif text-xl text-salon-heading md:text-2xl">
          {salonName}
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-sm text-salon-body hover:text-salon-primary"
          >
            {phone}
          </a>
          <Link
            href="/appointments"
            className="bg-salon-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-salon-hover"
          >
            Book an appointment
          </Link>
        </div>

        <button
          type="button"
          className="flex min-h-12 min-w-12 items-center justify-center border border-salon-border lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-5 flex-col gap-1.5">
            <span className="block h-px bg-salon-heading" />
            <span className="block h-px bg-salon-heading" />
            <span className="block h-px bg-salon-heading" />
          </div>
        </button>
      </div>

      <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 pb-3 lg:flex lg:px-6">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap px-3 py-1.5 text-sm text-salon-body transition hover:text-salon-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {open && (
        <div className="border-t border-salon-border bg-salon-panel lg:hidden">
          <nav className="flex flex-col px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-12 border-b border-salon-border py-3 text-base text-salon-heading"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/appointments"
              className="mt-4 bg-salon-primary py-3 text-center text-white"
              onClick={() => setOpen(false)}
            >
              Book an appointment
            </Link>
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="mt-2 py-3 text-center text-salon-body"
            >
              Call {phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
