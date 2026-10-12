# Site — SC Spalatorie Camioane International S.A (Pitești)

Site de prezentare pentru o spălătorie de camioane și flote: Acasă, Servicii, Despre noi, Contact,
cerere de programare cu confirmare telefonică, formular de contact, galerie, hartă și pagini legale.

Construit cu **Next.js 16 (App Router)** și **TypeScript**. Paginile sunt generate static (rapide), iar cele
două formulare au rute API pe server care validează datele și trimit e-mailuri prin **Resend**.

---

## 1. Cerințe

- **Node.js 22.18 sau mai nou** (testat cu Node 24). Verifică cu `node --version`.
- npm (vine cu Node.js).
- Opțional, pentru verificarea automată în browser: Google Chrome sau Microsoft Edge instalat.

## 2. Instalare și rulare locală

```bash
npm install            # instalează dependențele (o singură dată)
cp .env.example .env.local   # pe Windows: copy .env.example .env.local
npm run dev            # pornește site-ul la http://localhost:3000
```

Fără variabilele Resend completate, site-ul funcționează normal, dar formularele afișează mesajul
„Formularul nu este încă activ. Te rugăm să ne suni la 0745 999 999.”

Pentru versiunea de producție (exact ce rulează pe găzduire):

```bash
npm run build
npm start              # http://localhost:3000
```

## 3. Comenzi

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | Server de dezvoltare, cu reîncărcare automată |
| `npm run build` | Build de producție (verifică și tipurile TypeScript) |
| `npm start` | Pornește build-ul de producție |
| `npm run typecheck` | Verifică tipurile TypeScript |
| `npm test` | **Testele automate**: validare, date, limitare de cereri, logica de server, verificări ale proiectului |
| `npm run test:e2e` | Test end-to-end: pornește site-ul real și un server Resend fals; verifică pagini, linkuri, SEO, headere și fluxul formularelor (necesită `npm run build` înainte) |
| `npm run check:browser` | Verificare în Chrome/Edge: lățimi 320–1440px, scroll orizontal, ținte de 44px, consolă, 404, tastatură, hartă, formulare, LCP/CLS; salvează capturi în `test-results/` (necesită `npm run build`) |

Testele nu au nevoie de unelte instalate în plus: folosesc runner-ul de teste inclus în Node.js
și protocolul DevTools al browserului deja instalat.

## 4. Variabilele de mediu

Toate cheile stau **doar** în variabile de mediu: local în `.env.local` (exclus din git), iar pe găzduire
în panoul de control. Fișierul `.env.example` conține doar numele, fără valori.

| Variabilă | Exemplu de format | Rol |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.domeniu.ro` | Adresa site-ului (canonical, sitemap, Open Graph). Se citește la **build**. |
| `RESEND_API_KEY` | (din contul Resend) | Cheia API pentru trimiterea e-mailurilor |
| `CONTACT_FROM_EMAIL` | `Site Spălătorie <formular@domeniu.ro>` | Expeditorul; trebuie să fie pe domeniul verificat în Resend |
| `CONTACT_TO_EMAIL` | adresa clientului | Unde ajung mesajele și cererile de programare |
| `RESEND_API_URL` | — | Doar pentru teste (serverul Resend fals). Lasă gol în producție. |

### Configurarea Resend (o singură dată)

1. Creează contul Resend **pe numele/adresa clientului** (contul îi aparține lui). Planul gratuit:
   3.000 de e-mailuri pe lună, 100 pe zi (verifică limitele actuale pe resend.com/pricing).
2. În Resend → **Domains**, adaugă domeniul site-ului și introdu înregistrările DNS cerute (SPF/DKIM)
   la firma de la care e cumpărat domeniul. Așteaptă statusul „Verified”.
3. În Resend → **API Keys**, creează o cheie cu permisiunea „Sending access”.
4. Pune cheia și adresele în variabilele de mai sus (local și pe găzduire), apoi repornește site-ul.
5. Trimite un mesaj de test din pagina Contact și verifică dacă ajunge la `CONTACT_TO_EMAIL`
   (uită-te și în dosarul Spam).

## 5. Structura proiectului

```
app/                    pagini (App Router) și rute API
  page.tsx              Acasă
  servicii/ despre/ contact/
  politica-de-confidentialitate/ politica-de-cookie-uri/
  not-found.tsx         pagina 404
  api/contact/          POST /api/contact
  api/programare/       POST /api/programare
  sitemap.ts robots.ts  sitemap.xml și robots.txt
  globals.css           TOATE stilurile; culorile doar în :root
