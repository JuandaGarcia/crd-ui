import { describe, expect, it } from 'vitest';
import { detectBrand } from '../src/brands';

describe('detectBrand', () => {
  it.each([
    ['4111111111111111', 'visa'],
    ['4917610000000000', 'visa'],
    ['5555555555554444', 'mastercard'],
    ['5105105105105100', 'mastercard'],
    ['2223000048400011', 'mastercard'], // 2-series
    ['378282246310005', 'amex'],
    ['341111111111111', 'amex'],
    ['6011111111111117', 'discover'],
    ['6511111111111117', 'discover'],
    ['6445644564456445', 'discover'],
    ['30569309025904', 'dinersclub'],
    ['36700102000000', 'dinersclub'],
    ['3530111333300000', 'jcb'],
    ['6200000000000005', 'unionpay'],
    ['6759649826438453', 'maestro'],
    ['5018000000000009', 'maestro'],
    ['6304000000000000', 'maestro'],
    ['4011788888888888', 'elo'], // Elo despite the leading 4
    ['5066991111111118', 'elo'],
    ['6362970000457013', 'elo'],
    ['6062825624254001', 'hipercard'],
  ])('detects %s as %s', (number, brand) => {
    expect(detectBrand(number)).toBe(brand);
  });

  it('detects tentatively while typing', () => {
    expect(detectBrand('4')).toBe('visa');
    expect(detectBrand('40')).toBe('visa');
    expect(detectBrand('401178')).toBe('elo'); // switches once the Elo BIN is complete
    expect(detectBrand('34')).toBe('amex');
    expect(detectBrand('62')).toBe('unionpay');
  });

  it('ignores formatting characters', () => {
    expect(detectBrand('4111 1111 1111 1111')).toBe('visa');
    expect(detectBrand('3782-822463-10005')).toBe('amex');
  });

  it('returns null when nothing matches', () => {
    expect(detectBrand('')).toBeNull();
    expect(detectBrand('9999999999999999')).toBeNull();
    expect(detectBrand('1')).toBeNull();
  });
});
