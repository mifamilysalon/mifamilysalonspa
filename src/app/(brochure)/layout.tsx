import Link from "next/link";

/** Minimal chrome for desk QR price brochure — not linked from the public site. */
export default function BrochureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="brochure-root min-h-screen">
      <div className="print:hidden brochure-topbar">
        <Link href="/" className="brochure-site-link">
          Main website
        </Link>
      </div>
      <main>{children}</main>
    </div>
  );
}
