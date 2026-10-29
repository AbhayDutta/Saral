import type { Field, Schema } from './types';

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizePhone(value: string): string {
  let digits = digitsOnly(value);

  if (digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);

  return digits;
}

export function normalizeEmail(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+(at|@)\s+/g, '@')
    .replace(/\s+(dot|\.)\s+/g, '.')
    .replace(/\s+/g, '')
    .replace(/\.@/g, '@')
    .replace(/@\./g, '@');
}

export function normalizeNumber(value: string): string {
  return value.replace(/,/g, '').replace(/\s+/g, '').trim();
}

export function normalizeDate(value: string): string {
  const input = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const dayFirst = input.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    if (day && month && year) {
      const iso = toIso(expandYear(year), Number(month), Number(day));
      if (iso) return iso;
    }
  }

  const yearFirst = input.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (yearFirst) {
    const [, year, month, day] = yearFirst;
    if (year && month && day) {
      const iso = toIso(Number(year), Number(month), Number(day));
      if (iso) return iso;
    }
  }

  const spoken = input.toLowerCase().match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})$/);
  if (spoken) {
    const [, day, monthName, year] = spoken;
    const month = monthName ? MONTHS[monthName] : undefined;
    if (day && month && year) {
      const iso = toIso(Number(year), month, Number(day));
      if (iso) return iso;
    }
  }

  return input;
}

export function normalizeValue(field: Field, raw: string): string {
  const value = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!value) return '';

  switch (field.type) {
    case 'email':
      return normalizeEmail(value);
    case 'tel':
      return normalizePhone(value);
    case 'number':
      return normalizeNumber(value);
    case 'date':
      return normalizeDate(value);
    case 'checkbox':
      return /^(true|yes|1|checked|haan|haan ji)$/i.test(value) ? 'true' : 'false';
    case 'select':
    case 'radio': {
      const option = field.options?.find(
        (item) =>
          item.value.toLowerCase() === value.toLowerCase() ||
          item.label.toLowerCase() === value.toLowerCase(),
      );
      return option?.value ?? value;
    }
    default:
      return value;
  }
}

export function normalizeValues(
  schema: Schema,
  values: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const field of schema.fields) {
    const raw = values[field.id];
    if (raw === undefined) continue;
    normalized[field.id] = normalizeValue(field, raw);
  }
  return normalized;
}

function expandYear(year: string): number {
  const parsed = Number(year);
  return year.length === 2 ? 2000 + parsed : parsed;
}

function toIso(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}
