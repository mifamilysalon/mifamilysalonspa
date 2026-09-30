"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("This reset link is missing or incomplete. Request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }
      router.replace("/admin/login?reset=1");
      router.refresh();
    } catch {
      setError("Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editorial-panel w-full max-w-md p-8">
      <h1 className="font-serif text-2xl text-salon-heading">Choose a new password</h1>
      <p className="mt-2 text-sm text-salon-body">
        Enter a new password for your admin account (at least 8 characters).
      </p>

      {!token ? (
        <div className="mt-6 space-y-4">
          <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            This reset link is incomplete. Request a new one from the sign-in page.
          </p>
          <Link
            href="/admin/forgot-password"
            className="inline-flex min-h-12 items-center text-sm font-medium text-salon-primary hover:underline"
          >
            Request a new link
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
              New password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-salon-heading">
              Confirm password
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full bg-salon-primary py-3 text-white transition hover:bg-salon-hover disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update password"}
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
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="editorial-panel w-full max-w-md p-8">
            <p className="text-salon-body">Loading...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
