import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { home, site } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://flagtoremember.com"),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.mission,
  openGraph: { siteName: site.name, type: "website", images: [home.hero.image.src] },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
