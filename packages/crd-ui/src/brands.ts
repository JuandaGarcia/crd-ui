export type Brand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'dinersclub'
  | 'jcb'
  | 'unionpay'
  | 'maestro'
  | 'elo'
  | 'hipercard';

/** Inclusive numeric prefix range, e.g. ['51', '55'] matches 51xx… through 55xx… */
type PrefixRange = [string, string];

export interface BrandSpec {
  name: Brand;
  displayName: string;
  ranges: PrefixRange[];
  /** Indices where a space goes when formatting, e.g. [4, 8, 12] for 4-4-4-4. */
  gaps: number[];
  /** Valid full lengths. */
  lengths: number[];
  /** Conventional display length used to pad the masked number. */
  maskLength: number;
  cvcLength: number;
}

const range = (start: string, end: string = start): PrefixRange => [start, end];

// Generic brands first: on ambiguous short input (e.g. a lone '4') the earlier,
// more common brand wins until enough digits arrive to confirm a specific one.
export const BRANDS: BrandSpec[] = [
  {
    name: 'visa',
    displayName: 'Visa',
    ranges: [range('4')],
    gaps: [4, 8, 12],
    lengths: [13, 16, 19],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'mastercard',
    displayName: 'Mastercard',
    ranges: [range('51', '55'), range('2221', '2720')],
    gaps: [4, 8, 12],
    lengths: [16],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'amex',
    displayName: 'American Express',
    ranges: [range('34'), range('37')],
    gaps: [4, 10],
    lengths: [15],
    maskLength: 15,
    cvcLength: 4,
  },
  {
    name: 'discover',
    displayName: 'Discover',
    ranges: [range('6011'), range('644', '649'), range('65')],
    gaps: [4, 8, 12],
    lengths: [16, 19],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'dinersclub',
    displayName: 'Diners Club',
    ranges: [range('300', '305'), range('36'), range('38', '39')],
    gaps: [4, 10],
    lengths: [14, 16, 19],
    maskLength: 14,
    cvcLength: 3,
  },
  {
    name: 'jcb',
    displayName: 'JCB',
    ranges: [range('3528', '3589')],
    gaps: [4, 8, 12],
    lengths: [16, 17, 18, 19],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'unionpay',
    displayName: 'UnionPay',
    ranges: [range('62')],
    gaps: [4, 8, 12],
    lengths: [16, 17, 18, 19],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'maestro',
    displayName: 'Maestro',
    ranges: [
      range('5018'),
      range('5020'),
      range('5038'),
      range('5893'),
      range('6304'),
      range('6759'),
      range('6761', '6763'),
    ],
    gaps: [4, 8, 12],
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'elo',
    displayName: 'Elo',
    ranges: [
      range('401178'),
      range('401179'),
      range('431274'),
      range('438935'),
      range('451416'),
      range('457393'),
      range('457631'),
      range('457632'),
      range('504175'),
      range('506699', '506778'),
      range('509000', '509999'),
      range('627780'),
      range('636297'),
      range('636368'),
      range('650031', '650051'),
      range('650405', '650439'),
      range('650485', '650538'),
      range('650541', '650598'),
      range('650700', '650718'),
      range('650720', '650727'),
      range('650901', '650978'),
      range('651652', '651679'),
      range('655000', '655058'),
    ],
    gaps: [4, 8, 12],
    lengths: [16],
    maskLength: 16,
    cvcLength: 3,
  },
  {
    name: 'hipercard',
    displayName: 'Hipercard',
    ranges: [range('606282')],
    gaps: [4, 8, 12],
    lengths: [16],
    maskLength: 16,
    cvcLength: 3,
  },
];

const SPECS_BY_NAME = new Map(BRANDS.map((spec) => [spec.name, spec]));

export function getBrandSpec(brand: Brand): BrandSpec {
  // The map is built from BRANDS, which covers every Brand value.
  return SPECS_BY_NAME.get(brand)!;
}

/**
 * Map the brand slug Stripe reports (Elements' change event or
 * PaymentMethod.card.brand) to a crd-ui Brand, ready for the `brand` option:
 * Stripe says 'diners' where crd-ui says 'dinersclub'; 'unknown' and any
 * slug crd-ui doesn't support return null (the unknown card state).
 */
export function brandFromStripe(stripeBrand: string): Brand | null {
  if (stripeBrand === 'diners') return 'dinersclub';
  return SPECS_BY_NAME.has(stripeBrand as Brand) ? (stripeBrand as Brand) : null;
}

/**
 * How well `digits` matches a range: the range's prefix length when the input
 * fully covers it, 0.5 when the input is a shorter prefix that could still
 * grow into a match, 0 when it cannot match.
 */
function rangeMatchStrength(digits: string, [start, end]: PrefixRange): number {
  const compareLength = Math.min(digits.length, start.length);
  if (compareLength === 0) return 0;
  const value = Number(digits.slice(0, compareLength));
  const min = Number(start.slice(0, compareLength));
  const max = Number(end.slice(0, compareLength));
  if (value < min || value > max) return 0;
  return digits.length >= start.length ? start.length : 0.5;
}

/**
 * Detect the card brand from a (possibly partial) card number.
 * Non-digit characters are ignored. Returns null when nothing matches.
 *
 * When several brands match, the one with the longest confirmed prefix wins
 * (e.g. '4011 78…' is Elo, not Visa); a tentative partial match never beats a
 * confirmed one, so a lone '4' is reported as Visa.
 */
export function detectBrand(number: string): Brand | null {
  const digits = number.replace(/\D/g, '');
  let best: Brand | null = null;
  let bestStrength = 0;
  for (const spec of BRANDS) {
    for (const r of spec.ranges) {
      const strength = rangeMatchStrength(digits, r);
      if (strength > bestStrength) {
        bestStrength = strength;
        best = spec.name;
      }
    }
  }
  return best;
}
