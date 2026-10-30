import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

if (process.env.VERCEL_ENV === "production" &&
    (process.env.FTR_INTEGRATION_TEST === "true" ||
     process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY === "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI")) {
  throw new Error("Preview test settings must not be deployed to production");
}

// Old WordPress URLs with no page of their own here. WordPress URLs end in "/", so each
// source also matches the slash form: every old link lands in a single 308.
const moved: [string, string][] = [
  ["/wp-content/uploads/2025/03/instagram-icon.jpg", "/images/email/instagram-icon.jpg"],
  ["/wp-content/uploads/2025/03/facebook-icon.jpg", "/images/email/facebook-icon.jpg"],
  ["/our-journey", "/gallery"],
  ["/our-team", "/about"],
  ["/hello-world", "/"],
  ["/category/:path*", "/"],
  ["/author/:path*", "/"],
  ["/feed", "/"],
  ["/comments/feed", "/"],
  ["/wp-sitemap.xml", "/sitemap.xml"],
];

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: { qualities: [75] },
  // Trailing slashes are removed by the last rule below instead, after the moved pages.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const origin = (process.env.WORDPRESS_ORIGIN || "https://wp.flagtoremember.com").replace(/\/$/, "");
    return {
      // Keep Stripe's existing webhook URL working after the public domain moves.
      // WordPress still verifies the original signature and processes the payment event.
      beforeFiles: process.env.FTR_STANDALONE === "true" ? [{
        source: "/",
        has: [{ type: "query", key: "callback", value: "gravityformsstripe" }],
        destination: "/api/stripe/legacy",
      }] : [{
        source: "/",
        has: [{ type: "query", key: "callback", value: "gravityformsstripe" }],
        destination: `${origin}/?callback=gravityformsstripe`,
      }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(process.env.VERCEL_ENV === "preview" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...moved.map(([source, destination]) => ({ source: `${source}{/}?`, destination, permanent: true })),
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },
};

export default withWorkflow(nextConfig);
