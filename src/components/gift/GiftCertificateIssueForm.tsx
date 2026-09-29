"use client";

import { useEffect, useMemo, useState } from "react";
import { GiftCertificateTemplate } from "@/components/gift/GiftCertificateTemplate";
import { formatIssuedDate } from "@/lib/gift-certificates-shared";

type ClientDirectoryEntry = {
  client_name: string;
  client_email: string | null;
  client_phone: string;
  last_visit: string;
  booking_source: string | null;
};

type Business = {
  name: string;
  address: string;
  phone_primary: string;
  phone_secondary?: string;
};

type Props = {
  business: Business;
  mode: "admin" | "staff";
  onCreated?: () => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusOneYearIso(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function GiftCertificateIssueForm({ business, mode, onCreated }: Props) {
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [issuedDate, setIssuedDate] = useState(todayIso());
  const [validUntilDate, setValidUntilDate] = useState(
    plusOneYearIso(todayIso()),
  );
  const [note, setNote] = useState("");
  const [sendNow, setSendNow] = useState(mode === "admin");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientMatches, setClientMatches] = useState<ClientDirectoryEntry[]>(
    [],
  );
  const [clientSearchBusy, setClientSearchBusy] = useState(false);
  const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const q = clientQuery.trim();
    if (q.length < 2) {
      setClientMatches([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setClientSearchBusy(true);
      try {
        const res = await fetch(
          `/api/clients/search?q=${encodeURIComponent(q)}`,
        );
        const data = (await res.json()) as {
          clients?: ClientDirectoryEntry[];
          error?: string;
        };
        if (res.ok) setClientMatches(data.clients || []);
      } catch {
        setClientMatches([]);
      } finally {
        setClientSearchBusy(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [clientQuery]);

  function applyClient(entry: ClientDirectoryEntry) {
    setRecipient(entry.client_name);
    setEmail(entry.client_email?.trim() || "");
    setSelectedClientPhone(entry.client_phone);
    setClientQuery("");
    setClientMatches([]);
  }

  const amountNumber = Number(amount);
  const previewAmount =
    Number.isFinite(amountNumber) && amountNumber > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: amountNumber % 1 === 0 ? 0 : 2,
        }).format(amountNumber)
      : "$______";

  const previewIssued = useMemo(
    () => (issuedDate ? formatIssuedDate(issuedDate) : "____________"),
    [issuedDate],
  );
  const previewValidUntil = useMemo(
    () =>
      validUntilDate ? formatIssuedDate(validUntilDate) : "____________",
    [validUntilDate],
  );

  function handleIssuedDateChange(value: string) {
    setIssuedDate(value);
    // Keep a 1-year default when issued date moves and valid-until was still the previous default
    setValidUntilDate((prev) => {
      const previousDefault = plusOneYearIso(issuedDate);
      if (!prev || prev === previousDefault) {
        return plusOneYearIso(value);
      }
      return prev;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/gift-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_name: recipient,
          from_name: from,
          amount_dollars: Number(amount),
          customer_email: email,
          issued_date: issuedDate,
          valid_until_date: validUntilDate,
          note: note || undefined,
          send_now: mode === "admin" ? sendNow : false,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not save certificate");
        return;
      }
      setMessage(data.message || "Saved.");
      setRecipient("");
      setFrom("");
      setAmount("");
      setEmail("");
      setNote("");
      setClientQuery("");
      setClientMatches([]);
      setSelectedClientPhone(null);
      const today = todayIso();
      setIssuedDate(today);
      setValidUntilDate(plusOneYearIso(today));
      onCreated?.();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <form onSubmit={handleSubmit} className="editorial-panel space-y-4 p-6">
        <h2 className="font-serif text-lg text-salon-heading">
          {mode === "admin" ? "Issue certificate" : "Request certificate"}
        </h2>
        <p className="text-sm text-salon-body">
          {mode === "admin"
            ? "Fill the certificate, then email the customer now or save for later review."
            : "Submit for admin approval. The customer is emailed only after an admin authorizes it."}
        </p>

        {error && (
          <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-salon-border bg-salon-light px-4 py-3 text-sm text-salon-heading">
            {message}
          </p>
        )}

        <div className="border border-salon-border bg-salon-light/50 p-4">
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">
              Find guest (appointments & walk-ins)
            </span>
            <input
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Name, phone, or email"
              className="min-h-12 w-full border border-salon-border bg-white px-3"
              autoComplete="off"
            />
          </label>
          <p className="mt-2 text-xs text-salon-body/80">
            Prefills name and email from their latest visit. You can change any
            field before issuing — use a different email if the cert goes to
            someone else.
          </p>
          {clientSearchBusy && (
            <p className="mt-2 text-sm text-salon-body">Searching…</p>
          )}
          {clientMatches.length > 0 && (
            <ul
              className="mt-3 max-h-48 overflow-y-auto border border-salon-border bg-white"
              role="listbox"
            >
              {clientMatches.map((c) => (
                <li key={c.client_phone}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => applyClient(c)}
                    className="min-h-12 w-full border-b border-salon-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-salon-light"
                  >
                    <span className="font-medium text-salon-heading">
                      {c.client_name}
                    </span>
                    <span className="mt-0.5 block text-salon-body">
                      {c.client_phone}
                      {c.client_email ? ` · ${c.client_email}` : " · No email on file"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedClientPhone && !clientQuery && (
            <p className="mt-2 text-xs text-salon-body">
              Prefilled from guest on file ({selectedClientPhone}). Edit below
              if needed.
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">Presented to</span>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="min-h-12 w-full border border-salon-border px-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">From</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="min-h-12 w-full border border-salon-border px-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">Amount (USD)</span>
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="min-h-12 w-full border border-salon-border px-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">
            Customer email (receives the certificate)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="min-h-12 w-full border border-salon-border px-3"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Date issued</span>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => handleIssuedDateChange(e.target.value)}
              required
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Valid until</span>
            <input
              type="date"
              value={validUntilDate}
              min={issuedDate}
              onChange={(e) => setValidUntilDate(e.target.value)}
              required
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-salon-heading">Internal note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-12 w-full border border-salon-border px-3"
          />
        </label>

        {mode === "admin" && (
          <label className="flex items-start gap-3 text-sm text-salon-body">
            <input
              type="checkbox"
              checked={sendNow}
              onChange={(e) => setSendNow(e.target.checked)}
              className="mt-1"
            />
            <span>
              Email the customer immediately (admin authorization). Uncheck to
              save as pending for later approval.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="min-h-12 bg-salon-primary px-6 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
        >
          {saving
            ? "Saving…"
            : mode === "admin"
              ? sendNow
                ? "Issue & email"
                : "Save as pending"
              : "Submit for approval"}
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm uppercase tracking-[0.14em] text-salon-primary">
          Live preview
        </p>
        <GiftCertificateTemplate
          salonName={business.name}
          address={business.address}
          phonePrimary={business.phone_primary}
          phoneSecondary={business.phone_secondary}
          recipient={recipient || "________________"}
          from={from || "________________"}
          amount={previewAmount}
          issuedDate={previewIssued}
          validUntilDate={previewValidUntil}
          certificateId="GC-DRAFT"
        />
      </div>
    </div>
  );
}
