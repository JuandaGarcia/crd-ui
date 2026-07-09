import type { Brand } from './brands';

// Generic, home-made marks — deliberately NOT the official brand logos, to keep
// the package free of trademarked assets (same approach as react-credit-cards).
// Consumers can replace them via the `logos` option of createCard.

const wordmark = (text: string, options: { italic?: boolean } = {}): string =>
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">` +
  `<text x="118" y="28" text-anchor="end" font-family="'Avenir Next', 'Segoe UI', sans-serif" ` +
  `font-size="22" font-weight="700" letter-spacing="1" ` +
  `${options.italic ? 'font-style="italic" ' : ''}fill="currentColor">${text}</text></svg>`;

const circles =
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">` +
  `<circle cx="88" cy="20" r="15" fill="currentColor" opacity="0.85"/>` +
  `<circle cx="106" cy="20" r="15" fill="currentColor" opacity="0.5"/></svg>`;

export const LOGOS: Record<Brand, string> = {
  visa: wordmark('VISA', { italic: true }),
  mastercard: circles,
  amex: wordmark('AMEX'),
  discover: wordmark('DISCOVER'),
  dinersclub: wordmark('DINERS'),
  jcb: wordmark('JCB'),
  unionpay: wordmark('UNIONPAY'),
  maestro: circles,
  elo: wordmark('elo'),
  hipercard: wordmark('Hipercard'),
};

export const CHIP_SVG =
  `<svg viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">` +
  `<rect x="1" y="1" width="46" height="34" rx="6" fill="currentColor" opacity="0.9"/>` +
  `<path d="M1 13h14M1 23h14M33 13h14M33 23h14M24 1v10M24 25v10M15 11h18v14H15z" ` +
  `stroke="rgba(0,0,0,0.45)" stroke-width="1.6" fill="none"/></svg>`;
