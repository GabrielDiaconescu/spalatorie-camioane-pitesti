// Toate datele firmei stau aici, într-un singur loc. Paginile și componentele le citesc de aici.
// Informațiile care lipsesc sunt marcate [DE COMPLETAT] și apar în raportul de predare (README).

export const site = {
  // Denumirea legală, exact cum a fost furnizată de client.
  legalName: "SC Spalatorie Camioane International S.A",
  // Numele afișat în antet (cu diacritice). [DE COMPLETAT: logo-ul firmei în SVG sau PNG transparent]
  brandName: "Spălătorie Camioane",
  brandSuffix: "International",

  // [DE COMPLETAT: domeniul site-ului] se setează prin variabila NEXT_PUBLIC_SITE_URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.exemplu.ro").replace(/\/$/, ""),

  phone: {
    display: "0745 999 999",
    e164: "+40745999999",
    whatsapp: "40745999999",
  },
  whatsappMessage: "Bună ziua! Aș dori informații despre spălarea camioanelor.",
  email: "CristianGhita@gmail.com",

  address: {
    // [DE COMPLETAT: strada, numărul și codul poștal] — momentan avem doar zona și orașul.
    area: "Prundu",
    city: "Pitești",
    country: "RO",
    display: "Prundu, Pitești",
    mapQuery: "Prundu, Pitești",
  },

  // Programul furnizat: Luni–Sâmbătă 9–18. Duminica nu a fost menționată, deci o afișăm închisă.
  // [DE COMPLETAT: confirmarea clientului că duminica este zi liberă și programul de sărbători]
  hours: [
    { day: "Luni", schema: "Monday", open: "09:00", close: "18:00" },
    { day: "Marți", schema: "Tuesday", open: "09:00", close: "18:00" },
    { day: "Miercuri", schema: "Wednesday", open: "09:00", close: "18:00" },
    { day: "Joi", schema: "Thursday", open: "09:00", close: "18:00" },
    { day: "Vineri", schema: "Friday", open: "09:00", close: "18:00" },
    { day: "Sâmbătă", schema: "Saturday", open: "09:00", close: "18:00" },
    { day: "Duminică", schema: "Sunday", open: null, close: null },
  ],
  hoursShort: "Luni–Sâmbătă, 09:00–18:00",
} as const;

export const telHref = `tel:${site.phone.e164}`;
export const whatsappHref = `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`;
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapQuery)}`;
export const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&output=embed`;

// Acțiunea principală aleasă de client: programarea unei spălări.
export const primaryAction = {
  label: "Programează o spălare",
  href: "/contact#programare",
};

export const navigation = [
  { href: "/", label: "Acasă" },
  { href: "/servicii", label: "Servicii" },
  { href: "/despre", label: "Despre noi" },
  { href: "/contact", label: "Contact" },
] as const;

// Serviciile, formulate doar pe baza descrierii furnizate de client. Nu avem prețuri.
export const services = [
  {
    title: "Spălare exterioară",
    text: "Spălare exterioară pentru camioane, capete tractor și semiremorci, cu accent pe calitate și eficiență.",
  },
  {
    title: "Curățare și igienizare profesională",
    text: "Curățare și igienizare profesională, cu respectarea standardelor de curățenie și soluții adaptate fiecărui client.",
  },
  {
    title: "Servicii dedicate flotelor",
    text: "Soluții adaptate nevoilor fiecărei flote de transport marfă, cu programări flexibile.",
  },
  {
    title: "Contracte comerciale B2B",
    text: "Contracte cu firme de transport din România și din străinătate, pentru parteneriate stabile.",
  },
  {
    title: "Tarife negociate",
    text: "Tarife stabilite în funcție de volumul de vehicule și de frecvența serviciilor.",
  },
  {
    title: "Colaborări recurente",
    text: "Întreținerea flotei pe termen lung, cu servicii constante și condiții avantajoase pentru volume mari.",
  },
] as const;

// [DE COMPLETAT: aprobarea clientului] — întrebările sunt formulate exclusiv din datele furnizate,
// dar trebuie confirmate de client înainte de publicare.
export const faq = [
  {
    q: "Ce tipuri de vehicule spălați?",
    a: "Spălăm camioane, capete tractor și semiremorci, atât pentru transportatori locali, cât și pentru companii internaționale de logistică.",
  },
  {
    q: "Lucrați pe bază de contract?",
    a: "Da. Încheiem contracte comerciale B2B cu firme de transport din România și din străinătate, inclusiv pentru colaborări recurente pe termen lung.",
  },
  {
    q: "Cum se stabilesc tarifele?",
    a: "Tarifele se negociază în funcție de numărul de vehicule și de frecvența serviciilor. Flotele cu volume mari beneficiază de condiții avantajoase.",
  },
  {
    q: "Care este programul?",
    a: "Lucrăm de luni până sâmbătă, între orele 09:00 și 18:00. Pentru o programare, trimite o cerere sau sună-ne la 0745 999 999.",
  },
  {
    q: "Cum fac o programare?",
    a: "Completezi cererea de programare de pe pagina Contact, cu data și intervalul preferat, iar noi te sunăm pentru confirmare.",
  },
] as const;

// [DE COMPLETAT: recenzii reale] — text, prenume sau inițiale, sursa și acordul autorului.
// Cât timp lista este goală, secțiunea de recenzii nu apare pe site.
export const reviews: ReadonlyArray<{ text: string; author: string; source: string }> = [];

// Galeria folosește cadre extrase din videoclipul furnizat de client.
// [DE COMPLETAT: fotografii reale ale locației și ale echipei, dacă clientul le are]
export const gallery = [
  {
    file: "galerie-perii",
    alt: "Cap tractor alb în boxa de spălare, curățat de periile rotative albastre ale instalației automate",
  },
  {
    file: "galerie-roti",
    alt: "Jet de apă sub presiune îndreptat spre roțile duble ale unei semiremorci",
  },
  {
    file: "galerie-angajat",
    alt: "Angajat în vestă reflectorizantă cu inscripția „Spălătorie Camioane” spălând grila unui cap tractor",
  },
  {
    file: "galerie-uscare",
    alt: "Camion alb sub suflantele de uscare, la ieșirea din boxa de spălare",
  },
] as const;
