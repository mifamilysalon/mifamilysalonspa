import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  isStaffPortalRole,
  redeemGiftCertificate,
  validateGiftCertificateCode,
} from "@/lib/gift-certificates";

const bodySchema = z.object({
  code: z.string().trim().min(4).max(40),
  action: z.enum(["lookup", "redeem"]).default("lookup"),
  note: z.string().trim().max(500).optional(),
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
    return NextResponse.json({ validation });
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
      return NextResponse.json({ validation });
    }

    const certificate = await redeemGiftCertificate(
      parsed.data.code,
      user,
      parsed.data.note,
    );
    const validation = await validateGiftCertificateCode(certificate.code);

    return NextResponse.json({
      validation,
      certificate,
      message: `Redeemed ${certificate.code}. This code cannot be used again.`,
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
