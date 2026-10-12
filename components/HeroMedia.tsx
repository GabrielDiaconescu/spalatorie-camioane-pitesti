"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

// Fundalul hero: imaginea statică se încarcă prima (rapid, prioritar), apoi videoclipul clientului
// pornește după încărcarea paginii. Nu pornește singur dacă vizitatorul a cerut mișcare redusă
// sau economisirea datelor; butonul permite oprirea și pornirea oricând.
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setReady(true);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    if (reducedMotion || saveData) return;

    const start = () => {
      video.play().catch(() => setPlaying(false));
    };

    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  return (
    <>
      <div className="hero__media">
        <img
          src="/images/hero-1280.webp"
          srcSet="/images/hero-640.webp 640w, /images/hero-960.webp 960w, /images/hero-1280.webp 1280w"
          sizes="100vw"
          width={1280}
          height={720}
          alt=""
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className={playing ? "is-playing" : undefined}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src="/video/spalare-camion-854.webm" type="video/webm" media="(max-width: 767px)" />
          <source src="/video/spalare-camion-854.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/video/spalare-camion-1280.webm" type="video/webm" />
          <source src="/video/spalare-camion-1280.mp4" type="video/mp4" />
        </video>
      </div>

      {ready && (
        <button
          type="button"
          className="icon-btn icon-btn--on-dark video-toggle"
          onClick={toggle}
          aria-label={playing ? "Oprește videoclipul de fundal" : "Pornește videoclipul de fundal"}
        >
          <Icon name={playing ? "pause" : "play"} size="sm" />
        </button>
      )}
    </>
  );
}
