import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getActivePaletteId } from "@/lib/site";
import { paletteToCssVars } from "@/lib/palettes";
import { LOCAL_BUSINESS, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f0f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0a14" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Farmington, MI`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Hair, skin, nail, and wellness salon in Farmington, MI. Walk in or book online. Private women's suite. Call (248) 474-6520.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "beauty",
  keywords: [
    "hair salon Farmington MI",
    "spa Farmington",
    "nail salon Farmington",
    "facial Farmington MI",
    "private suite hijab salon Michigan",
    "walk in haircut Farmington",
    "Family Hair Salon & Wellness Spa",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Farmington, MI`,
    description: SITE_TAGLINE,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Farmington, MI`,
    description: SITE_TAGLINE,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
  other: {
    "geo.region": "US-MI",
    "geo.placename": "Farmington",
    "geo.position": `${LOCAL_BUSINESS.latitude};${LOCAL_BUSINESS.longitude}`,
    ICBM: `${LOCAL_BUSINESS.latitude}, ${LOCAL_BUSINESS.longitude}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paletteId = await getActivePaletteId();
  const cssVars = paletteToCssVars(paletteId);

  return (
    <html lang="en-US">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
      </head>
      <body className={`${playfair.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
