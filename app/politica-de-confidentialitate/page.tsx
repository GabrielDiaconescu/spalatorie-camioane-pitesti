import { PageHero } from "@/components/Sections";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Politica de confidențialitate – Spălătorie Camioane Pitești",
  description:
    "Cum prelucrează SC Spalatorie Camioane International S.A datele personale trimise prin formularele site-ului și ce drepturi ai conform GDPR.",
  path: "/politica-de-confidentialitate",
});

// Structura paginii. Textul juridic îl furnizează sau îl aprobă clientul (eventual cu un avocat).
const sections = [
  "Cine suntem (operatorul datelor)",
  "Ce date colectăm",
  "De ce le folosim și temeiul legal",
  "Cât timp păstrăm datele",
  "Cui transmitem datele",
  "Drepturile tale",
  "Cum ne contactezi",
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Informații legale"
        title="Politica de confidențialitate"
        lead={`Cum prelucrează ${site.legalName} datele personale trimise prin acest site.`}
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
