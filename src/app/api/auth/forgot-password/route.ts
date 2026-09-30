import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const result = await requestPasswordReset(parsed.data.email);
    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            "We could not send the reset email right now. Please try again in a few minutes, or call the salon for help.",
        },
        { status: 502 },
      );
    }

    // Generic message — do not reveal whether the email exists
    return NextResponse.json({
      ok: true,
      message:
        "If that email has an admin account, we sent a password reset link. Check your inbox (and spam) within a few minutes.",
    });
  } catch (err) {
    console.error("forgot-password error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
