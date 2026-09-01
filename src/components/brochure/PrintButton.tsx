"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="brochure-print-btn print:hidden"
    >
      {label}
    </button>
  );
}
