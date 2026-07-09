import { describe, expect, it } from 'vitest';
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  maskCardNumber,
  maskCvc,
  normalizeDigits,
} from '../src/format';

describe('normalizeDigits', () => {
  it('strips non-digits and caps the length', () => {
    expect(normalizeDigits('41a1-1 111')).toBe('4111111');
    expect(normalizeDigits('411111', 4)).toBe('4111');
  });
});

describe('formatCardNumber', () => {
  it('groups 4-4-4-4 by default and for visa', () => {
    expect(formatCardNumber('4111111111111111', 'visa')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('groups 4-6-5 for amex', () => {
    expect(formatCardNumber('378282246310005', 'amex')).toBe('3782 822463 10005');
  });

  it('groups 4-6-4 for diners', () => {
    expect(formatCardNumber('30569309025904', 'dinersclub')).toBe('3056 930902 5904');
  });

  it('handles partial input', () => {
    expect(formatCardNumber('41111', 'visa')).toBe('4111 1');
    expect(formatCardNumber('', 'visa')).toBe('');
  });

  it('caps at the longest valid length for the brand', () => {
    expect(formatCardNumber('3782822463100051111', 'amex')).toBe('3782 822463 10005');
  });
});

describe('maskCardNumber', () => {
  it('pads to a full silhouette', () => {
    expect(maskCardNumber('', 'visa')).toBe('•••• •••• •••• ••••');
    expect(maskCardNumber('411111', 'visa')).toBe('4111 11•• •••• ••••');
    expect(maskCardNumber('', 'amex')).toBe('•••• •••••• •••••');
  });

  it('keeps full numbers intact', () => {
    expect(maskCardNumber('4111111111111111', 'visa')).toBe('4111 1111 1111 1111');
  });
});

describe('formatExpiry', () => {
  it('renders MM/YY with mask placeholders', () => {
    expect(formatExpiry('')).toBe('••/••');
    expect(formatExpiry('1')).toBe('1•/••');
    expect(formatExpiry('12')).toBe('12/••');
    expect(formatExpiry('1226')).toBe('12/26');
    expect(formatExpiry('12/26')).toBe('12/26');
  });

  it('pads a single month digit above 1', () => {
    expect(formatExpiry('9')).toBe('09/••');
  });

  it('accepts 4-digit years', () => {
    expect(formatExpiry('12/2026')).toBe('12/26');
  });
});

describe('cvc helpers', () => {
  it('formats and caps to the brand length', () => {
    expect(formatCvc('12345', 'visa')).toBe('123');
    expect(formatCvc('12345', 'amex')).toBe('1234');
  });

  it('masks to the expected length', () => {
    expect(maskCvc('', 'visa')).toBe('•••');
    expect(maskCvc('1', 'amex')).toBe('••••');
  });
});
