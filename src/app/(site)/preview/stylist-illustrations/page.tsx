import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stylist illustration preview",
  robots: { index: false, follow: false },
};

const PREVIEW_ILLUSTRATIONS = [
  {
    id: "hero",
    label: "Hero — Indian stylist",
    src: "/illustrations/hero.png",
  },
  {
    id: "cut",
    label: "Cut — white stylist",
    src: "/illustrations/cut.png",
  },
  {
    id: "hair",
    label: "Hair wash — white stylist",
    src: "/illustrations/hair.png",
  },
] as const;

/** Temporary preview — updated stylist depictions (hero, cut, hair). */
export default function StylistIllustrationsPreviewPage() {
  return (
    <div className="min-h-screen bg-salon-light">
      <div className="border-b border-salon-border bg-white px-4 py-3 text-center text-sm text-salon-body md:px-6">
        Preview only: updated stylist illustrations (Indian / white). Live site
        uses these same assets.{" "}
        <Link href="/" className="font-medium text-salon-primary underline">
          Back to site
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl text-salon-heading">
          Stylist illustration preview
        </h1>
        <p className="mt-2 text-salon-body">
          Hero and cut scenes now show an Indian or white stylist instead of the
          previous depiction.
        </p>

        <ul className="mt-10 grid gap-8 md:grid-cols-1">
          {PREVIEW_ILLUSTRATIONS.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-salon-border bg-white shadow-sm"
            >
              <div className="border-b border-salon-border px-5 py-3 text-sm font-medium text-salon-heading">
                {item.label}
              </div>
              <div className="relative aspect-[4/3] bg-white">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 960px"
                  priority={item.id === "hero"}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
