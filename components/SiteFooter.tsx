import Link from "next/link";
import { CurrentYear } from "./CurrentYear";
import { navigation, site, telHref } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__title">
              {site.brandName} {site.brandSuffix}
            </p>
            <p className="site-footer__list">Spălare și igienizare pentru camioane, capete tractor și semiremorci.</p>
          </div>

          <div>
            <p className="site-footer__title">Contact</p>
            <ul className="site-footer__list">
              <li>
                <a href={telHref} aria-label={`Sună la ${site.phone.display}`}>
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>{site.address.display}</li>
            </ul>
          </div>

          <div>
            <p className="site-footer__title">Program</p>
            <ul className="site-footer__list">
              <li>{site.hoursShort}</li>
              <li>Duminică: închis</li>
            </ul>
          </div>

          <nav aria-label="Linkuri din subsol">
            <p className="site-footer__title">Pagini</p>
            <ul className="site-footer__list">
              {navigation.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>
              </li>
              <li>
                <Link href="/politica-de-cookie-uri">Politica de cookie-uri</Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="site-footer__bottom">
          © <CurrentYear buildYear={new Date().getFullYear()} /> {site.legalName}. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
