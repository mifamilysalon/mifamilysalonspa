import Link from "next/link";

export function MobileStickyCta({ phone }: { phone: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-salon-border bg-salon-panel md:hidden">
      <a
        href={`tel:${phone.replace(/\D/g, "")}`}
        className="flex min-h-14 flex-1 items-center justify-center border-r border-salon-border text-sm font-medium text-salon-heading"
      >
        Call
      </a>
      <Link
        href="/appointments"
        className="flex min-h-14 flex-1 items-center justify-center bg-salon-primary text-sm font-medium text-white"
      >
        Book
      </Link>
    </div>
  );
}
