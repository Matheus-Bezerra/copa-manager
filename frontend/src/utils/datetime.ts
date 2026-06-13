import { format, isValid, parse } from 'date-fns';

export const LOCAL_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function parseLocalDatetime(value: string): Date {
  return parse(value, LOCAL_DATETIME_FORMAT, new Date());
}

export function formatLocalDatetime(date: Date): string {
  return format(date, LOCAL_DATETIME_FORMAT);
}

/** Converte valor do DateTimePicker (horário local) para ISO UTC na API. */
export function localDatetimeToIso(value: string): string {
  return parseLocalDatetime(value).toISOString();
}

/** Converte ISO da API para valor do DateTimePicker no fuso local. */
export function isoToLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return '';

  const date = new Date(iso);
  if (!isValid(date)) return '';

  return formatLocalDatetime(date);
}
