/**
 * CatatDuit Formatting Utilities (IDR Currency, Dates in WIB / Asia/Jakarta)
 */

export const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format number to IDR string without decimals (e.g. 1500000 -> "Rp 1.500.000")
 */
export function formatRupiah(amount: number | bigint): string {
  return idrFormatter.format(amount);
}

/**
 * Parse IDR string input to pure number (e.g. "1.500.000" or "Rp 1.500.000" -> 1500000)
 */
export function parseRupiahInput(value: string): number {
  const cleanStr = value.replace(/[^0-9]/g, '');
  if (!cleanStr) return 0;
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Format Date to Indonesian localized string (e.g. "29 Oktober 2026")
 */
export function formatDateID(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

/**
 * Format Date to Day, Date (e.g. "Rabu, 29 Oktober 2026")
 */
export function formatFullDateID(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

/**
 * Format Month & Year for Dashboard Header (e.g. "Oktober 2026")
 */
export function formatMonthYearID(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

/**
 * Get current date string in WIB (Asia/Jakarta) format YYYY-MM-DD
 */
export function getTodayWIB(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Get first day of month (YYYY-MM-01) for a given date in WIB
 */
export function getFirstDayOfMonthWIB(date: Date = new Date()): string {
  const wibDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).format(date);
  return `${wibDate}-01`;
}

