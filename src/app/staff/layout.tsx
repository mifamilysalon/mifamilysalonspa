import type { Metadata } from "next";
import { StaffShell } from "./StaffShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "Staff",
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
