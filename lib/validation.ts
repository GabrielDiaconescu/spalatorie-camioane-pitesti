// Validarea datelor din formulare. Același cod rulează în browser (mesaje imediate, sub câmp)
// și pe server, unde validarea este obligatorie: browserul poate fi ocolit.

import { addDays, isSunday, isValidIsoDate, todayInBucharest } from "./dates.ts";

export type FieldErrors = Record<string, string>;
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

export const VEHICLE_TYPES = {
  camion: "Camion",
  "cap-tractor": "Cap tractor",
  semiremorca: "Semiremorcă",
  flota: "Mai multe vehicule (flotă)",
} as const;

export const TIME_SLOTS = {
  "09-12": "09:00–12:00",
  "12-15": "12:00–15:00",
  "15-18": "15:00–18:00",
} as const;

export type VehicleType = keyof typeof VEHICLE_TYPES;
export type TimeSlot = keyof typeof TIME_SLOTS;

export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
  notesMax: 1000,
  vehiclesMax: 100,
  bookingDaysAhead: 90,
} as const;

export type ContactData = {
  nume: string;
  telefon: string;
  email: string;
  mesaj: string;
};

export type BookingData = {
  nume: string;
  telefon: string;
  vehicul: VehicleType;
  numarVehicule: number;
  data: string;
  interval: TimeSlot;
  observatii: string;
};

// Caractere de control (invizibile). În textele lungi permitem doar Enter și Tab.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const CONTROL_CHARS_MULTILINE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasKey<T extends object>(object: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function nameError(value: string): string | null {
  if (value.length < LIMITS.nameMin) return "Scrie numele tău (minimum 2 caractere).";
  if (value.length > LIMITS.nameMax) return "Numele poate avea maximum 100 de caractere.";
  if (CONTROL_CHARS.test(value)) return "Numele conține caractere nepermise.";
  return null;
}

export function phoneError(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!PHONE_PATTERN.test(value) || digits.length < 9 || digits.length > 15) {
    return "Numărul de telefon nu pare corect. Exemplu: 0745 123 456 sau +40 745 123 456.";
  }
  return null;
}

export function emailError(value: string): string | null {
  if (value.length > LIMITS.emailMax || !EMAIL_PATTERN.test(value)) {
    return "Adresa de e-mail nu pare corectă. Exemplu: nume@firma.ro.";
  }
  return null;
}

const CONSENT_ERROR = "Bifează acordul privind prelucrarea datelor, ca să putem primi mesajul.";

export function validateContact(input: unknown): ValidationResult<ContactData> {
  const source = isRecord(input) ? input : {};
  const errors: FieldErrors = {};

  const nume = text(source.nume);
  const telefon = text(source.telefon);
  const email = text(source.email);
  const mesaj = text(source.mesaj);

  const nameProblem = nameError(nume);
  if (nameProblem) errors.nume = nameProblem;

  if (!telefon && !email) {
    errors.telefon = "Lasă-ne un număr de telefon sau o adresă de e-mail, ca să te putem contacta.";
  } else {
    const phoneProblem = telefon ? phoneError(telefon) : null;
    if (phoneProblem) errors.telefon = phoneProblem;
    const emailProblem = email ? emailError(email) : null;
    if (emailProblem) errors.email = emailProblem;
  }

  if (mesaj.length < LIMITS.messageMin) errors.mesaj = "Scrie un mesaj de cel puțin 10 caractere.";
  else if (mesaj.length > LIMITS.messageMax) errors.mesaj = "Mesajul poate avea maximum 2.000 de caractere.";
  else if (CONTROL_CHARS_MULTILINE.test(mesaj)) errors.mesaj = "Mesajul conține caractere nepermise.";

  if (source.consimtamant !== true) errors.consimtamant = CONSENT_ERROR;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { nume, telefon, email, mesaj } };
}

export function validateBooking(input: unknown, today: string = todayInBucharest()): ValidationResult<BookingData> {
  const source = isRecord(input) ? input : {};
  const errors: FieldErrors = {};

  const nume = text(source.nume);
  const telefon = text(source.telefon);
  const vehicul = text(source.vehicul);
  const numarText = text(typeof source.numarVehicule === "number" ? String(source.numarVehicule) : source.numarVehicule);
  const data = text(source.data);
  const interval = text(source.interval);
  const observatii = text(source.observatii);

  const nameProblem = nameError(nume);
  if (nameProblem) errors.nume = nameProblem;

  if (!telefon) errors.telefon = "Scrie numărul de telefon la care te sunăm pentru confirmare.";
  else {
    const phoneProblem = phoneError(telefon);
    if (phoneProblem) errors.telefon = phoneProblem;
  }

  if (!hasKey(VEHICLE_TYPES, vehicul)) errors.vehicul = "Alege tipul de vehicul.";

  const numarVehicule = Number(numarText);
  if (!/^\d+$/.test(numarText) || numarVehicule < 1 || numarVehicule > LIMITS.vehiclesMax) {
    errors.numarVehicule = "Scrie un număr de vehicule între 1 și 100.";
  }

  if (!isValidIsoDate(data)) errors.data = "Alege o dată validă.";
  else if (data < today) errors.data = "Alege o dată de astăzi încolo.";
  else if (data > addDays(today, LIMITS.bookingDaysAhead)) {
    errors.data = "Primim cereri pentru următoarele 90 de zile. Pentru date mai îndepărtate, sună-ne.";
  } else if (isSunday(data)) errors.data = "Duminica suntem închiși. Alege o zi de luni până sâmbătă.";

  if (!hasKey(TIME_SLOTS, interval)) errors.interval = "Alege intervalul orar preferat.";

  if (observatii.length > LIMITS.notesMax) errors.observatii = "Observațiile pot avea maximum 1.000 de caractere.";
  else if (CONTROL_CHARS_MULTILINE.test(observatii)) errors.observatii = "Observațiile conțin caractere nepermise.";

  if (source.consimtamant !== true) errors.consimtamant = CONSENT_ERROR;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      nume,
      telefon,
      vehicul: vehicul as VehicleType,
      numarVehicule,
      data,
      interval: interval as TimeSlot,
      observatii,
    },
  };
}
