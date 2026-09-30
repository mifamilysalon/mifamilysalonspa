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
  type GiftCertificateStatus,
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

type Filter = GiftCertificateStatus | "all";

export default function AdminGiftCertificatesPage() {
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);
  const [certificates, setCertificates] = useState<GiftCertificate[]>([]);
  const [filter, setFilter] = useState<Filter>("pending_approval");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusQuery =
        filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const [listRes, settingsRes] = await Promise.all([
        fetch(`/api/gift-certificates${statusQuery}`),
        fetch("/api/admin/settings"),
      ]);
      const listData = (await listRes.json()) as {
        certificates?: GiftCertificate[];
      };
      setCertificates(listData.certificates || []);

      if (settingsRes.ok) {
        const settings = (await settingsRes.json()) as {
          business?: Business;
        };
        if (settings.business) setBusiness(settings.business);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(
    id: number,
    action: "approve" | "reject" | "resend" | "void",
  ) {
    setBusyId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/gift-certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setActionMsg(data.error || "Action failed");
        return;
      }
      setActionMsg(data.message || "Done");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Gift certificates</h1>
      <p className="mt-2 text-sm text-salon-body">
        Issue, approve, resend, and record full or partial redemptions. Staff and
        admin can apply any amount up to the remaining balance; the recipient gets
        an updated email when a balance remains.
      </p>

      <div className="mt-8">
        <GiftCertificateValidatePanel />
      </div>

      <div className="mt-10">
        <GiftCertificateIssueForm
          business={business}
          mode="admin"
          onCreated={load}
        />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg text-salon-heading">Certificates</h2>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["pending_approval", "Pending"],
                ["sent", "Issued"],
                ["redeemed", "Redeemed"],
                ["void", "Void"],
                ["all", "All"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`min-h-10 border px-3 text-sm ${
                  filter === value
                    ? "border-salon-primary bg-salon-light text-salon-heading"
                    : "border-salon-border text-salon-body"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {actionMsg && (
          <p className="mt-4 border border-salon-border bg-salon-light px-4 py-3 text-sm">
            {actionMsg}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-salon-body">Loading…</p>
        ) : certificates.length === 0 ? (
          <p className="mt-6 text-sm text-salon-body">No certificates in this view.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {certificates.map((c) => (
              <li key={c.id} className="editorial-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-salon-heading">
                      {c.recipient_name}
                    </p>
                    <p className="mt-1 text-sm text-salon-body">
                      From {c.from_name} · Original{" "}
                      {formatGiftAmount(c.amount_cents)}
                      {c.status === "sent" &&
                      giftCertificateBalanceCents(c) !== c.amount_cents
                        ? ` · Remaining ${formatGiftAmount(giftCertificateBalanceCents(c))}`
                        : ""}{" "}
                      · issued {formatIssuedDate(c.issued_date)} · valid until{" "}
                      {formatIssuedDate(c.valid_until_date)}
                    </p>
                    <p className="mt-1 text-sm text-salon-body">
                      Email: {c.customer_email}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-salon-body/80">
                      {c.code} · {giftCertificateStatusLabel(c.status)}
                      {c.created_by_name ? ` · by ${c.created_by_name}` : ""}
                    </p>
                    {c.status === "redeemed" && (
                      <p className="mt-1 text-sm text-salon-heading">
                        Fully redeemed
                        {c.redeemed_at ? ` ${c.redeemed_at.slice(0, 10)}` : ""}
                        {c.redeemed_by_name ? ` by ${c.redeemed_by_name}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.status === "pending_approval" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => act(c.id, "approve")}
                          className="min-h-11 bg-salon-primary px-4 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
                        >
                          Approve & email
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => act(c.id, "reject")}
                          className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => act(c.id, "void")}
                          className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary disabled:opacity-60"
                        >
                          Void
                        </button>
                      </>
                    )}
                    {c.status === "sent" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => act(c.id, "resend")}
                          className="min-h-11 bg-salon-primary px-4 text-sm font-medium text-white hover:bg-salon-hover disabled:opacity-60"
                        >
                          Resend email
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => act(c.id, "void")}
                          className="min-h-11 border border-salon-border px-4 text-sm text-salon-heading hover:border-salon-primary disabled:opacity-60"
                        >
                          Void
                        </button>
                      </>
                    )}
                  </div>
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
