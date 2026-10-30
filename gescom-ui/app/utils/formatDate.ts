import { MONTHS_LONG, MONTHS_SHORT } from "~/data/labels";

// "Hoy" de la aplicación. Se puede sustituir por new Date() cuando haya backend.
export const now = () => new Date();

const two = (n: number) => String(n).padStart(2, "0");

export const hhmm = (d: Date) => `${two(d.getHours())}:${two(d.getMinutes())}`;

/** "2026-09-28T09:15:00" o "2026-10-10" -> Date (sin saltos de zona horaria) */
export function parseDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

/** 28/09/2026 */
export function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = parseDate(value);
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** 28 sep 2026, 09:15 */
export function formatDateTime(value: string): string {
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${hhmm(d)}`;
}

/** "Enero 2026" */
export function formatMonthYear(value: string): string {
  const d = parseDate(value);
  const month = MONTHS_LONG[d.getMonth()];
  return `${month[0].toUpperCase()}${month.slice(1)} ${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "Hace 2 horas", "Ayer, 18:45", "6 oct, 10:20" */
export function formatRelative(value: string): string {
  const d = parseDate(value);
  const today = now();
  const minutes = Math.floor((today.getTime() - d.getTime()) / 60000);

  if (minutes >= 0 && minutes < 1) return "Ahora mismo";
  if (minutes >= 0 && minutes < 60) return `Hace ${minutes} min`;
  if (minutes >= 60 && minutes < 60 * 24 && sameDay(d, today)) {
    const h = Math.floor(minutes / 60);
    return `Hace ${h} ${h === 1 ? "hora" : "horas"}`;
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, yesterday)) return `Ayer, ${hhmm(d)}`;
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${hhmm(d)}`;
  return d.getFullYear() === today.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** Valor para <input type="date"> */
export function toInputDate(d: Date = now()): string {
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** Timestamp para guardar: 2026-10-14T12:30:00 */
export function toTimestamp(d: Date = now()): string {
  return `${toInputDate(d)}T${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
}

/** Suma días a una fecha "YYYY-MM-DD" */
export function addDays(value: string, days: number): string {
  const d = parseDate(value);
  d.setDate(d.getDate() + days);
  return toInputDate(d);
}
