import { notFound } from "next/navigation";

/** Old memorable path — intentionally dead so competitors cannot bookmark /menu. */
export default function LegacyMenuGone() {
  notFound();
}