components/             antet, subsol, secțiuni, galerie, hartă, formulare
lib/
  site.ts               datele firmei (UN SINGUR LOC de modificat)
  validation.ts         validarea comună browser + server
  form-handler.ts       logica de server a formularelor
  email.ts              trimiterea prin Resend
public/
  fonts/                Inter (woff2, latin + latin-ext) și licența OFL
  images/               imagini WebP + imaginea Open Graph
  video/                videoclipul de fundal (MP4 + WebM, fără sunet)
tests/                  teste automate (npm test)
scripts/                testul end-to-end și verificarea în browser
```

**Pentru modificări de conținut** (telefon, program, servicii, întrebări frecvente, recenzii, galerie)
editează doar `lib/site.ts`.

## 6. Dependențe (și de ce există)

| Pachet | De ce |
| --- | --- |
| `next` | Paginile și rutele API în același proiect; cerut de formularele cu logică pe server |
| `react`, `react-dom` | Necesare pentru Next.js |
| `typescript`, `@types/*` (doar dezvoltare) | Verificarea tipurilor, care prinde greșelile înainte de publicare |

Nu există alte biblioteci: e-mailul se trimite cu un simplu `fetch` către API-ul Resend, pictogramele sunt
SVG inline, iar galeria folosește elementul nativ `<dialog>`. `npm audit`: **0 vulnerabilități** (12.10.2026).

## 7. Publicare

> Nu publica nimic fără acordul clientului. Pașii de mai jos se fac abia după confirmare.

Site-ul are nevoie de o găzduire care rulează **Node.js** (pentru rutele API). Variante:

| Găzduire | Avantaje | Atenție |
| --- | --- | --- |
| **Vercel** | Creat de autorii Next.js; publicare din GitHub cu un clic; HTTPS automat | Planul gratuit „Hobby” este doar pentru uz necomercial; pentru o firmă e nevoie de planul Pro (cu plată) |
| **Netlify** | Suportă Next.js; HTTPS automat; plan gratuit | Verifică limitele planului gratuit și termenii pentru uz comercial |
| **VPS sau găzduire cu Node.js** (de ex. la un furnizor din România) | Control total; cost fix | Configurezi singur Node, un proxy (nginx), HTTPS (Let's Encrypt) și repornirea automată |

### Pași generali (Vercel sau Netlify)

1. Urcă proiectul într-un repository **privat** pe GitHub.
2. În Vercel/Netlify: „Import project” → alege repository-ul. Comanda de build: `npm run build`.
3. Adaugă variabilele de mediu din secțiunea 4 (inclusiv `NEXT_PUBLIC_SITE_URL` cu domeniul final).
4. Publică și testează pe adresa temporară primită.
5. **Domeniul**: în panoul găzduirii adaugă domeniul, apoi la firma de domenii setează înregistrările
   DNS indicate (de obicei un `A` pentru `domeniu.ro` și un `CNAME` pentru `www`).
6. **HTTPS**: certificatul se emite automat după ce DNS-ul este corect (poate dura până la câteva ore).
   Verifică apoi că `http://` redirecționează spre `https://`.

### Pe un VPS / găzduire Node.js

```bash
npm ci
npm run build
npm start -- -p 3000      # rulează în spatele nginx, cu un manager de procese (ex. systemd sau pm2)
```

În nginx: HTTPS cu Let's Encrypt (`certbot`) și antetul `X-Forwarded-For` setat de nginx, ca limitarea
de cereri să vadă adresa reală a vizitatorului.

## 8. Securitate

Headerele sunt definite în `next.config.ts` și se aplică pe orice găzduire care rulează Next.js:

| Header | Valoare | Rol |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `frame-src` doar Google Maps; `object-src 'none'`; `frame-ancestors 'none'` etc. | Browserul încarcă resurse doar de pe site |
| `X-Content-Type-Options` | `nosniff` | Blochează interpretarea greșită a fișierelor |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Nu trimite adresa completă a paginii către alte site-uri |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Dezactivează funcții de care site-ul nu are nevoie |
| `X-Frame-Options` | `DENY` | Site-ul nu poate fi încadrat în alte site-uri |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forțează HTTPS (se activează doar pe HTTPS) |

**Compromis documentat:** CSP permite `'unsafe-inline'` pentru scripturi, pentru că paginile statice Next.js
includ scripturi inline. Varianta mai strictă (cu „nonce”) ar face toate paginile dinamice, deci mai lente.
Riscul este redus: site-ul nu afișează conținut trimis de vizitatori.

Protecțiile formularelor (în `lib/form-handler.ts`):

- validare completă pe server (tip, lungime, format, dată în viitor, nu duminica, interval permis);
- acceptă doar JSON trimis de pe propriul domeniu (verificarea antetului `Origin`); formularele nu folosesc
  sesiuni sau cookie-uri, deci nu e nevoie de token CSRF;
- câmp-capcană ascuns pentru roboți (fără CAPTCHA, fără date suplimentare de la vizitator);
- limită de 5 trimiteri în 10 minute per adresă IP; pe găzduiri „serverless” memoria nu este comună între
  instanțe, deci limita este aproximativă;
- datele nu se salvează pe server sau în browser și nu se scriu în jurnale; ajung doar în e-mailul clientului.

## 9. Date personale (informații pentru redactarea politicilor)

Textul politicilor îl furnizează sau îl aprobă clientul, eventual cu un avocat. Faptele tehnice:

- **Formularul de contact** colectează: nume, telefon și/sau e-mail, mesaj, acordul bifat.
- **Cererea de programare** colectează: nume sau firmă, telefon, tip și număr de vehicule, data și intervalul
  preferat, observații opționale, acordul bifat.
- Datele sunt transmise prin **Resend** (furnizor extern, procesator) către adresa de e-mail a clientului.
  Verificați în contul Resend acordul de prelucrare a datelor (DPA) și regiunea de stocare.
- Site-ul **nu** păstrează datele; durata de păstrare a e-mailurilor primite o stabilește clientul.
- Site-ul **nu** folosește cookie-uri proprii, analiză sau pixeli de urmărire.
- **Harta Google** se încarcă doar după apăsarea butonului „Încarcă harta”; abia atunci Google poate seta cookie-uri.
- Linkul WhatsApp deschide aplicația WhatsApp (Meta) doar la apăsare.

## 10. Accesibilitate, performanță și design

- Țintă WCAG 2.1 AA: link „Sari la conținut”, focus vizibil (contur 3px), navigare completă din tastatură,
  etichete vizibile, erori în text legate prin `aria-describedby`, mesaje anunțate cu `aria-live`, meniu cu
  `aria-expanded` și Escape, galerie cu `<dialog>` (Escape, focus înapoi), întrebări cu `<details>`.
- `prefers-reduced-motion`: fără animații, fără derulare lină, videoclipul nu pornește singur.
- Videoclipul de fundal: 1,2 MB pe desktop și 0,6 MB pe mobil (din 5,2 MB), fără sunet, încărcat doar după
  ce pagina s-a încărcat complet. Nu pornește dacă vizitatorul a cerut economisirea datelor. Are buton de
  oprire (cerință WCAG pentru mișcare de peste 5 secunde).
- Imaginile sunt WebP, cu `srcset`, `width` și `height`; cea mai mare are 76 KB.
- Fonturile sunt locale (Inter, woff2) cu `font-display: swap` și un font de rezervă cu proporții potrivite.

Contraste (WCAG, minim 4,5:1 pentru text și 3:1 pentru componente):

| Pereche | Contrast |
| --- | --- |
| Text `#1F2937` pe fundal `#FFFFFF` | 14,68:1 |
| Text buton `#FFFFFF` pe buton `#2563EB` / la hover `#2157CF` | 5,17:1 / 6,31:1 |
| Text pe carduri `#1F2937` pe `#F3F4F6` | 13,34:1 |
| Text secundar (derivat) pe alb / pe `#F3F4F6` | 8,81:1 / 8,01:1 |
| Text secundar pe culoarea principală | 11,59:1 |
| Text alb peste videoclip (strat întunecat, cel mai rău caz) | 7,59:1 |
| Conturul câmpurilor de formular pe alb | 3,82:1 |
| Conturul de focus pe alb / pe culoarea principală | 5,17:1 / 3,43:1 |
| Text de eroare `#B91C1C` pe alb | 6,47:1 |

Abateri de la specificație, explicate:

- **Hero:** specificația cerea o fotografie lângă text. La cererea clientului, videoclipul este fundal,
  cu un strat întunecat care păstrează contrastul de cel puțin 7,59:1.
- **Butonul secundar pe fundal închis** este alb, nu albastru: albastrul are doar 3,43:1 pe `#111827`.
- **Raportul h1 / text** este 3,1 pe desktop, dar circa 2,1 pe telefon, pentru că formula `clamp()` din
  specificație pornește de la 2rem.
- **Butonul „Programează o spălare” pe telefon** este în meniu (nu încape în antet lângă logo, telefon și
  meniu). De la 768px este vizibil direct în antet. Pe telefon apare și în hero, fără scroll, și la finalul paginii.

## 11. Ce mai trebuie completat [DE COMPLETAT]

| Ce | Unde |
| --- | --- |
| Logo-ul firmei (SVG sau PNG transparent) | `components/SiteHeader.tsx`, `lib/site.ts` |
| Domeniul site-ului | variabila `NEXT_PUBLIC_SITE_URL` |
| Adresa completă (stradă, număr, cod poștal) | `lib/site.ts`, `components/JsonLd.tsx`, `app/contact/page.tsx` |
| Confirmarea că duminica e zi liberă și programul de sărbători | `lib/site.ts` |
| Recenzii reale, cu acordul autorilor (secțiunea e ascunsă până atunci) | `lib/site.ts` → `reviews` |
| Lista de prețuri și mențiunea despre TVA (acum: „tarife negociate”) | `app/servicii/page.tsx` |
| Aprobarea clientului pentru întrebările frecvente | `lib/site.ts` → `faq` |
| Fotografia echipei sau a locației | `app/despre/page.tsx` |
| Fotografii reale pentru galerie (acum: cadre din videoclipul clientului) | `lib/site.ts` → `gallery`, `public/images/` |
| Textul Politicii de confidențialitate | `app/politica-de-confidentialitate/page.tsx` |
| Textul Politicii de cookie-uri | `app/politica-de-cookie-uri/page.tsx` |
| Oferta comercială / promoții (nu există; nu am inventat) | — |
| Contul Resend și verificarea domeniului | secțiunea 4 |

## 12. Verificări manuale înainte de predare

- [ ] Chrome pe desktop, plus Edge sau Firefox: toate paginile, meniul, galeria, harta, ambele formulare.
- [ ] Telefon Android (Chrome) și, dacă se poate, iPhone (Safari folosește alt motor de randare).
- [ ] Pe telefon: „Sună acum” deschide aplicația de telefon cu **0745 999 999**.
- [ ] WhatsApp deschide conversația cu numărul corect și mesajul precompletat; nu acoperă butonul de apel.
- [ ] Un mesaj de test și o cerere de programare de test ajung la adresa clientului (după configurarea Resend).
- [ ] Galeria se poate folosi doar cu tastatura: Tab, Enter, săgeți, Escape; focusul revine pe imagine.
- [ ] Pagina Contact: în DevTools → Network nu apare nicio cerere către Google până la „Încarcă harta”.
- [ ] Lighthouse (DevTools → Lighthouse → Mobile) pe fiecare pagină: Performanță ≥ 90, LCP < 2,5 s, CLS < 0,1.
- [ ] După publicare: HTTPS activ, `https://domeniu.ro/sitemap.xml` și `/robots.txt` răspund corect.

## 13. Licențe

- Fontul **Inter**: SIL Open Font License 1.1 (`public/fonts/OFL.txt`).
- Pictogramele sunt bazate pe **Feather Icons** (licență MIT, © 2013–2023 Cole Bemis); sigla WhatsApp
  provine din **Simple Icons** (CC0). WhatsApp este marcă înregistrată a Meta.
- Videoclipul și imaginile derivate din el sunt furnizate de client.
