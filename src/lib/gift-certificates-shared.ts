export type GiftCertificateStatus =
  | "pending_approval"
  | "sent"
  | "redeemed"
  | "rejected"
  | "void"
  | "cancelled";

export type GiftCertificateRedemption = {
  id: number;
  gift_certificate_id: number;
  amount_cents: number;
  redeemed_at: string;
  redeemed_by_user_id: number;
  note: string | null;
  redeemed_by_name?: string | null;
};

export type GiftCertificate = {
  id: number;
  code: string;
  recipient_name: string;
  from_name: string;
  amount_cents: number;
  /** Remaining value; defaults to full amount when unset (legacy rows). */
  balance_cents: number | null;
  customer_email: string;
  issued_date: string;
  valid_until_date: string;
  note: string | null;
  status: GiftCertificateStatus;
  created_by_user_id: number;
  approved_by_user_id: number | null;
  sent_at: string | null;
  rejected_at: string | null;
  reject_reason: string | null;
  redeemed_at: string | null;
  redeemed_by_user_id: number | null;
  redemption_note: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by_name?: string | null;
  approved_by_name?: string | null;
  redeemed_by_name?: string | null;
};

export type GiftCertificateInput = {
  recipient_name: string;
  from_name: string;
  amount_dollars: number;
  customer_email: string;
  issued_date: string;
  valid_until_date: string;
  note?: string;
};

/** Result of looking up a certificate code at the desk. */
export type GiftCertificateValidation = {
  found: boolean;
  code: string;
  usable: boolean;
  reason:
    | "valid"
    | "not_found"
    | "pending_approval"
    | "rejected"
    | "void"
    | "cancelled"
    | "already_redeemed"
    | "expired";
  message: string;
  certificate: GiftCertificate | null;
};

export function giftCertificateBalanceCents(cert: GiftCertificate): number {
  if (cert.balance_cents != null) return cert.balance_cents;
  if (cert.status === "redeemed") return 0;
  if (cert.status === "sent") return cert.amount_cents;
  return 0;
}

export function formatGiftAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatIssuedDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeGiftCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("GC-")) return cleaned;
  if (cleaned.startsWith("GC")) return `GC-${cleaned.slice(2)}`;
  return `GC-${cleaned}`;
}

export function isAdminRole(role: string): boolean {
  return role === "owner" || role === "manager";
}

export function isStaffPortalRole(role: string): boolean {
  return ["stylist", "receptionist", "owner", "manager"].includes(role);
}

export function giftCertificateStatusLabel(status: GiftCertificateStatus): string {
  return status.replaceAll("_", " ");
}
