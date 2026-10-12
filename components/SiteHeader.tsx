import Link from "next/link";
import { Icon } from "./Icon";
import { MainNav } from "./MainNav";
import { primaryAction, site, telHref } from "@/lib/site";

// Antetul: logo în stânga, meniu și acțiuni în dreapta.
// Butoanele de apel și programare apar de două ori în cod (variantă mobil/tabletă și variantă desktop),
// ca ordinea de navigare cu Tab să urmeze ordinea vizuală; doar una dintre variante este afișată.
export function SiteHeader() {
  const callLabel = `Sună la ${site.phone.display}`;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        {/* [DE COMPLETAT: logo-ul firmei] — până atunci afișăm numele cu fontul titlurilor. */}
        <Link href="/" className="logo" aria-label={`${site.brandName} ${site.brandSuffix} — pagina principală`}>
          <span>{site.brandName}</span>
          <span className="logo__suffix">{site.brandSuffix}</span>
        </Link>

        <div className="header-quick">
          <a href={telHref} className="icon-btn" aria-label={callLabel}>
            <Icon name="phone" size="sm" />
          </a>
          <Link href={primaryAction.href} className="btn btn--primary">
            {primaryAction.label}
          </Link>
        </div>

        <MainNav />

        <div className="header-desktop">
          <a href={telHref} className="header-phone" aria-label={callLabel}>
            <Icon name="phone" size="sm" />
            <span className="header-phone__number">{site.phone.display}</span>
          </a>
          <Link href={primaryAction.href} className="btn btn--primary">
            {primaryAction.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
