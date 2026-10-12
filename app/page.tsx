import Link from "next/link";
import { HeroMedia } from "@/components/HeroMedia";
import { Icon } from "@/components/Icon";
import { Reviews } from "@/components/Reviews";
import { pageMetadata } from "@/lib/metadata";
import { primaryAction, site, telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Spălătorie camioane în Pitești – flote, TIR-uri și semiremorci",
  description:
    "Spălare exterioară și igienizare pentru camioane, capete tractor și semiremorci în Pitești. Contracte pentru flote. Programează o spălare: 0745 999 999.",
  path: "/",
});

const links = [
  {
    href: "/servicii",
    icon: "truck",
    title: "Servicii",
    text: "Spălare exterioară, curățare și igienizare, servicii dedicate flotelor și contracte B2B.",
    more: "Vezi serviciile",
  },
  {
    href: "/despre",
    icon: "users",
    title: "Despre noi",
    text: "Cum lucrăm cu transportatorii locali și cu companiile internaționale de logistică.",
    more: "Află mai multe",
  },
  {
    href: "/contact",
    icon: "mapPin",
    title: "Contact și program",
    text: `${site.address.display}. ${site.hoursShort}.`,
    more: "Vezi datele de contact",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-titlu">
        <HeroMedia />
        <div className="container">
          <div className="hero__content">
            <p className="eyebrow">{site.address.display}</p>
            <h1 id="hero-titlu">Spălătorie profesională pentru camioane și flote, în Pitești</h1>
            <p className="hero__lead">
              Spălare exterioară și igienizare pentru camioane, capete tractor și semiremorci. Contracte pentru
              transportatori din România și din străinătate.
            </p>
            <div className="actions hero__actions">
              <Link href={primaryAction.href} className="btn btn--primary">
                <Icon name="calendar" size="sm" />
                {primaryAction.label}
              </Link>
              <a href={telHref} className="btn btn--on-dark" aria-label={`Sună la ${site.phone.display}`}>
                <Icon name="phone" size="sm" />
                {site.phone.display}
              </a>
            </div>
            <p className="hero__meta">
              <Icon name="clock" size="sm" />
              {site.hoursShort}
            </p>
          </div>
        </div>
      </section>

      <Reviews />

      <section className="section" aria-labelledby="linkuri-titlu">
        <div className="container" data-reveal>
          <div className="section__header">
            <p className="eyebrow">Pentru transportatori și flote</p>
            <h2 id="linkuri-titlu">Un partener de încredere pentru flota ta</h2>
            <p className="lead">
              Servicii constante, programări flexibile și condiții avantajoase pentru flotele cu volume mari de
              vehicule.
            </p>
          </div>

          <ul className="grid grid--3 grid--stretch">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="card card--link">
                  <span className="card__icon">
                    <Icon name={link.icon} />
                  </span>
                  <h3>{link.title}</h3>
                  <p className="card__text">{link.text}</p>
                  <span className="card__more">
                    {link.more}
                    <Icon name="arrowRight" size="sm" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="actions section__actions">
            <Link href={primaryAction.href} className="btn btn--primary">
              <Icon name="calendar" size="sm" />
              {primaryAction.label}
            </Link>
            <a href={telHref} className="btn btn--secondary" aria-label={`Sună la ${site.phone.display}`}>
              <Icon name="phone" size="sm" />
              {site.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
