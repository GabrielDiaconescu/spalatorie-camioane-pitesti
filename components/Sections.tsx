import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { primaryAction, site, telHref } from "@/lib/site";

// Blocuri de pagină reutilizabile, ca toate paginile să arate la fel.

export function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="page-hero" aria-labelledby="titlu-pagina">
      <div className="container">
        <div className="page-hero__inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="titlu-pagina">{title}</h1>
          <p className="lead">{lead}</p>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section__header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </div>
  );
}

export function ServiceCard({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <li className="card">
      <span className="card__icon">
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      <p className="card__text">{text}</p>
    </li>
  );
}

// Fotografie lipsă: bloc colorat până când clientul trimite imaginea reală.
export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="photo-placeholder" role="img" aria-label={`Fotografie lipsă: ${label}`}>
      <span>
        Fotografie [DE COMPLETAT]
        <br />
        {label}
      </span>
    </div>
  );
}

// Banda de la finalul paginii, cu acțiunea principală.
export function CtaBand() {
  return (
    <section className="section section--dark" aria-labelledby="cta-titlu">
      <div className="container cta-band__inner" data-reveal>
        <div className="section__header section__header--flush">
          <h2 id="cta-titlu">Programează o spălare pentru camionul sau flota ta</h2>
          <p className="lead">
            {site.hoursShort}. Trimite cererea online, iar noi te sunăm pentru confirmare.
          </p>
        </div>
        <div className="actions">
          <Link href={primaryAction.href} className="btn btn--primary">
            <Icon name="calendar" size="sm" />
            {primaryAction.label}
          </Link>
          <a href={telHref} className="btn btn--on-dark" aria-label={`Sună la ${site.phone.display}`}>
            <Icon name="phone" size="sm" />
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
