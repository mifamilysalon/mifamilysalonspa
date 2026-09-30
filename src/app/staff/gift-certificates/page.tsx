"use client";

import { useCallback, useEffect, useState } from "react";
import { GiftCertificateIssueForm } from "@/components/gift/GiftCertificateIssueForm";
import { GiftCertificateRowRedeem } from "@/components/gift/GiftCertificateRowRedeem";
import { GiftCertificateValidatePanel } from "@/components/gift/GiftCertificateValidatePanel";
import {
  formatGiftAmount,
  formatIssuedDate,
  giftCertificateBalanceCents,
  giftCertificateStatusLabel,
  type GiftCertificate,
} from "@/lib/gift-certificates-shared";

type Business = {
  name: string;
  address: string;
  phone_primary: string;
  phone_secondary?: string;
};

const DEFAULT_BUSINESS: Business = {
  name: "Family Hair Salon & Wellness Spa",
  address: "34777 Grand River Ave, Farmington, MI 48335",
  phone_primary: "(248) 474-6520",
  phone_secondary: "(248) 635-5127",
};

export default function StaffGiftCertificatesPage() {
  const [business] = useState<Business>(DEFAULT_BUSINESS);
  const [certificates, setCertificates] = useState<GiftCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gift-certificates");
      const data = (await res.json()) as { certificates?: GiftCertificate[] };
      setCertificates(data.certificates || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resend(id: number) {
    setBusyId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/gift-certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend" }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setActionMsg(data.error || "Resend failed");
        return;
      }
      setActionMsg(data.message || "Resent.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Gift certificates</h1>
      <p className="mt-2 text-sm text-salon-body">
        Validate codes at the desk, apply full or partial redemptions, request new
        certificates for admin approval, and resend issued emails when needed.
      </p>

      <div className="mt-8">
        <GiftCertificateValidatePanel />
      </div>

      <div className="mt-10">
        <GiftCertificateIssueForm
          business={business}
          mode="staff"
          onCreated={load}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-lg text-salon-heading">Your requests</h2>
        {actionMsg && (
          <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm">
            {actionMsg}
          </p>
        )}
        {loading ? (
          <p className="mt-4 text-sm text-salon-body">Loading…</p>
        ) : certificates.length === 0 ? (
          <p className="mt-4 text-sm text-salon-body">No requests yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {certificates.map((c) => (
              <li key={c.id} className="editorial-panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-salon-heading">
                      {c.recipient_name}
                    </p>
                    <p className="mt-1 text-sm text-salon-body">
                      Original {formatGiftAmount(c.amount_cents)}
                      {c.status === "sent" &&
                      giftCertificateBalanceCents(c) !== c.amount_cents
                        ? ` · Remaining ${formatGiftAmount(giftCertificateBalanceCents(c))}`
                        : ""}{" "}
                      · {c.customer_email} · issued{" "}
                      {formatIssuedDate(c.issued_date)} · valid until{" "}
                      {formatIssuedDate(c.valid_until_date)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-salon-body/80">
                      {c.code} · {giftCertificateStatusLabel(c.status)}
                    </p>
                  </div>
                  {c.status === "sent" && (
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => resend(c.id)}
                      className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary disabled:opacity-60"
                    >
                      Resend email
                    </button>
                  )}
                </div>
                <GiftCertificateRowRedeem
                  certificate={c}
                  onDone={async (message) => {
                    setActionMsg(message);
                    await load();
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
