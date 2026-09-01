import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requireRole } from "@/lib/auth";
import {
  approveGiftCertificate,
  getGiftCertificate,
  isAdminRole,
  isStaffPortalRole,
  rejectGiftCertificate,
  voidGiftCertificate,
} from "@/lib/gift-certificates";
import { sendGiftCertificateEmail } from "@/lib/gift-certificate-email";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "resend", "void"]),
  reject_reason: z.string().trim().max(500).optional(),
  void_reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const action = parsed.data.action;

    if (action === "approve" || action === "reject" || action === "void") {
      try {
        requireRole(user, ["owner", "manager"]);
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (action === "reject") {
      const certificate = await rejectGiftCertificate(
        id,
        user,
        parsed.data.reject_reason,
      );
      return NextResponse.json({
        certificate,
        message: "Certificate request rejected.",
      });
    }

    if (action === "void") {
      const certificate = await voidGiftCertificate(
        id,
        user,
        parsed.data.void_reason,
      );
      return NextResponse.json({
        certificate,
        message: "Certificate voided. It can no longer be redeemed.",
      });
    }

    if (action === "approve") {
      const existing = await getGiftCertificate(id);
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const certificate = await approveGiftCertificate(id, user);
      const emailResult = await sendGiftCertificateEmail(certificate);

      return NextResponse.json({
        certificate,
        emailed: emailResult.ok,
        email_detail: emailResult.detail,
        message: emailResult.ok
          ? "Approved and emailed to the customer."
          : `Approved, but email could not be sent. ${emailResult.detail || "Check email binding."}`,
      });
    }

    // resend — admin always; staff only for certificates they created
    const existing = await getGiftCertificate(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.status !== "sent") {
      return NextResponse.json(
        { error: "Only issued (sent) certificates can be resent" },
        { status: 400 },
      );
    }
    if (
      !isAdminRole(user.role) &&
      existing.created_by_user_id !== user.id
    ) {
      return NextResponse.json(
        { error: "You can only resend certificates you created" },
        { status: 403 },
      );
    }

    const emailResult = await sendGiftCertificateEmail(existing);
    return NextResponse.json({
      certificate: existing,
      emailed: emailResult.ok,
      email_detail: emailResult.detail,
      message: emailResult.ok
        ? `Resent ${existing.code} to ${existing.customer_email}.`
        : `Resend failed. ${emailResult.detail || "Check email binding."}`,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to update";
    const status =
      message === "Not found"
        ? 404
        : message.includes("Only pending") ||
            message.includes("Only pending or issued")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
