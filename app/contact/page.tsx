import { BookingForm } from "@/components/forms/BookingForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { Icon } from "@/components/Icon";
import { MapConsent } from "@/components/MapConsent";
import { CtaBand, PageHero } from "@/components/Sections";
import { pageMetadata } from "@/lib/metadata";
import { mapsHref, site, telHref, whatsappHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact și programări – Spălătorie Camioane, Prundu, Pitești",
  description:
    "Programează online spălarea camionului sau a flotei. Telefon 0745 999 999, Prundu, Pitești. Program: luni–sâmbătă, 09:00–18:00. Confirmăm telefonic.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact și programări"
        lead={`Programează o spălare sau scrie-ne. Ne găsești în ${site.address.display}, ${site.hoursShort.toLowerCase()}.`}
      />

      <section className="section" aria-labelledby="program-titlu">
        <div className="container split" data-reveal>
          <div className="card">
            <h2 id="program-titlu">Program de lucru</h2>
            <table className="hours">
              <caption className="sr-only">Programul spălătoriei pe zile ale săptămânii</caption>
              <tbody>
                {site.hours.map((entry) => (
                  <tr key={entry.day} className={entry.open ? undefined : "hours__closed"}>
                    <th scope="row">{entry.day}</th>
                    <td>
                      {entry.open ? (
                        `${entry.open}–${entry.close}`
                      ) : (
                        <span className="badge">Închis</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stack">
            <h2>Date de contact</h2>
            <ul className="contact-list">
              <li>
                <span className="card__icon">
                  <Icon name="phone" />
                </span>
                <span>
                  <span className="contact-list__label">Telefon</span>
                  <a href={telHref} aria-label={`Sună la ${site.phone.display}`}>
                    {site.phone.display}
                  </a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <Icon name="whatsapp" />
                </span>
                <span>
                  <span className="contact-list__label">WhatsApp</span>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Scrie-ne pe WhatsApp">
                    Scrie-ne pe WhatsApp
                  </a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <Icon name="mail" />
                </span>
                <span>
                  <span className="contact-list__label">E-mail</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <Icon name="mapPin" />
                </span>
                <span>
                  <span className="contact-list__label">Adresă</span>
                  {/* [DE COMPLETAT: strada, numărul și codul poștal] */}
                  <span>{site.address.display}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="programare" className="section section--alt" aria-labelledby="programare-titlu">
        <div className="container split split--form">
          <div className="section__header section__header--flush">
            <p className="eyebrow">Programări</p>
            <h2 id="programare-titlu">Programează o spălare</h2>
            <p className="lead">
              Trimite cererea cu data și intervalul preferat. Te sunăm pentru confirmare în timpul programului.
            </p>
            <ol className="steps">
              <li>Completezi cererea de programare.</li>
              <li>Te sunăm și confirmăm ora.</li>
              <li>Vii la spălătorie la ora stabilită.</li>
            </ol>
            <p>
              Preferi telefonul? Sună-ne la{" "}
              <a href={telHref} aria-label={`Sună la ${site.phone.display}`}>
                {site.phone.display}
              </a>
              .
            </p>
          </div>
          <div className="form-card">
            <BookingForm />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="harta-titlu">
        <div className="container split split--form" data-reveal>
          <div className="section__header section__header--flush">
            <p className="eyebrow">Locație</p>
            <h2 id="harta-titlu">Unde ne găsești</h2>
            <p className="lead">{site.address.display}</p>
            <p>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                Deschide în aplicația de hărți
              </a>{" "}
              (se deschide într-un tab nou)
            </p>
          </div>
          <MapConsent />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="mesaj-titlu">
        <div className="container split split--form" data-reveal>
          <div className="section__header section__header--flush">
            <p className="eyebrow">Mesaj</p>
            <h2 id="mesaj-titlu">Trimite-ne un mesaj</h2>
            <p className="lead">
              Ai o întrebare despre servicii sau vrei o ofertă pentru flota ta? Scrie-ne și îți răspundem cât mai
              curând.
            </p>
          </div>
          <div className="form-card">
            <ContactForm />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
