import type { Metadata } from "next";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
