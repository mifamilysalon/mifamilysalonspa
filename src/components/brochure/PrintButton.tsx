"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary print:hidden"
    >
      {label}
    </button>
  );
}
