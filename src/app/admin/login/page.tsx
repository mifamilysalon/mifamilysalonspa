"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string; user: { role: string } };
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (!["owner", "manager"].includes(data.user.role)) {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("You do not have admin access.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editorial-panel w-full max-w-md p-8">
      <h1 className="font-serif text-2xl text-salon-heading">Admin login</h1>
      <p className="mt-2 text-sm text-salon-body">
        Sign in with your owner or manager account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {justReset && (
          <p className="border border-salon-border bg-salon-panel px-4 py-3 text-sm text-salon-body">
            Password updated. Sign in with your new password.
          </p>
        )}
        {error && (
          <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-salon-heading">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-salon-heading">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="min-h-12 w-full border border-salon-border bg-salon-panel px-4"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 w-full bg-salon-primary py-3 text-white transition hover:bg-salon-hover disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-12 items-center text-sm text-salon-body hover:text-salon-primary"
        >
          Forgot password?
        </Link>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="editorial-panel w-full max-w-md p-8">
            <p className="text-salon-body">Loading...</p>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
