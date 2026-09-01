import { getDb } from "./db";
import type { SessionUser } from "./auth";
import type {
  GiftCertificate,
  GiftCertificateInput,
  GiftCertificateStatus,
  GiftCertificateValidation,
} from "./gift-certificates-shared";
import { normalizeGiftCode } from "./gift-certificates-shared";

export type {
  GiftCertificate,
  GiftCertificateInput,
  GiftCertificateStatus,
  GiftCertificateValidation,
} from "./gift-certificates-shared";
export {
  formatGiftAmount,
  formatIssuedDate,
  giftCertificateStatusLabel,
  isAdminRole,
  isStaffPortalRole,
  normalizeGiftCode,
} from "./gift-certificates-shared";

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `GC-${suffix}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const SELECT_BASE = `
  SELECT g.*,
    cu.name AS created_by_name,
    au.name AS approved_by_name,
    ru.name AS redeemed_by_name
  FROM gift_certificates g
  LEFT JOIN users cu ON cu.id = g.created_by_user_id
  LEFT JOIN users au ON au.id = g.approved_by_user_id
  LEFT JOIN users ru ON ru.id = g.redeemed_by_user_id
`;

export async function listGiftCertificates(opts?: {
  status?: GiftCertificateStatus;
  createdByUserId?: number;
}): Promise<GiftCertificate[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const binds: (string | number)[] = [];

  if (opts?.status) {
    clauses.push("g.status = ?");
    binds.push(opts.status);
  }
  if (opts?.createdByUserId != null) {
    clauses.push("g.created_by_user_id = ?");
    binds.push(opts.createdByUserId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `${SELECT_BASE} ${where} ORDER BY g.created_at DESC LIMIT 200`;
  const stmt = db.prepare(sql);
  const result = await (binds.length ? stmt.bind(...binds) : stmt).all<GiftCertificate>();
  return result.results || [];
}

export async function getGiftCertificate(
  id: number,
): Promise<GiftCertificate | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`${SELECT_BASE} WHERE g.id = ?`)
      .bind(id)
      .first<GiftCertificate>()) || null
  );
}

export async function getGiftCertificateByCode(
  code: string,
): Promise<GiftCertificate | null> {
  const normalized = normalizeGiftCode(code);
  if (!normalized) return null;
  const db = await getDb();
  return (
    (await db
      .prepare(`${SELECT_BASE} WHERE upper(g.code) = ?`)
      .bind(normalized)
      .first<GiftCertificate>()) || null
  );
}

export function evaluateGiftCertificate(
  cert: GiftCertificate | null,
  codeInput: string,
): GiftCertificateValidation {
  const code = normalizeGiftCode(codeInput) || codeInput.trim().toUpperCase();
  if (!cert) {
    return {
      found: false,
      code,
      usable: false,
      reason: "not_found",
      message: "No certificate found for that code.",
      certificate: null,
    };
  }

  if (cert.status === "pending_approval") {
    return {
      found: true,
      code: cert.code,
      usable: false,
      reason: "pending_approval",
      message: "This certificate is still waiting for admin approval.",
      certificate: cert,
    };
  }
  if (cert.status === "rejected") {
    return {
      found: true,
      code: cert.code,
      usable: false,
      reason: "rejected",
      message: "This certificate request was rejected and is not valid.",
      certificate: cert,
    };
  }
  if (cert.status === "void" || cert.status === "cancelled") {
    return {
      found: true,
      code: cert.code,
      usable: false,
      reason: cert.status === "void" ? "void" : "cancelled",
      message: "This certificate has been voided and cannot be used.",
      certificate: cert,
    };
  }
  if (cert.status === "redeemed") {
    return {
      found: true,
      code: cert.code,
      usable: false,
      reason: "already_redeemed",
      message: `Already redeemed${cert.redeemed_at ? ` on ${cert.redeemed_at.slice(0, 10)}` : ""}. Cannot be reused.`,
      certificate: cert,
    };
  }
  if (cert.status === "sent") {
    if (cert.valid_until_date < todayIso()) {
      return {
        found: true,
        code: cert.code,
        usable: false,
        reason: "expired",
        message: `Expired on ${cert.valid_until_date}. Do not accept.`,
        certificate: cert,
      };
    }
    return {
      found: true,
      code: cert.code,
      usable: true,
      reason: "valid",
      message: "Valid certificate. Safe to redeem for services.",
      certificate: cert,
    };
  }

  return {
    found: true,
    code: cert.code,
    usable: false,
    reason: "not_found",
    message: "Certificate cannot be used.",
    certificate: cert,
  };
}

export async function validateGiftCertificateCode(
  code: string,
): Promise<GiftCertificateValidation> {
  const cert = await getGiftCertificateByCode(code);
  return evaluateGiftCertificate(cert, code);
}

export async function createGiftCertificate(
  input: GiftCertificateInput,
  createdBy: SessionUser,
  status: Extract<GiftCertificateStatus, "pending_approval" | "sent">,
): Promise<GiftCertificate> {
  const db = await getDb();
  const amountCents = Math.round(input.amount_dollars * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const now = new Date().toISOString();
      const sentAt = status === "sent" ? now : null;
      const approvedBy = status === "sent" ? createdBy.id : null;

      const result = await db
        .prepare(
          `INSERT INTO gift_certificates (
            code, recipient_name, from_name, amount_cents, customer_email,
            issued_date, valid_until_date, note, status, created_by_user_id, approved_by_user_id, sent_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          code,
          input.recipient_name.trim(),
          input.from_name.trim(),
          amountCents,
          input.customer_email.trim().toLowerCase(),
          input.issued_date,
          input.valid_until_date,
          input.note?.trim() || null,
          status,
          createdBy.id,
          approvedBy,
          sentAt,
        )
        .run();

      const id = Number(result.meta.last_row_id);
      if (!id) throw new Error("Failed to create gift certificate");
      const row = await getGiftCertificate(id);
      if (!row) throw new Error("Failed to load gift certificate");
      return row;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("UNIQUE") || message.includes("unique")) {
        code = generateCode();
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not generate a unique certificate code");
}

