import Link from "next/link";
import { getBusinessInfo } from "@/lib/site";

/** Minimal chrome for desk QR price brochure — not linked from the public site. */
export default async function BrochureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessInfo();

  return (
    <div className="min-h-screen bg-salon-bg text-salon-body">
      <header className="border-b border-salon-border bg-salon-panel">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5 md:px-6">
          <div>
            <p className="font-serif text-xl text-salon-heading md:text-2xl">
              {business.name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-salon-body">
              In-salon price list
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-salon-primary underline-offset-4 hover:underline"
          >
            Main website
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-salon-border px-4 py-8 text-center text-sm text-salon-body">
        <p>{business.address}</p>
        <p className="mt-1">
          {business.phone_primary} · {business.phone_secondary}
        </p>
        <p className="mt-3 text-xs text-salon-body/70">{business.hours}</p>
      </footer>
    </div>
  );
}
