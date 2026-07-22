import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getActivePaletteId } from "@/lib/site";
import { paletteToCssVars } from "@/lib/palettes";

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

export const metadata: Metadata = {
  title: {
    default: "Family Hair Salon & Wellness Spa | Farmington, MI",
    template: "%s | Family Hair Salon & Wellness Spa",
  },
  description:
    "Hair, skin, nail, and wellness services in Farmington, MI. Book online or call (248) 474-6520.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paletteId = await getActivePaletteId();
  const cssVars = paletteToCssVars(paletteId);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
      </head>
      <body className={`${playfair.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
