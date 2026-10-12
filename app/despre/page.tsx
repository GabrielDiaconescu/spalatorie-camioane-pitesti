import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import { CtaBand, PageHero, PhotoPlaceholder, SectionHeader } from "@/components/Sections";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Despre noi – spălătorie profesională pentru camioane, Pitești",
  description:
    "Spălătorie pentru camioane, capete tractor și semiremorci din Pitești. Lucrăm cu transportatori locali și internaționali, prin contracte pe termen lung.",
  path: "/despre",
});

const strengths = [
  "Servicii constante, la standarde profesionale de curățenie",
  "Programări flexibile",
  "Prețuri competitive și tarife negociate după volum",
  "Condiții avantajoase pentru flotele cu volume mari de vehicule",
  "Seriozitate și flexibilitate în colaborările pe termen lung",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Despre noi"
        title="Partenerul flotelor de transport din România și din străinătate"
        lead="Spălare și igienizare profesională pentru camioane, capete tractor, semiremorci și flote de transport marfă."
      />

      <section className="section" aria-labelledby="poveste-titlu">
        <div className="container split" data-reveal>
          <div className="stack">
            <p className="eyebrow">Cine suntem</p>
            <h2 id="poveste-titlu">Spălătorie profesională pentru camioane și flote</h2>
            <p>
              Oferim servicii profesionale de spălare și igienizare pentru camioane, capete tractor, semiremorci și
              flote de transport marfă. Lucrăm atât cu transportatori locali, cât și cu companii internaționale de
              logistică și transport.
            </p>
            <p>
              Punem accent pe calitatea serviciilor, pe eficiență și pe respectarea standardelor de curățenie, cu
              soluții adaptate nevoilor fiecărui client. Prin contracte comerciale pe termen lung, construim
              parteneriate stabile cu firme de transport din România și din străinătate.
            </p>

            <h3>Ce ne diferențiază</h3>
            <ul className="check-list">
              {strengths.map((item) => (
                <li key={item}>
                  <Icon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* [DE COMPLETAT: fotografia echipei sau a locației, furnizată de client] */}
          <PhotoPlaceholder label="Echipa sau spălătoria din Prundu, Pitești" />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="galerie-titlu">
        <div className="container" data-reveal>
          <SectionHeader id="galerie-titlu" eyebrow="Galerie" title="Imagini din timpul spălării">
            Apasă pe o imagine pentru a o mări. Te poți deplasa cu săgețile, iar Escape închide imaginea.
          </SectionHeader>
          <Gallery />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
