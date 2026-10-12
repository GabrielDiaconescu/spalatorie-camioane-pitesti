"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { mapsEmbedSrc, site } from "@/lib/site";

// Harta în doi pași: la încărcarea paginii nu se face nicio cerere către Google.
// Iframe-ul (care poate seta cookie-uri Google) apare doar după ce vizitatorul apasă butonul.
export function MapConsent() {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // După încărcare mutăm focusul pe hartă, ca vizitatorii de pe tastatură să nu-l piardă.
  useEffect(() => {
    if (loaded) frameRef.current?.focus();
  }, [loaded]);

  return (
    <div className="map">
      {loaded ? (
        <iframe
          ref={frameRef}
          src={mapsEmbedSrc}
          title={`Hartă Google: locația spălătoriei din ${site.address.display}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="map__placeholder">
          <Icon name="mapPin" />
          <p>
            <strong>{site.address.display}</strong>
            <br />
            Harta este oferită de Google Maps. La încărcare, Google poate seta cookie-uri, conform{" "}
            <a href="/politica-de-cookie-uri">Politicii de cookie-uri</a>.
          </p>
          <button type="button" className="btn btn--secondary" onClick={() => setLoaded(true)}>
            Încarcă harta
          </button>
        </div>
      )}
    </div>
  );
}
