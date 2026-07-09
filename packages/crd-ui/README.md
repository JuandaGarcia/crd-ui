# crd-ui

Framework-agnostic credit/debit card visualization for your payment forms.
One package: a zero-dependency vanilla core, with framework adapters as subpaths.

```bash
npm i crd-ui
```

- **`crd-ui`** — the vanilla core: brand detection, formatting and the card renderer.
- **`crd-ui/react`** — React component (`<Card />`).
- `crd-ui/vue`, `crd-ui/svelte` — planned (see [roadmap](#roadmap)).

Inspired by [react-credit-cards](https://github.com/amarofashion/react-credit-cards),
rebuilt as a framework-agnostic core.

## Features

- 💳 Realistic card preview: formatted/masked number, name, expiry, CVC.
- 🔄 3D flip to the back when the CVC is focused (`prefers-reduced-motion` aware).
- 🏷 Live brand detection while typing: Visa, Mastercard, Amex, Discover, Diners Club,
  JCB, UnionPay, Maestro, Elo, Hipercard.
- 🎨 Themeable via CSS custom properties; per-brand gradients out of the box.
- 🌍 Localizable labels and placeholders.
- 📦 Zero runtime dependencies (React is an optional peer, only for `crd-ui/react`).

## Vanilla usage

```js
import { createCard } from 'crd-ui';
import 'crd-ui/styles.css';

const card = createCard(document.querySelector('#preview'), {
  number: '',
  name: '',
  expiry: '',
  cvc: '',
});

numberInput.addEventListener('input', (e) => card.update({ number: e.target.value }));
cvcInput.addEventListener('focus', () => card.update({ focused: 'cvc' })); // flips
cvcInput.addEventListener('blur', () => card.update({ focused: null }));

card.brand;      // 'visa' | 'mastercard' | … | null
card.destroy();  // remove from the DOM
```

## React usage

```tsx
import { useState } from 'react';
import { Card } from 'crd-ui/react';
import 'crd-ui/styles.css';

function PaymentForm() {
  const [number, setNumber] = useState('');
  const [focused, setFocused] = useState(null);

  return (
    <>
      <Card number={number} focused={focused} />
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        onFocus={() => setFocused('number')}
        onBlur={() => setFocused(null)}
      />
      {/* name / expiry / cvc inputs alike */}
    </>
  );
}
```

## Theming

Override the custom properties on `.crd` (or any ancestor):

```css
.crd {
  --crd-width: 340px;
  --crd-radius: 18px;
  --crd-bg: linear-gradient(135deg, #111, #333);
  --crd-font: 'SF Mono', monospace;
}
```

Brand themes are plain CSS classes (`.crd--brand-visa`, …) you can redefine entirely.

### Brand logos

The built-in marks are deliberately **generic** (plain wordmarks / abstract shapes) so the
package ships no trademarked assets. If your product is licensed to display the official
logos, pass your own SVG per brand:

```js
createCard(el, { logos: { visa: '<svg …>…</svg>' } });
```

## Localization

```js
createCard(el, {
  placeholders: { name: 'NOMBRE COMPLETO' },
  locale: { validThru: 'válida hasta' },
});
```

## Development

```bash
pnpm install
pnpm test    # vitest
pnpm build   # tsup: ESM + CJS + d.ts
pnpm dev     # playground
```

## Roadmap

- [ ] `crd-ui/vue`
- [ ] `crd-ui/svelte`
- [ ] Prebuilt official-logo add-on pack (opt-in)
- [ ] Bank/issuer custom themes gallery

## License

[MIT](./LICENSE)
