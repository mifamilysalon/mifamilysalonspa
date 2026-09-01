import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  createGiftCertificate,
  isAdminRole,
  isStaffPortalRole,
  listGiftCertificates,
  type GiftCertificateStatus,
} from "@/lib/gift-certificates";
import {
  notifyAdminGiftCertificatePending,
  sendGiftCertificateEmail,
} from "@/lib/gift-certificate-email";

const createSchema = z.object({
  recipient_name: z.string().trim().min(1).max(120),
  from_name: z.string().trim().min(1).max(120),
  amount_dollars: z.number().positive().max(10000),
  customer_email: z.string().trim().email().max(200),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_until_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional(),
  /** Admin only: skip approval and email immediately */
  send_now: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as GiftCertificateStatus | null;
    const validStatuses: GiftCertificateStatus[] = [
      "pending_approval",
      "sent",
      "redeemed",
      "rejected",
      "void",
      "cancelled",
    ];
    const statusFilter =
      status && validStatuses.includes(status) ? status : undefined;

    const certificates = await listGiftCertificates({
      status: statusFilter,
      createdByUserId: isAdminRole(user.role) ? undefined : user.id,
    });

    return NextResponse.json({ certificates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list certificates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    const sendNow = Boolean(parsed.data.send_now) && isAdminRole(user.role);

    if (parsed.data.valid_until_date < parsed.data.issued_date) {
      return NextResponse.json(
        { error: "Valid until date must be on or after the issued date" },
        { status: 400 },
      );
    }

    const cert = await createGiftCertificate(
      {
        recipient_name: parsed.data.recipient_name,
        from_name: parsed.data.from_name,
        amount_dollars: parsed.data.amount_dollars,
        customer_email: parsed.data.customer_email,
        issued_date: parsed.data.issued_date,
        valid_until_date: parsed.data.valid_until_date,
        note: parsed.data.note,
      },
      user,
      sendNow ? "sent" : "pending_approval",
    );

    if (sendNow) {
      const emailResult = await sendGiftCertificateEmail(cert);
      return NextResponse.json({
        certificate: cert,
        emailed: emailResult.ok,
        email_detail: emailResult.detail,
        message: emailResult.ok
          ? "Certificate issued and emailed to the customer."
          : `Certificate saved, but email could not be sent. ${emailResult.detail || "Check email binding."}`,
      });
    }

    await notifyAdminGiftCertificatePending(cert, user.name);
    return NextResponse.json({
      certificate: cert,
      emailed: false,
      message:
        "Submitted for admin approval. The customer will be emailed after an admin authorizes it.",
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to create certificate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
