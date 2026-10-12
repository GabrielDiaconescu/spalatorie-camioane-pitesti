// Funcții pentru date calendaristice în format AAAA-LL-ZZ, calculate pe fusul orar al României.

const TIME_ZONE = "Europe/Bucharest";

export function todayInBucharest(now: Date = new Date()): string {
  // Formatul „en-CA” produce exact AAAA-LL-ZZ.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtcDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = toUtcDate(value);
  // Respinge date inexistente, de exemplu 2026-02-30.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function addDays(iso: string, days: number): string {
  const date = toUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isSunday(iso: string): boolean {
  return toUtcDate(iso).getUTCDay() === 0;
}

export function formatDateRo(iso: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toUtcDate(iso));
}
