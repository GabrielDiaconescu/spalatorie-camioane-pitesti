import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { CtaBand, PageHero, SectionHeader, ServiceCard } from "@/components/Sections";
import { pageMetadata } from "@/lib/metadata";
import { faq, primaryAction, services, site, telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Servicii spălare camioane, capete tractor și semiremorci",
  description:
    "Spălare exterioară, curățare și igienizare profesională pentru camioane și flote în Pitești. Contracte B2B și tarife negociate după volum și frecvență.",
  path: "/servicii",
});

const serviceIcons: IconName[] = ["droplet", "shield", "truck", "fileText", "tag", "repeat"];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Servicii"
        title="Servicii de spălare pentru camioane și flote"
        lead="Spălare și igienizare pentru camioane, capete tractor și semiremorci, pentru transportatori locali și companii internaționale de logistică."
      />

      <section className="section" aria-labelledby="servicii-titlu">
        <div className="container" data-reveal>
          <SectionHeader id="servicii-titlu" eyebrow="Ce oferim" title="Servicii pentru fiecare vehicul și fiecare flotă">
            Soluții adaptate nevoilor fiecărui client, de la o singură spălare la întreținerea flotei pe termen lung.
          </SectionHeader>
          <ul className="grid grid--3">
            {services.map((service, index) => (
              <ServiceCard key={service.title} icon={serviceIcons[index]} title={service.title} text={service.text} />
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="preturi-titlu">
        <div className="container split split--center" data-reveal>
          <div className="section__header section__header--flush">
            <p className="eyebrow">Prețuri</p>
            <h2 id="preturi-titlu">Tarife negociate pentru flota ta</h2>
            <p className="lead">
              Tarifele se stabilesc în funcție de volumul de vehicule și de frecvența serviciilor. Flotele cu volume
              mari beneficiază de condiții avantajoase.
            </p>
          </div>

          {/* [DE COMPLETAT: lista de prețuri și mențiunea dacă prețurile includ TVA, exact cum le furnizează clientul] */}
          <div className="card">
            <h3>Ce influențează oferta</h3>
            <ul className="check-list">
              <li>
                <Icon name="check" />
                <span>Numărul de vehicule din flotă</span>
              </li>
              <li>
                <Icon name="check" />
                <span>Frecvența serviciilor, inclusiv colaborările recurente pe termen lung</span>
              </li>
            </ul>
            <div className="actions">
              <Link href={primaryAction.href} className="btn btn--primary">
                <Icon name="calendar" size="sm" />
                {primaryAction.label}
              </Link>
              <a href={telHref} className="btn btn--secondary" aria-label={`Sună pentru o ofertă la ${site.phone.display}`}>
                <Icon name="phone" size="sm" />
                Sună pentru ofertă
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* [DE COMPLETAT: aprobarea clientului pentru întrebările frecvente din lib/site.ts] */}
      <section className="section" aria-labelledby="intrebari-titlu">
        <div className="container" data-reveal>
          <SectionHeader id="intrebari-titlu" eyebrow="Întrebări frecvente" title="Răspunsuri rapide" />
          <div className="faq">
            {faq.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}</summary>
                <p className="faq__answer">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
