# kardz

Framework-agnostic credit/debit card visualization for your payment forms.
A zero-dependency vanilla core with thin, idiomatic wrappers per framework.

- **`kardz`** — the core: brand detection, formatting and the card renderer (vanilla TS + CSS).
- **`@kardz/react`** — React wrapper (`<Card />`).
- `@kardz/vue`, `@kardz/svelte` — planned (see [roadmap](#roadmap)).

Inspired by [react-credit-cards](https://github.com/amarofashion/react-credit-cards),
rebuilt as a framework-agnostic core.

## Features

- 💳 Realistic card preview: formatted/masked number, name, expiry, CVC.
- 🔄 3D flip to the back when the CVC is focused (`prefers-reduced-motion` aware).
- 🏷 Live brand detection while typing: Visa, Mastercard, Amex, Discover, Diners Club,
  JCB, UnionPay, Maestro, Elo, Hipercard.
- 🎨 Themeable via CSS custom properties; per-brand gradients out of the box.
- 🌍 Localizable labels and placeholders.
- 📦 Zero runtime dependencies. ESM + CJS + TypeScript types.

## Vanilla usage

```bash
pnpm add kardz
```

```js
import { createCard } from 'kardz';
import 'kardz/styles.css';

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

```bash
pnpm add kardz @kardz/react
```

```tsx
import { useState } from 'react';
import { Card } from '@kardz/react';
import 'kardz/styles.css';

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

Override the custom properties on `.kardz` (or any ancestor):

```css
.kardz {
  --kardz-width: 340px;
  --kardz-radius: 18px;
  --kardz-bg: linear-gradient(135deg, #111, #333);
  --kardz-font: 'SF Mono', monospace;
}
```

Brand themes are plain CSS classes (`.kardz--brand-visa`, …) you can redefine entirely.

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
pnpm test    # vitest across packages
pnpm build   # tsup: ESM + CJS + d.ts
pnpm dev     # playground at localhost:5173
```

## Roadmap

- [ ] `@kardz/vue`
- [ ] `@kardz/svelte`
- [ ] Prebuilt official-logo add-on pack (opt-in)
- [ ] Bank/issuer custom themes gallery

## License

[MIT](./LICENSE)
