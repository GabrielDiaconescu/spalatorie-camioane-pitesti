"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";
import { gallery } from "@/lib/site";

const thumbSrcSet = (file: string) => `/images/${file}-400.webp 400w, /images/${file}-800.webp 800w`;
const largeSrcSet = (file: string) => `/images/${file}-800.webp 800w, /images/${file}-1280.webp 1280w`;

// Galerie cu mărire accesibilă. Folosim elementul nativ <dialog>: ține focusul în interior
// și se închide cu Escape; la închidere, focusul revine pe imaginea de pornire.
export function Gallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerIndex = useRef(0);
  const [index, setIndex] = useState(0);
  const current = gallery[index];

  function open(position: number) {
    openerIndex.current = position;
    setIndex(position);
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  }

  function show(step: number) {
    setIndex((value) => (value + step + gallery.length) % gallery.length);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight") show(1);
    if (event.key === "ArrowLeft") show(-1);
  }

  return (
    <>
      <ul className="gallery">
        {gallery.map((image, position) => (
          <li key={image.file}>
            <button
              ref={(element) => {
                triggerRefs.current[position] = element;
              }}
              type="button"
              className="gallery__button"
              onClick={() => open(position)}
              aria-label={`Mărește imaginea: ${image.alt}`}
            >
              <img
                src={`/images/${image.file}-800.webp`}
                srcSet={thumbSrcSet(image.file)}
                sizes="(min-width: 1024px) 290px, 50vw"
                width={800}
                height={450}
                alt={image.alt}
                loading="lazy"
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label="Imagine mărită din galerie"
        onKeyDown={onKeyDown}
        onClose={() => triggerRefs.current[openerIndex.current]?.focus()}
        onClick={(event) => {
          // Clic pe fundalul întunecat (în afara conținutului) închide imaginea.
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="lightbox__bar">
          <p className="lightbox__caption" aria-live="polite">
            Imaginea {index + 1} din {gallery.length}
          </p>
          <div className="lightbox__nav">
            <button type="button" className="icon-btn icon-btn--on-dark" onClick={() => show(-1)} aria-label="Imaginea anterioară">
              <Icon name="chevronLeft" />
            </button>
            <button type="button" className="icon-btn icon-btn--on-dark" onClick={() => show(1)} aria-label="Imaginea următoare">
              <Icon name="chevronRight" />
            </button>
            <button
              ref={closeRef}
              type="button"
              className="icon-btn icon-btn--on-dark"
              onClick={() => dialogRef.current?.close()}
              aria-label="Închide imaginea"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>
        <figure className="lightbox__figure">
          <img
            key={current.file}
            src={`/images/${current.file}-1280.webp`}
            srcSet={largeSrcSet(current.file)}
            sizes="(min-width: 1232px) 1200px, calc(100vw - 32px)"
            width={1280}
            height={720}
            alt={current.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="lightbox__caption">{current.alt}</figcaption>
        </figure>
      </dialog>
    </>
  );
}
