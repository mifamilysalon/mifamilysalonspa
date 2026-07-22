import { NextResponse } from "next/server";
import { loginWithEmail } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const user = await loginWithEmail(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    console.error("login error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
