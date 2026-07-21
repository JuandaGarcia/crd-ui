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
    prop: 'variant',
    type: "'sunset' | 'ember' | 'holo' | 'porcelain' | 'graphite' | 'gradient'",
    description: "Card finish; 'sunset' (default) tints its bloom to the brand.",
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
