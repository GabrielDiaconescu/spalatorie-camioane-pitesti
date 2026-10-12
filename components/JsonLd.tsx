import { ogImage } from "@/lib/metadata";
import { site } from "@/lib/site";

// Date structurate pentru Google (schema.org). Conțin DOAR datele furnizate de client.
export function JsonLd() {
  const openDays = site.hours.filter((entry) => entry.open);

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: site.legalName,
    url: site.url,
    image: `${site.url}${ogImage.url}`,
    telephone: site.phone.e164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      // [DE COMPLETAT: strada și numărul] — momentan doar zona Prundu.
      streetAddress: site.address.area,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: openDays.map((entry) => entry.schema),
        opens: openDays[0].open,
        closes: openDays[0].close,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-ul este generat din datele noastre; „<” este codificat ca să nu poată închide eticheta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
