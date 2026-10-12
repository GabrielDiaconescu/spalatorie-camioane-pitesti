import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ContactBar } from "@/components/ContactBar";
import { JsonLd } from "@/components/JsonLd";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ogImage } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: `${site.brandName} ${site.brandSuffix}`,
  openGraph: { type: "website", locale: "ro_RO", images: [ogImage] },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-latin-ext-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#continut" className="btn btn--primary skip-link">
          Sari la conținut
        </a>
        <SiteHeader />
        <main id="continut" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <ContactBar />
        <RevealOnScroll />
        <JsonLd />
      </body>
    </html>
  );
}
