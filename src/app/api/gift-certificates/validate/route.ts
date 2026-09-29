import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  formatGiftAmount,
  giftCertificateBalanceCents,
  isStaffPortalRole,
  listGiftCertificateRedemptions,
  redeemGiftCertificate,
  validateGiftCertificateCode,
} from "@/lib/gift-certificates";

const bodySchema = z.object({
  code: z.string().trim().min(4).max(40),
  action: z.enum(["lookup", "redeem"]).default("lookup"),
  note: z.string().trim().max(500).optional(),
  /** Dollars to apply; defaults to full remaining balance */
  amount_dollars: z.number().positive().max(10000).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = new URL(request.url).searchParams.get("code") || "";
    if (!code.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const validation = await validateGiftCertificateCode(code);
    const redemptions =
      validation.certificate != null
        ? await listGiftCertificateRedemptions(validation.certificate.id)
        : [];
    return NextResponse.json({ validation, redemptions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    if (parsed.data.action === "lookup") {
      const validation = await validateGiftCertificateCode(parsed.data.code);
      const redemptions =
        validation.certificate != null
          ? await listGiftCertificateRedemptions(validation.certificate.id)
          : [];
      return NextResponse.json({ validation, redemptions });
    }

    const certificate = await redeemGiftCertificate(parsed.data.code, user, {
      note: parsed.data.note,
      amount_dollars: parsed.data.amount_dollars,
    });
    const validation = await validateGiftCertificateCode(certificate.code);
    const redemptions = await listGiftCertificateRedemptions(certificate.id);
    const remaining = giftCertificateBalanceCents(certificate);
    const appliedCents =
      parsed.data.amount_dollars != null
        ? Math.round(parsed.data.amount_dollars * 100)
        : certificate.amount_cents - remaining;

    return NextResponse.json({
      validation,
      certificate,
      redemptions,
      message:
        remaining > 0
          ? `Applied ${formatGiftAmount(appliedCents)}. ${formatGiftAmount(remaining)} remaining — code can be used again until balance is zero.`
          : `Applied ${formatGiftAmount(appliedCents)}. Certificate fully redeemed; no balance remaining.`,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Redeem failed";
    const status =
      message === "Not found"
        ? 404
        : message.includes("Already") ||
            message.includes("Expired") ||
            message.includes("void") ||
            message.includes("rejected") ||
            message.includes("waiting") ||
            message.includes("could not be redeemed")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
