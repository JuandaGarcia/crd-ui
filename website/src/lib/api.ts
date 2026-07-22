// Single source of truth for the Card API: rendered as the HTML table on the
// page and as the markdown table in /llms-full.txt.

export interface ApiRow {
  prop: string;
  type: string;
  description: string;
}

export const API_ROWS: ApiRow[] = [
  {
    prop: 'number',
    type: 'string',
    description: 'Card number, formatted and masked per brand as you type.',
  },
  {
    prop: 'name',
    type: 'string',
    description: 'Cardholder name; shows a placeholder while empty.',
  },
  {
    prop: 'expiry',
    type: 'string',
    description: 'Expiry date, normalized to MM/YY.',
  },
  {
    prop: 'cvc',
    type: 'string',
    description: 'Security code, shown on the back.',
  },
  {
    prop: 'layout',
    type: "'form' | 'display'",
    description:
      "'form' (default) is the payment-form preview; 'display' presents an existing card for dashboards — expiry/CVC on the front, no flip, reveal by passing the real values.",
  },
  {
    prop: 'variant',
    type: "'sunset' | 'ember' | 'holo' | 'porcelain' | 'graphite' | 'gradient'",
    description: "Card finish; 'sunset' (default) tints its bloom to the brand.",
  },
  {
    prop: 'tilt',
    type: 'boolean',
    description: 'Pointer-tracked 3D hover tilt with a light glare; toggleable any time. Default: false.',
  },
  {
    prop: 'brand',
    type: 'Brand | null',
    description:
      "Force the displayed brand when the number never reaches you (e.g. Stripe Elements); omit for automatic detection from number.",
  },
  {
    prop: 'last4',
    type: 'string',
    description:
      "Show only the last digits ('•••• 4242') when the full number is unknown — saved cards or post-tokenization (e.g. Stripe's PaymentMethod.card.last4).",
  },
  {
    prop: 'focused',
    type: "'number' | 'name' | 'expiry' | 'cvc' | null",
    description: "Highlights the section; 'cvc' flips the card.",
  },
  {
    prop: 'placeholders',
    type: '{ name?: string }',
    description: 'Placeholder text for the empty name.',
  },
  {
    prop: 'locale',
    type: '{ validThru?: string }',
    description: 'Label next to the expiry date.',
  },
  {
    prop: 'logos',
    type: 'Partial<Record<Brand, string>>',
    description: 'Custom inline-SVG brand marks.',
  },
  {
    prop: 'onBrandChange',
    type: '(brand: Brand | null) => void',
    description: 'Fires when the detected brand changes (React/Svelte callback; Vue emits @brand-change).',
  },
];
