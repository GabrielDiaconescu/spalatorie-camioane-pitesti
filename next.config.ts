import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy: browserul încarcă resurse doar de pe domeniul nostru.
// Singura excepție este harta Google, încărcată într-un iframe după acordul vizitatorului.
// 'unsafe-inline' la scripturi este necesar pentru paginile statice Next.js (vezi README).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Rădăcina proiectului (în folderul-părinte există alt package-lock.json, care nu ține de site).
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Fonturile nu se schimbă niciodată sub același nume.
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Imaginile și video-ul pot fi înlocuite de client, așa că le păstrăm în cache 30 de zile.
      { source: "/images/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/video/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    ];
  },
};

export default nextConfig;
