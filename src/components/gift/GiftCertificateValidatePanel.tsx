"use client";

import { useState } from "react";
import {
  formatGiftAmount,
  formatIssuedDate,
  giftCertificateBalanceCents,
  giftCertificateStatusLabel,
  type GiftCertificateRedemption,
  type GiftCertificateValidation,
} from "@/lib/gift-certificates-shared";

export function GiftCertificateValidatePanel() {
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<GiftCertificateValidation | null>(
    null,
  );
  const [redemptions, setRedemptions] = useState<GiftCertificateRedemption[]>(
    [],
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
        redemptions?: GiftCertificateRedemption[];
      };
      if (!res.ok) {
        setError(data.error || "Lookup failed");
        setValidation(null);
        setRedemptions([]);
        return;
      }
      setValidation(data.validation || null);
      setRedemptions(data.redemptions || []);
      setMessage(data.validation?.message || null);
      const cert = data.validation?.certificate;
      if (cert && data.validation?.usable) {
        const balance = giftCertificateBalanceCents(cert);
        setRedeemAmount(
          balance % 100 === 0
            ? String(balance / 100)
            : (balance / 100).toFixed(2),
        );
      } else {
        setRedeemAmount("");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (!validation?.usable || !validation.certificate) return;
    const balance = giftCertificateBalanceCents(validation.certificate);
    const amountNum = Number(redeemAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount to apply.");
      return;
    }
    if (Math.round(amountNum * 100) > balance) {
      setError(`Amount cannot exceed remaining balance (${formatGiftAmount(balance)}).`);
      return;
    }

    const amountLabel = formatGiftAmount(Math.round(amountNum * 100));
    const remainingAfter = balance - Math.round(amountNum * 100);
    const confirmMsg =
      remainingAfter > 0
        ? `Apply ${amountLabel} from ${validation.code}? ${formatGiftAmount(remainingAfter)} will remain for a future visit.`
        : `Apply ${amountLabel} from ${validation.code}? This will use the full remaining balance.`;

    if (!window.confirm(confirmMsg)) return;

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
          amount_dollars: amountNum,
          note: note || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        validation?: GiftCertificateValidation;
        redemptions?: GiftCertificateRedemption[];
      };
      if (!res.ok) {
        setError(data.error || "Redeem failed");
        return;
      }
      setValidation(data.validation || null);
      setRedemptions(data.redemptions || []);
      setMessage(data.message || "Redeemed.");
      setNote("");
      const cert = data.validation?.certificate;
      if (cert && data.validation?.usable) {
        const newBalance = giftCertificateBalanceCents(cert);
        setRedeemAmount(
          newBalance % 100 === 0
            ? String(newBalance / 100)
            : (newBalance / 100).toFixed(2),
        );
      } else {
        setRedeemAmount("");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const cert = validation?.certificate;
  const balanceCents = cert ? giftCertificateBalanceCents(cert) : 0;

  return (
    <section className="editorial-panel space-y-4 p-6">
      <h2 className="font-serif text-lg text-salon-heading">
        Validate / redeem code
      </h2>
      <p className="text-sm text-salon-body">
        Enter the certificate code from the email or printout. Lookup checks
        validity and remaining balance; redeem applies part or all of the
        value. The same code works again until the balance is zero.
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
            From {cert.from_name} · Original value{" "}
            {formatGiftAmount(cert.amount_cents)}
          </p>
          {cert.status === "sent" && balanceCents > 0 && (
            <p className="mt-1 font-medium text-salon-heading">
              Remaining balance: {formatGiftAmount(balanceCents)}
            </p>
          )}
          <p className="mt-1">
            Issued {formatIssuedDate(cert.issued_date)} · Valid until{" "}
            {formatIssuedDate(cert.valid_until_date)}
          </p>
          <p className="mt-1 uppercase tracking-wide text-salon-body/80">
            {cert.code} · {giftCertificateStatusLabel(cert.status)}
          </p>
          {cert.status === "redeemed" && (
            <p className="mt-2 text-salon-heading">
              Fully redeemed
              {cert.redeemed_at ? ` ${cert.redeemed_at.slice(0, 10)}` : ""}
              {cert.redeemed_by_name ? ` by ${cert.redeemed_by_name}` : ""}
              {cert.redemption_note ? ` · ${cert.redemption_note}` : ""}
            </p>
          )}

          {redemptions.length > 0 && (
            <div className="mt-4 border border-salon-border bg-salon-light/60 p-4">
              <p className="text-sm font-medium text-salon-heading">
                Redemption history
              </p>
              <ul className="mt-2 space-y-2">
                {redemptions.map((r) => (
                  <li key={r.id} className="text-sm">
                    {formatGiftAmount(r.amount_cents)}
                    {r.redeemed_at ? ` · ${r.redeemed_at.slice(0, 10)}` : ""}
                    {r.redeemed_by_name ? ` · ${r.redeemed_by_name}` : ""}
                    {r.note ? ` · ${r.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation?.usable && (
            <div className="mt-4 space-y-3">
              <label className="block max-w-xs">
                <span className="mb-1 block text-sm text-salon-heading">
                  Amount to apply (USD)
                </span>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  max={balanceCents / 100}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="min-h-12 w-full border border-salon-border px-3"
                />
              </label>
              <p className="text-xs text-salon-body/80">
                Defaults to the full remaining balance. Enter a smaller amount for
                partial redemption.
              </p>
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
                Apply to visit
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
