// Test end-to-end: pornește site-ul real (build de producție) și un server Resend fals,
// apoi verifică paginile, linkurile, SEO, headerele de securitate și fluxul complet al formularelor.
// Rulare: npm run build && npm run test:e2e

import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { startMockResend, startNext } from "./lib-server.mjs";

const PAGES = ["/", "/servicii", "/despre", "/contact", "/politica-de-confidentialitate", "/politica-de-cookie-uri"];
const CLIENT_EMAIL = "client@test.local";

let server;
let mock;
const html = new Map();

// Fiecare test folosește altă adresă IP, ca limita de cereri să nu afecteze celelalte teste.
let ipCounter = 10;
async function post(path, body, headers = {}) {
  const response = await fetch(server.base + path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: server.base,
      "x-forwarded-for": `10.0.0.${ipCounter++}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

function nextWorkday(daysAhead) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysAhead);
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function nextSunday() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay()) % 7 || 7));
  return date.toISOString().slice(0, 10);
}

const booking = () => ({
  nume: "Transport Test SRL",
  telefon: "0745 123 456",
  vehicul: "flota",
  numarVehicule: "12",
  data: nextWorkday(3),
  interval: "09-12",
  observatii: "Cerere de test",
  consimtamant: true,
  website: "",
});

const contact = () => ({
  nume: "Ion Test",
  telefon: "",
  email: "ion@firma-test.ro",
  mesaj: "Mesaj de test trimis din testul automat.",
  consimtamant: true,
  website: "",
});

const attr = (source, pattern) => source.match(pattern)?.[1];

before(async () => {
  mock = await startMockResend();
  server = await startNext({
    port: 3123,
    env: {
      RESEND_API_KEY: "cheie-de-test",
      RESEND_API_URL: mock.url,
      CONTACT_FROM_EMAIL: "Site <site@test.local>",
      CONTACT_TO_EMAIL: CLIENT_EMAIL,
    },
  });
  for (const path of PAGES) html.set(path, await (await fetch(server.base + path)).text());
});

after(async () => {
  server?.stop();
  await mock?.close();
});

describe("paginile", () => {
  for (const path of PAGES) {
    test(`${path}: limbă, titlu, descriere, canonical, un singur h1, Open Graph`, () => {
      const page = html.get(path);
      assert.match(page, /<html lang="ro"/);
      assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1"/);

      const title = attr(page, /<title>([^<]*)<\/title>/);
      assert.ok(title.length >= 50 && title.length <= 60, `titlu de ${title.length} caractere: „${title}”`);
      const description = attr(page, /<meta name="description" content="([^"]*)"/);
      assert.ok(description.length >= 120 && description.length <= 160, `descriere de ${description.length} caractere`);

      assert.match(page, /<link rel="canonical" href="https?:\/\/[^"]+"/);
      assert.match(page, /<meta property="og:image" content="[^"]+og-spalatorie-camioane\.jpg"/);
      assert.equal(page.match(/<h1[\s>]/g)?.length, 1);
      assert.doesNotMatch(page, /[ŞşŢţ]/, "caractere cu sedilă");
    });
  }

  test("titlurile și descrierile sunt unice", () => {
    const titles = PAGES.map((path) => attr(html.get(path), /<title>([^<]*)<\/title>/));
    const descriptions = PAGES.map((path) => attr(html.get(path), /<meta name="description" content="([^"]*)"/));
    assert.equal(new Set(titles).size, PAGES.length);
    assert.equal(new Set(descriptions).size, PAGES.length);
  });

  test("toate linkurile interne și resursele există (fără 404)", async () => {
    const urls = new Set();
    for (const page of html.values()) {
      for (const [, url] of page.matchAll(/(?:href|src)="(\/[^"#]*)/g)) urls.add(url.replace(/&amp;/g, "&"));
      for (const [, set] of page.matchAll(/srcSet="([^"]+)"/gi)) {
        for (const entry of set.split(",")) urls.add(entry.trim().split(" ")[0]);
      }
    }
    assert.ok(urls.size > 20);
    for (const url of urls) {
      const response = await fetch(server.base + url);
      assert.equal(response.status, 200, url);
    }
  });

  test("pagina 404 personalizată", async () => {
    const response = await fetch(`${server.base}/pagina-care-nu-exista`);
    assert.equal(response.status, 404);
    const page = await response.text();
    assert.match(page, /Pagina nu a fost găsită/);
    assert.match(page, /noindex/);
  });

  test("sitemap.xml, robots.txt și date structurate LocalBusiness", async () => {
    const sitemap = await (await fetch(`${server.base}/sitemap.xml`)).text();
    for (const path of PAGES.slice(1)) assert.ok(sitemap.includes(`${path}</loc>`), path);
    const robots = await (await fetch(`${server.base}/robots.txt`)).text();
    assert.match(robots, /Sitemap: .+\/sitemap\.xml/);

    const json = JSON.parse(attr(html.get("/"), /<script type="application\/ld\+json">(.*?)<\/script>/s));
    assert.equal(json["@type"], "AutoWash");
    assert.equal(json.telephone, "+40745999999");
    assert.equal(json.address.addressLocality, "Pitești");
    assert.deepEqual(json.openingHoursSpecification[0].dayOfWeek.length, 6);
  });

  test("headerele de securitate sunt trimise", async () => {
    const response = await fetch(`${server.base}/`);
    const csp = response.headers.get("content-security-policy");
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-src https:\/\/www\.google\.com/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.match(response.headers.get("permissions-policy"), /camera=\(\)/);
    assert.equal(response.headers.get("x-powered-by"), null);
  });

  test("harta nu este încărcată în HTML-ul inițial (doar după acord)", () => {
    assert.doesNotMatch(html.get("/contact"), /<iframe/);
    assert.match(html.get("/contact"), /Încarcă harta/);
  });

  test("butoanele de apel și WhatsApp au numărul corect", () => {
    const page = html.get("/");
    assert.match(page, /href="tel:\+40745999999"/);
    const whatsapp = page.match(/<a [^>]*href="https:\/\/wa\.me\/40745999999\?text=[^"]+"[^>]*>/g);
    assert.ok(whatsapp?.length >= 1);
    for (const tag of whatsapp) {
      assert.match(tag, /target="_blank"/);
      assert.match(tag, /rel="noopener noreferrer"/);
      assert.match(tag, /aria-label="Scrie-ne pe WhatsApp"/);
    }
  });
});

describe("cererea de programare (fluxul principal)", () => {
  test("o cerere validă ajunge la client prin Resend", async () => {
    const before = mock.received.length;
    const result = await post("/api/programare", booking());
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(mock.received.length, before + 1);
    const email = mock.received.at(-1);
    assert.equal(email.headers.authorization, "Bearer cheie-de-test");
    assert.deepEqual(email.body.to, [CLIENT_EMAIL]);
    assert.match(email.body.subject, /^Cerere de programare: /);
    assert.match(email.body.text, /Mai multe vehicule \(flotă\)/);
  });

  test("datele invalide sunt respinse pe server și nu se trimite nimic", async () => {
    const before = mock.received.length;
    const cases = [
      [{ consimtamant: false }, "consimtamant"],
      [{ data: nextSunday() }, "data"],
      [{ data: "2020-01-01" }, "data"],
      [{ telefon: "123" }, "telefon"],
      [{ interval: "20-22" }, "interval"],
      [{ numarVehicule: "0" }, "numarVehicule"],
    ];
    for (const [change, field] of cases) {
      const result = await post("/api/programare", { ...booking(), ...change });
      assert.equal(result.status, 400, JSON.stringify(change));
      assert.ok(result.body.errors[field], `eroare pentru ${field}`);
    }
    assert.equal(mock.received.length, before);
  });

  test("roboții (câmpul-capcană) primesc succes, dar nu se trimite nimic", async () => {
    const before = mock.received.length;
    const result = await post("/api/programare", { ...booking(), website: "spam" });
    assert.equal(result.status, 200);
    assert.equal(mock.received.length, before);
  });

  test("cererile de pe alt site și formatele greșite sunt refuzate", async () => {
    assert.equal((await post("/api/programare", booking(), { origin: "https://atacator.example" })).status, 403);
    assert.equal((await post("/api/programare", "nume=Ion", { "content-type": "text/plain" })).status, 415);
    const get = await fetch(`${server.base}/api/programare`);
    assert.equal(get.status, 405);
  });

  test("după 5 cereri în 10 minute, aceeași adresă IP este blocată temporar", async () => {
    const headers = { "x-forwarded-for": "10.9.9.9" };
    for (let i = 0; i < 5; i++) assert.equal((await post("/api/programare", { ...booking(), website: "x" }, headers)).status, 200);
    const blocked = await post("/api/programare", booking(), headers);
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  });
});

describe("formularul de contact", () => {
  test("un mesaj valid ajunge la adresa clientului, cu reply-to", async () => {
    const before = mock.received.length;
    const result = await post("/api/contact", contact());
    assert.equal(result.status, 200);
    assert.equal(mock.received.length, before + 1);
    assert.deepEqual(mock.received.at(-1).body.to, [CLIENT_EMAIL]);
    assert.equal(mock.received.at(-1).body.reply_to, "ion@firma-test.ro");
  });

  test("e-mailul invalid sau lipsa acordului blochează trimiterea", async () => {
    const before = mock.received.length;
    const badEmail = await post("/api/contact", { ...contact(), email: "adresa-gresita" });
    assert.equal(badEmail.status, 400);
    assert.match(badEmail.body.errors.email, /nu pare corectă/);
    const noConsent = await post("/api/contact", { ...contact(), consimtamant: false });
    assert.equal(noConsent.status, 400);
    assert.match(noConsent.body.errors.consimtamant, /acordul/);
    assert.equal(mock.received.length, before);
  });
});