export async function approveGiftCertificate(
  id: number,
  admin: SessionUser,
): Promise<GiftCertificate> {
  const db = await getDb();
  const existing = await getGiftCertificate(id);
  if (!existing) throw new Error("Not found");
  if (existing.status !== "pending_approval") {
    throw new Error("Only pending certificates can be approved");
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE gift_certificates
       SET status = 'sent',
           approved_by_user_id = ?,
           sent_at = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(admin.id, now, id)
    .run();

  const row = await getGiftCertificate(id);
  if (!row) throw new Error("Not found after approve");
  return row;
}

export async function rejectGiftCertificate(
  id: number,
  admin: SessionUser,
  reason?: string,
): Promise<GiftCertificate> {
  const db = await getDb();
  const existing = await getGiftCertificate(id);
  if (!existing) throw new Error("Not found");
  if (existing.status !== "pending_approval") {
    throw new Error("Only pending certificates can be rejected");
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE gift_certificates
       SET status = 'rejected',
           approved_by_user_id = ?,
           rejected_at = ?,
           reject_reason = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(admin.id, now, reason?.trim() || null, id)
    .run();

  const row = await getGiftCertificate(id);
  if (!row) throw new Error("Not found after reject");
  return row;
}

export async function redeemGiftCertificate(
  code: string,
  staff: SessionUser,
  note?: string,
): Promise<GiftCertificate> {
  const validation = await validateGiftCertificateCode(code);
  if (!validation.certificate) throw new Error("Not found");
  if (!validation.usable) {
    throw new Error(validation.message);
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE gift_certificates
       SET status = 'redeemed',
           redeemed_at = ?,
           redeemed_by_user_id = ?,
           redemption_note = ?,
           updated_at = datetime('now')
       WHERE id = ? AND status = 'sent'`,
    )
    .bind(
      now,
      staff.id,
      note?.trim() || null,
      validation.certificate.id,
    )
    .run();

  if (!result.meta.changes) {
    throw new Error("Certificate could not be redeemed (already used or changed)");
  }

  const row = await getGiftCertificate(validation.certificate.id);
  if (!row) throw new Error("Not found after redeem");
  return row;
}

export async function voidGiftCertificate(
  id: number,
  admin: SessionUser,
  reason?: string,
): Promise<GiftCertificate> {
  const existing = await getGiftCertificate(id);
  if (!existing) throw new Error("Not found");
  if (existing.status !== "sent" && existing.status !== "pending_approval") {
    throw new Error("Only pending or issued certificates can be voided");
  }

  const db = await getDb();
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE gift_certificates
       SET status = 'void',
           voided_at = ?,
           void_reason = ?,
           approved_by_user_id = COALESCE(approved_by_user_id, ?),
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(now, reason?.trim() || null, admin.id, id)
    .run();

  const row = await getGiftCertificate(id);
  if (!row) throw new Error("Not found after void");
  return row;
}
