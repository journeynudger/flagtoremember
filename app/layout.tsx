import type { Metadata, Viewport } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { home, site } from "@/lib/content";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-face", axes: ["opsz"] });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans-face" });

export const metadata: Metadata = {
  metadataBase: new URL("https://flagtoremember.com"),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.mission,
  openGraph: { siteName: site.name, type: "website", images: [home.hero.image.src] },
};

export const viewport: Viewport = { themeColor: "#0f1115" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
