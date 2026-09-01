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
    <div className="brochure-root min-h-screen text-salon-body">
      <div className="print:hidden brochure-topbar">
        <Link href="/" className="brochure-site-link">
          Main website
        </Link>
      </div>
      <main>{children}</main>
      <footer className="brochure-footer">
        <p className="brochure-footer-address">{business.address}</p>
        <p className="brochure-footer-phones">
          <a href={`tel:${business.phone_primary.replace(/\D/g, "")}`}>
            {business.phone_primary}
          </a>
          <span aria-hidden className="brochure-footer-dot">
            /
          </span>
          <a href={`tel:${business.phone_secondary.replace(/\D/g, "")}`}>
            {business.phone_secondary}
          </a>
        </p>
        <p className="brochure-footer-hours">{business.hours}</p>
      </footer>
    </div>
  );
}
