import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { primaryAction, site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită – Spălătorie Camioane Pitești",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="section" aria-labelledby="titlu-404">
      <div className="container not-found">
        <p className="eyebrow">Eroare 404</p>
        <h1 id="titlu-404">Pagina nu a fost găsită</h1>
        <p className="lead">
          Pagina căutată nu există sau a fost mutată. Poți reveni la pagina principală sau ne poți contacta direct.
        </p>
        <div className="actions">
          <Link href="/" className="btn btn--primary">
            Mergi la pagina principală
          </Link>
          <Link href={primaryAction.href} className="btn btn--secondary">
            {primaryAction.label}
          </Link>
          <a href={telHref} className="btn btn--secondary" aria-label={`Sună la ${site.phone.display}`}>
            <Icon name="phone" size="sm" />
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
