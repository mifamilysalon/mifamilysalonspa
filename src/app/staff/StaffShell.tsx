"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = {
  id: number;
  name: string;
  role: string;
};

const ALLOWED = ["stylist", "receptionist", "owner", "manager"];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/staff/login";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(!isLogin);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isLogin) return;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/staff/login");
          return;
        }
        const data = (await res.json()) as { user: { id: number; role: string; name: string } };
        if (!ALLOWED.includes(data.user.role)) {
          router.replace("/staff/login");
          return;
        }
        setUser(data.user);

        const pendingRes = await fetch("/api/staff/pending").catch(() => null);
        if (pendingRes?.ok) {
          const pendingData = (await pendingRes.json()) as { appointments?: unknown[] };
          setPendingCount(pendingData.appointments?.length || 0);
        }
      } catch {
        router.replace("/staff/login");
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [isLogin, router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  }

  if (isLogin) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-salon-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="editorial-panel mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="font-serif text-lg text-salon-heading">Staff portal</p>
          {user && <p className="text-xs text-salon-body">{user.name}</p>}
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/staff"
            className={`min-h-12 px-4 py-2 text-sm ${
              pathname === "/staff" ? "text-salon-primary" : "text-salon-body"
            }`}
          >
            Today
          </Link>
          <Link
            href="/staff/pending"
            className="relative min-h-12 px-4 py-2 text-sm text-salon-body"
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center bg-salon-primary px-1 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-12 px-4 py-2 text-sm text-salon-body hover:text-salon-primary"
          >
            Logout
          </button>
        </nav>
      </header>
      {children}
    </div>
  );
}
