"use client";

import { useState } from "react";
import {
  formatGiftAmount,
  formatIssuedDate,
  giftCertificateStatusLabel,
  type GiftCertificateValidation,
} from "@/lib/gift-certificates-shared";

export function GiftCertificateValidatePanel() {
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<GiftCertificateValidation | null>(
    null,
  );

  async function lookup() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/gift-certificates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "lookup" }),
      });
      const data = (await res.json()) as {
        error?: string;
        validation?: GiftCertificateValidation;
      };
      if (!res.ok) {
        setError(data.error || "Lookup failed");
        setValidation(null);
        return;
      }
      setValidation(data.validation || null);
      setMessage(data.validation?.message || null);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (!validation?.usable) return;
    const ok = window.confirm(
      `Redeem ${validation.code}? This cannot be undone — the code will be marked used.`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/gift-certificates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: validation.code,
          action: "redeem",
          note: note || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        validation?: GiftCertificateValidation;
      };
      if (!res.ok) {
        setError(data.error || "Redeem failed");
        return;
      }
      setValidation(data.validation || null);
      setMessage(data.message || "Redeemed.");
      setNote("");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const cert = validation?.certificate;

  return (
    <section className="editorial-panel space-y-4 p-6">
      <h2 className="font-serif text-lg text-salon-heading">
        Validate / redeem code
      </h2>
      <p className="text-sm text-salon-body">
        Enter the certificate code from the email or printout. Lookup checks
        validity; Redeem marks it used so it cannot be reused.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1 block text-sm text-salon-heading">Code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="GC-XXXXXX"
            className="min-h-12 w-full border border-salon-border px-3 font-mono tracking-wider"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={busy || !code.trim()}
            onClick={lookup}
            className="min-h-12 bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
          >
            {busy ? "Checking…" : "Lookup"}
          </button>
        </div>
      </div>

      {error && (
        <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p
          className={`border px-4 py-3 text-sm ${
            validation?.usable
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-salon-border bg-salon-light text-salon-heading"
          }`}
        >
          {message}
        </p>
      )}

      {cert && (
        <div className="border-t border-salon-border pt-4 text-sm text-salon-body">
          <p className="font-serif text-xl text-salon-heading">
            {cert.recipient_name}
          </p>
          <p className="mt-1">
            From {cert.from_name} · {formatGiftAmount(cert.amount_cents)}
          </p>
          <p className="mt-1">
            Issued {formatIssuedDate(cert.issued_date)} · Valid until{" "}
            {formatIssuedDate(cert.valid_until_date)}
          </p>
          <p className="mt-1 uppercase tracking-wide text-salon-body/80">
            {cert.code} · {giftCertificateStatusLabel(cert.status)}
          </p>
          {cert.status === "redeemed" && (
            <p className="mt-2 text-salon-heading">
              Redeemed
              {cert.redeemed_at ? ` ${cert.redeemed_at.slice(0, 10)}` : ""}
              {cert.redeemed_by_name ? ` by ${cert.redeemed_by_name}` : ""}
              {cert.redemption_note ? ` · ${cert.redemption_note}` : ""}
            </p>
          )}

          {validation?.usable && (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-salon-heading">
                  Redemption note (optional)
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Applied to Classic Manicure"
                  className="min-h-12 w-full border border-salon-border px-3"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={redeem}
                className="min-h-12 border border-salon-primary bg-salon-primary px-5 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
              >
                Redeem code (mark used)
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
