import { Icon } from "./Icon";
import { site, telHref, whatsappHref } from "@/lib/site";

// Pe mobil: bară fixă jos, cu apel (o atingere) și WhatsApp alăturate, fără suprapunere.
// De la 768px: bara dispare (telefonul e în antet) și rămâne un buton WhatsApp plutitor.
export function ContactBar() {
  return (
    <>
      <div className="contact-bar">
        <a href={telHref} className="btn btn--primary" aria-label={`Sună acum la ${site.phone.display}`}>
          <Icon name="phone" size="sm" />
          Sună acum
        </a>
        <a
          href={whatsappHref}
          className="btn btn--whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Scrie-ne pe WhatsApp"
        >
          <Icon name="whatsapp" size="sm" />
          WhatsApp
        </a>
      </div>

      <a
        href={whatsappHref}
        className="btn btn--whatsapp whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Scrie-ne pe WhatsApp"
      >
        <Icon name="whatsapp" />
        WhatsApp
      </a>
    </>
  );
}
