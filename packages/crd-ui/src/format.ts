import { type Brand, getBrandSpec } from './brands';

const DEFAULT_GAPS = [4, 8, 12];
const DEFAULT_LENGTH = 16;
export const MASK_CHAR = '•';

export function normalizeDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength === undefined ? digits : digits.slice(0, maxLength);
}

function groupDigits(digits: string, gaps: number[]): string {
  const parts: string[] = [];
  let previous = 0;
  for (const gap of gaps) {
    if (digits.length <= previous) break;
    parts.push(digits.slice(previous, gap));
    previous = gap;
  }
  if (digits.length > previous) parts.push(digits.slice(previous));
  return parts.join(' ');
}

/** Group the typed digits with spaces according to the brand ('4-6-5' for Amex, etc.). */
export function formatCardNumber(raw: string, brand?: Brand | null): string {
  const spec = brand ? getBrandSpec(brand) : undefined;
  const maxLength = spec ? spec.lengths[spec.lengths.length - 1]! : DEFAULT_LENGTH;
  const digits = normalizeDigits(raw, maxLength);
  return groupDigits(digits, spec?.gaps ?? DEFAULT_GAPS);
}

/**
 * Like formatCardNumber but pads the missing digits with a mask character up
 * to the brand's conventional display length, so the card face always shows a
 * full number silhouette ('4111 11•• •••• ••••').
 */
export function maskCardNumber(raw: string, brand?: Brand | null, maskChar = MASK_CHAR): string {
  const spec = brand ? getBrandSpec(brand) : undefined;
  const targetLength = spec ? spec.maskLength : DEFAULT_LENGTH;
  const maxLength = spec ? spec.lengths[spec.lengths.length - 1]! : DEFAULT_LENGTH;
  const digits = normalizeDigits(raw, maxLength);
  const padded =
    digits.length >= targetLength
      ? digits
      : digits + maskChar.repeat(targetLength - digits.length);
  return groupDigits(padded, spec?.gaps ?? DEFAULT_GAPS);
}

/** Normalize an expiry to 'MM/YY'. Accepts '1224', '12/24', '12/2024', '1/24'… */
export function formatExpiry(raw: string, maskChar = MASK_CHAR): string {
  const digits = normalizeDigits(raw, 6);
  let month = digits.slice(0, 2);
  let year = digits.slice(2);
  // A single leading digit above 1 can only be a month typed without the zero.
  if (month.length === 1 && Number(month) > 1) {
    year = '';
    month = `0${month}`;
  }
  if (year.length === 4) year = year.slice(2);
  else year = year.slice(0, 2);
  const mm = month.padEnd(2, maskChar);
  const yy = year.padEnd(2, maskChar);
  return `${mm}/${yy}`;
}

/** Mask a CVC to its expected length ('•••' or '••••' for Amex). */
export function maskCvc(raw: string, brand?: Brand | null, maskChar = MASK_CHAR): string {
  const length = brand ? getBrandSpec(brand).cvcLength : 3;
  return normalizeDigits(raw, length).replace(/\d/g, maskChar).padEnd(length, maskChar);
}

/** The CVC digits themselves, capped to the brand's expected length. */
export function formatCvc(raw: string, brand?: Brand | null): string {
  const length = brand ? getBrandSpec(brand).cvcLength : 4;
  return normalizeDigits(raw, length);
}
