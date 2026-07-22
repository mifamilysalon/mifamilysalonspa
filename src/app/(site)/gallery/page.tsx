import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Photo Gallery" };

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80",
    alt: "Salon styling chairs and warm lighting",
  },
  {
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    alt: "Hair styling in progress",
  },
  {
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
    alt: "Facial skincare treatment setup",
  },
  {
    src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&q=80",
    alt: "Manicure polish application",
  },
  {
    src: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&q=80",
    alt: "Hair wash station",
  },
  {
    src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=80",
    alt: "Spa towels and calm treatment room",
  },
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">Photo gallery</h1>
      <p className="mt-5 max-w-2xl text-salon-body">
        A look at our salon atmosphere and services. Owner photos can replace
        these images anytime from the admin media library.
      </p>
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {IMAGES.map((img) => (
          <div key={img.src} className="mb-4 break-inside-avoid">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
