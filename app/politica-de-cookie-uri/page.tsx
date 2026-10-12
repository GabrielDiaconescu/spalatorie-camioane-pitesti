import { PageHero } from "@/components/Sections";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Politica de cookie-uri – Spălătorie Camioane International",
  description:
    "Ce cookie-uri folosește site-ul Spălătorie Camioane International, când se încarcă harta Google și cum poți controla cookie-urile din browser.",
  path: "/politica-de-cookie-uri",
});

// Structura paginii. Textul îl furnizează sau îl aprobă clientul (eventual cu un avocat).
const sections = [
  "Ce sunt cookie-urile",
  "Ce cookie-uri folosește acest site",
  "Harta Google Maps",
  "Cum poți controla cookie-urile",
];

export default function CookiePage() {
  return (
    <>
      <PageHero
        eyebrow="Informații legale"
        title="Politica de cookie-uri"
        lead="Ce cookie-uri pot fi folosite pe acest site și cum le poți controla."
      />
      <section className="section" aria-label="Conținutul politicii">
        <div className="container prose">
          <p className="notice">
            [DE COMPLETAT: textul politicii] — Această pagină conține doar structura. Textul se furnizează sau se
            aprobă de client, eventual împreună cu un avocat.
          </p>
          {sections.map((title) => (
            <div key={title} className="stack">
              <h2>{title}</h2>
              <p>[DE COMPLETAT: textul politicii — {title.toLowerCase()}]</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
