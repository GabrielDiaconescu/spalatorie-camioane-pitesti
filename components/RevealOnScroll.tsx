"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Animația de apariție la derulare: doar pentru blocurile [data-reveal] aflate sub ecranul inițial.
// Conținutul este vizibil din start (fără JavaScript sau cu mișcare redusă nu se ascunde nimic).
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (element) => element.getBoundingClientRect().top > window.innerHeight,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("is-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    for (const element of pending) {
      element.classList.add("is-pending");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const element of pending) element.classList.remove("is-pending");
    };
  }, [pathname]);

  return null;
}
