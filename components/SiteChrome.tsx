import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: site.legalName,
  alternateName: site.name,
  url: "https://flagtoremember.com",
  logo: "https://flagtoremember.com/images/logo.png",
  email: site.email,
  telephone: site.phone.tel,
  taxID: site.ein,
  sameAs: site.social.map((s) => s.url),
};

// Header, footer and skip link shared by every page (and the 404).
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
