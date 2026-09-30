"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="brochure-btn brochure-btn-ghost print:hidden"
    >
      {label}
    </button>
  );
}
