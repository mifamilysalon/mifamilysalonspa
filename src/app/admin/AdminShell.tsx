"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = {
  id: number;
  name: string;
  role: string;
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/gift-certificates", label: "Gift certificates" },
  { href: "/admin/promos", label: "Promos" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(!isLogin);

  useEffect(() => {
    if (isLogin) return;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = (await res.json()) as { user: SessionUser };
        if (!["owner", "manager"].includes(data.user.role)) {
          router.replace("/admin/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [isLogin, router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
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
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <aside className="editorial-panel w-full shrink-0 border-b md:sticky md:top-0 md:h-screen md:w-60 md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="px-4 py-4 md:px-5">
          <p className="font-serif text-lg text-salon-heading">Admin</p>
          {user && <p className="text-xs text-salon-body">{user.name}</p>}
        </div>
        <nav className="flex flex-row overflow-x-auto md:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-12 whitespace-nowrap px-4 py-3 text-sm transition md:border-t md:border-salon-border ${
                pathname === item.href
                  ? "bg-salon-light text-salon-heading"
                  : "text-salon-body hover:text-salon-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-12 px-4 py-3 text-left text-sm text-salon-body transition hover:text-salon-primary md:border-t md:border-salon-border"
          >
            Logout
          </button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}
