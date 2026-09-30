"use client";

import { useState } from "react";
import {
  formatGiftAmount,
  giftCertificateBalanceCents,
  type GiftCertificate,
} from "@/lib/gift-certificates-shared";

type Props = {
  certificate: GiftCertificate;
  onDone?: (message: string) => void;
};

/** Inline partial/full redeem controls for issued certificates in admin/staff lists. */
export function GiftCertificateRowRedeem({ certificate, onDone }: Props) {
  const balance = giftCertificateBalanceCents(certificate);
  const [amount, setAmount] = useState(
    balance % 100 === 0 ? String(balance / 100) : (balance / 100).toFixed(2),
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (certificate.status !== "sent" || balance <= 0) return null;

  async function redeem() {
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    const cents = Math.round(amountNum * 100);
    if (cents > balance) {
      setError(`Cannot exceed remaining balance (${formatGiftAmount(balance)}).`);
      return;
    }
    const remaining = balance - cents;
    const confirmMsg =
      remaining > 0
        ? `Apply ${formatGiftAmount(cents)} from ${certificate.code}? ${formatGiftAmount(remaining)} will remain.`
        : `Apply ${formatGiftAmount(cents)} from ${certificate.code}? This uses the full remaining balance.`;
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gift-certificates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: certificate.code,
          action: "redeem",
          amount_dollars: amountNum,
          note: note || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || "Redeem failed");
        return;
      }
      onDone?.(data.message || "Redemption recorded.");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-salon-border pt-4">
      <p className="text-sm font-medium text-salon-heading">
        Remaining balance: {formatGiftAmount(balance)}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block w-36">
          <span className="mb-1 block text-xs text-salon-body">
            Apply amount (USD)
          </span>
          <input
            type="number"
            min={0.01}
            step={0.01}
            max={balance / 100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-h-10 w-full border border-salon-border px-2 text-sm"
          />
        </label>
        <label className="block min-w-[12rem] flex-1">
          <span className="mb-1 block text-xs text-salon-body">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Service applied"
            className="min-h-10 w-full border border-salon-border px-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={redeem}
          className="min-h-10 bg-salon-primary px-4 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
        >
          {busy ? "Applying…" : "Apply redemption"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
