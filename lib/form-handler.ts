// Logica de server comună pentru cele două formulare (contact și cerere de programare).
// Ordinea verificărilor: origine → limită de cereri → format → capcana anti-spam → validare → trimitere.
// Datele nu se salvează pe server: ajung doar în e-mailul trimis clientului prin Resend.

import { formatDateRo, todayInBucharest } from "./dates.ts";
import { sendEmail, type EmailMessage, type SendResult } from "./email.ts";
import { createRateLimiter, type RateLimitResult } from "./rate-limit.ts";
import { site } from "./site.ts";
import {
  TIME_SLOTS,
  VEHICLE_TYPES,
  validateBooking,
  validateContact,
  type BookingData,
  type ContactData,
} from "./validation.ts";

export type FormKind = "contact" | "programare";

export type FormDeps = {
  send: (message: EmailMessage) => Promise<SendResult>;
  limiter: (key: string) => RateLimitResult;
  today: () => string;
};

// Numele câmpului-capcană: invizibil pentru oameni, dar roboții îl completează.
export const HONEYPOT_FIELD = "website";
const MAX_BODY_BYTES = 10_000;
const TEN_MINUTES = 10 * 60 * 1000;

const limiters: Record<FormKind, FormDeps["limiter"]> = {
  contact: createRateLimiter({ limit: 5, windowMs: TEN_MINUTES }),
  programare: createRateLimiter({ limit: 5, windowMs: TEN_MINUTES }),
};

const SUCCESS: Record<FormKind, string> = {
  contact: "Mulțumim! Mesajul a fost trimis. Îți răspundem cât mai curând.",
  programare: `Mulțumim! Cererea de programare a fost trimisă. Te sunăm pentru confirmare în timpul programului (${site.hoursShort}).`,
};

function reply(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function failure(message: string, status: number, extra: Record<string, unknown> = {}, headers?: Record<string, string>) {
  return reply({ ok: false, message, ...extra }, status, headers);
}

// Acceptăm doar cereri trimise de pe propriul site (antetul Origin trebuie să fie domeniul nostru).
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "necunoscut";
}

function contactEmail(data: ContactData): EmailMessage {
  return {
    subject: `Mesaj nou de pe site de la ${data.nume}`,
    replyTo: data.email || undefined,
    text: [
      "Mesaj nou trimis din formularul de contact al site-ului.",
      "",
      `Nume: ${data.nume}`,
      `Telefon: ${data.telefon || "—"}`,
      `E-mail: ${data.email || "—"}`,
      "",
      "Mesaj:",
      data.mesaj,
      "",
      "Expeditorul și-a dat acordul pentru prelucrarea datelor conform Politicii de confidențialitate.",
    ].join("\n"),
  };
}

function bookingEmail(data: BookingData): EmailMessage {
  const date = formatDateRo(data.data);
  const slot = TIME_SLOTS[data.interval];
  return {
    subject: `Cerere de programare: ${date}, ${slot}`,
    text: [
      "Cerere nouă de programare trimisă de pe site. Sună solicitantul pentru confirmare.",
      "",
      `Nume / firmă: ${data.nume}`,
      `Telefon: ${data.telefon}`,
      `Tip vehicul: ${VEHICLE_TYPES[data.vehicul]}`,
      `Număr de vehicule: ${data.numarVehicule}`,
      `Data preferată: ${date}`,
      `Interval preferat: ${slot}`,
      `Observații: ${data.observatii || "—"}`,
      "",
      "Solicitantul și-a dat acordul pentru prelucrarea datelor conform Politicii de confidențialitate.",
    ].join("\n"),
  };
}

export async function handleFormRequest(
  request: Request,
  kind: FormKind,
  deps: Partial<FormDeps> = {},
): Promise<Response> {
  const send = deps.send ?? sendEmail;
  const limiter = deps.limiter ?? limiters[kind];
  const today = deps.today ?? (() => todayInBucharest());
  const phone = site.phone.display;

  if (!isSameOrigin(request)) return failure("Cererea nu a fost acceptată.", 403);

  const limit = limiter(clientIp(request));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return failure(
      `Ai trimis prea multe cereri. Încearcă din nou peste ${minutes} minute sau sună-ne la ${phone}.`,
      429,
      {},
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return failure("Format de date neacceptat.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return failure("Mesajul este prea lung.", 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return failure("Mesajul este prea lung.", 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return failure("Datele trimise nu au putut fi citite.", 400);
  }

  // Robot detectat: răspundem ca la succes, dar nu trimitem nimic.
  const honeypot = typeof body === "object" && body !== null ? (body as Record<string, unknown>)[HONEYPOT_FIELD] : "";
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return reply({ ok: true, message: SUCCESS[kind] }, 200);
  }

  let message: EmailMessage;
  if (kind === "contact") {
    const result = validateContact(body);
    if (!result.ok) return failure("Verifică câmpurile marcate.", 400, { errors: result.errors });
    message = contactEmail(result.data);
  } else {
    const result = validateBooking(body, today());
    if (!result.ok) return failure("Verifică câmpurile marcate.", 400, { errors: result.errors });
    message = bookingEmail(result.data);
  }

  const sent = await send(message);
  if (sent === "not-configured") {
    return failure(`Formularul nu este încă activ. Te rugăm să ne suni la ${phone}.`, 503);
  }
  if (sent === "failed") {
    return failure(`Mesajul nu a putut fi trimis. Încearcă din nou sau sună-ne la ${phone}.`, 502);
  }
  return reply({ ok: true, message: SUCCESS[kind] }, 200);
}
