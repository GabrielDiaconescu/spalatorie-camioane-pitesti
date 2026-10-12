import type { Metadata } from "next";
import { site } from "./site.ts";

export const ogImage = {
  url: "/images/og-spalatorie-camioane.jpg",
  width: 1200,
  height: 630,
  alt: "Camion alb spălat cu jeturi de apă într-o boxă de spălare pentru camioane",
};

// Metadate pentru fiecare pagină: titlu unic, descriere, link canonical și Open Graph.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ro_RO",
      siteName: `${site.brandName} ${site.brandSuffix}`,
      url: path,
      title,
      description,
      images: [ogImage],
    },
  };
}
