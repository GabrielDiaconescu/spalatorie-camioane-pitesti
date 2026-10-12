"use client";

import { useEffect, useState } from "react";

// Anul curent din subsol. Pagina este generată la build (anul din `buildYear`),
// iar în browser îl actualizăm, ca să nu rămână un an vechi până la următorul build.
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const [year, setYear] = useState(buildYear);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
