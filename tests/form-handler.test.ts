import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { sendEmail, type EmailMessage, type SendResult } from "../lib/email.ts";
import { handleFormRequest, type FormDeps, type FormKind } from "../lib/form-handler.ts";

const ORIGIN = "http://localhost:3000";

const booking = {
  nume: "Transport SRL",
  telefon: "0745 123 456",
  vehicul: "semiremorca",
  numarVehicule: "2",
  data: "2026-10-15",
  interval: "12-15",
  observatii: "Spălare exterioară",
  consimtamant: true,
  website: "",
};

const contact = {
  nume: "Ion Popescu",
  telefon: "",
  email: "ion@firma.ro",
  mesaj: "Aș dori o ofertă pentru 10 camioane.",
  consimtamant: true,
  website: "",
};

function makeRequest(kind: FormKind, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/${kind}`, {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3000", origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function fakeDeps(result: SendResult = "sent", allowed = true) {
  const sent: EmailMessage[] = [];
  const deps: Partial<FormDeps> = {
    send: async (message) => {
      sent.push(message);
      return result;
    },
    limiter: () => ({ allowed, retryAfterSeconds: allowed ? 0 : 420 }),
    today: () => "2026-10-12",
  };
  return { deps, sent };
}

describe("ruta de programare", () => {
  test("o cerere validă trimite un singur e-mail cu toate detaliile", async () => {
    const { deps, sent } = fakeDeps();
    const response = await handleFormRequest(makeRequest("programare", booking), "programare", deps);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.message, /Te sunăm pentru confirmare/);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].subject, "Cerere de programare: joi, 15 octombrie 2026, 12:00–15:00");
    assert.match(sent[0].text, /Telefon: 0745 123 456/);
    assert.match(sent[0].text, /Tip vehicul: Semiremorcă/);
    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  test("datele invalide sunt respinse pe server, cu erori pe câmpuri", async () => {
    const { deps, sent } = fakeDeps();
    const invalid = { ...booking, data: "2026-10-18", telefon: "abc", consimtamant: false };
    const response = await handleFormRequest(makeRequest("programare", invalid), "programare", deps);
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.deepEqual(Object.keys(body.errors).sort(), ["consimtamant", "data", "telefon"]);
    assert.equal(sent.length, 0);
  });

  test("câmpul-capcană completat: răspuns de succes, dar nimic trimis", async () => {
    const { deps, sent } = fakeDeps();
    const response = await handleFormRequest(makeRequest("programare", { ...booking, website: "http://spam.example" }), "programare", deps);
    assert.equal(response.status, 200);
    assert.equal(sent.length, 0);
  });
});

describe("protecțiile comune", () => {
  test("respinge cererile trimise de pe alt site", async () => {
    const { deps, sent } = fakeDeps();
    const fromElsewhere = await handleFormRequest(makeRequest("contact", contact, { origin: "https://alt-site.example" }), "contact", deps);
    assert.equal(fromElsewhere.status, 403);
    const crossSite = new Request(`${ORIGIN}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost:3000", "sec-fetch-site": "cross-site" },
      body: JSON.stringify(contact),
    });
    assert.equal((await handleFormRequest(crossSite, "contact", deps)).status, 403);
    assert.equal(sent.length, 0);
  });

  test("aplică limita de cereri, cu antetul Retry-After", async () => {
    const { deps } = fakeDeps("sent", false);
    const response = await handleFormRequest(makeRequest("contact", contact), "contact", deps);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "420");
    assert.match((await response.json()).message, /7 minute/);
  });

  test("respinge alt format decât JSON, JSON stricat și mesajele prea mari", async () => {
    const { deps } = fakeDeps();
    const form = await handleFormRequest(makeRequest("contact", "nume=Ion", { "content-type": "application/x-www-form-urlencoded" }), "contact", deps);
    assert.equal(form.status, 415);
    assert.equal((await handleFormRequest(makeRequest("contact", "{stricat"), "contact", deps)).status, 400);
    const huge = await handleFormRequest(makeRequest("contact", { ...contact, mesaj: "a".repeat(20_000) }), "contact", deps);
    assert.equal(huge.status, 413);
  });

  test("anunță clar când Resend nu este configurat sau nu răspunde", async () => {
    const notConfigured = await handleFormRequest(makeRequest("contact", contact), "contact", fakeDeps("not-configured").deps);
    assert.equal(notConfigured.status, 503);
    assert.match((await notConfigured.json()).message, /0745 999 999/);
    const failed = await handleFormRequest(makeRequest("contact", contact), "contact", fakeDeps("failed").deps);
    assert.equal(failed.status, 502);
  });

  test("mesajul de contact are adresa vizitatorului ca „reply-to”", async () => {
    const { deps, sent } = fakeDeps();
    const response = await handleFormRequest(makeRequest("contact", contact), "contact", deps);
    assert.equal(response.status, 200);
    assert.equal(sent[0].replyTo, "ion@firma.ro");
    assert.match(sent[0].text, /Telefon: —/);
  });
});

describe("trimiterea prin Resend", () => {
  test("fără variabilele de mediu nu încearcă nicio trimitere", async () => {
    assert.equal(await sendEmail({ subject: "Test", text: "Test" }, {}), "not-configured");
    assert.equal(await sendEmail({ subject: "Test", text: "Test" }, { RESEND_API_KEY: "x", CONTACT_TO_EMAIL: "a@b.ro" }), "not-configured");
  });
});
