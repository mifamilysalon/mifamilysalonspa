import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid reset link and a password of at least 8 characters." },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Could not reset password." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (err) {
    console.error("reset-password error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
