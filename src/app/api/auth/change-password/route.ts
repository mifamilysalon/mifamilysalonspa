import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { changePasswordForUser } from "@/lib/password-reset";
import { changePasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = requireRole(await getCurrentUser(), ["owner", "manager"]);
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const result = await changePasswordForUser(
      user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Could not change password." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password updated.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("change-password error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
