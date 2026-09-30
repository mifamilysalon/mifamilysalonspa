"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || "Could not send reset email.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="editorial-panel w-full max-w-md p-8">
        <h1 className="font-serif text-2xl text-salon-heading">Reset password</h1>
        <p className="mt-2 text-sm text-salon-body">
          Enter your admin email and we&apos;ll send a one-hour reset link.
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="border border-salon-border bg-salon-panel px-4 py-3 text-sm text-salon-body">
              If that email has an admin account, we sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex min-h-12 items-center text-sm font-medium text-salon-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-salon-heading">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full bg-salon-primary py-3 text-white transition hover:bg-salon-hover disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <Link
              href="/admin/login"
              className="inline-flex min-h-12 items-center text-sm text-salon-body hover:text-salon-primary"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
