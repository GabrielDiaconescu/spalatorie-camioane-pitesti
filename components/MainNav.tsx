"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { navigation, primaryAction, site, telHref } from "@/lib/site";

// Meniul principal. Pe mobil se deschide dintr-un buton; se închide cu Escape, la clic în afară
// sau la alegerea unei pagini. De la 1024px în sus, linkurile sunt mereu vizibile.
export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!navRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn menu-toggle"
        aria-expanded={open}
        aria-controls="meniu-principal"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? "close" : "menu"} />
        <span className="sr-only">Meniu</span>
      </button>

      <nav id="meniu-principal" ref={navRef} className="nav" data-open={open} aria-label="Meniu principal">
        <ul className="nav__list">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav__link"
                  aria-current={active ? "page" : undefined}
                  onClick={close}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav__extra">
          <Link href={primaryAction.href} className="btn btn--primary btn--block" onClick={close}>
            <Icon name="calendar" size="sm" />
            {primaryAction.label}
          </Link>
          <a href={telHref} className="btn btn--secondary btn--block" aria-label={`Sună la ${site.phone.display}`}>
            <Icon name="phone" size="sm" />
            {site.phone.display}
          </a>
        </div>
      </nav>
    </>
  );
}
