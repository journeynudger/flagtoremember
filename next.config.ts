import type { NextConfig } from "next";

// Old WordPress URLs with no page of their own here. WordPress URLs end in "/", so each
// source also matches the slash form: every old link lands in a single 308.
const moved: [string, string][] = [
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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

export default nextConfig;
