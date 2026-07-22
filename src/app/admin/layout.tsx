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
  { href: "/admin/services", label: "Services" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="mx-auto flex max-w-6xl flex-col gap-0 md:flex-row">
      <aside className="editorial-panel shrink-0 border-b md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
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
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
