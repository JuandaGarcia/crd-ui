[![crd-ui — a credit & debit card component. Dependency-free. Themeable. Localizable.](https://crd-ui.juanda.co/banner.png)](https://crd-ui.juanda.co)

# crd-ui

Framework-agnostic credit/debit card visualization for your payment forms.
One package: a zero-dependency vanilla core, with framework adapters as subpaths.

```bash
npm i crd-ui
```

- **`crd-ui`** — the vanilla core: brand detection, formatting and the card renderer.
- **`crd-ui/react`** — React component (`<Card />`).
- **`crd-ui/vue`** — Vue 3 component (`<Card />`).
- **`crd-ui/svelte`** — Svelte 5 component (`<Card />`).

## Features

- 💳 Realistic card preview: formatted/masked number, name, expiry, CVC.
- 🔄 Choreographed 3D flip when the CVC is focused: the card lifts off with a wrist-flick
  tilt, spring-settles past 180°, and a light sheen sweeps the face (`prefers-reduced-motion` aware).
- 🎯 Magic focus ring: one highlight travels between sections, sliding and morphing to fit
  each one with a spring settle.
- 🪩 Optional 3D hover tilt (`tilt`): the card follows the pointer with a cursor-tracked
  glare (`prefers-reduced-motion` aware).
- 🪪 Two layouts: `'form'` (payment-form preview, default) and `'display'` for presenting a
  card the user owns — dashboards, saved cards, with click-to-reveal.
- 🏷 Live brand detection while typing: Visa, Mastercard, Amex, Discover, Diners Club,
  JCB, UnionPay, Maestro, Elo, Hipercard.
- ✨ Six built-in finishes via `variant` — the default `sunset` tints its color bloom to the
  detected brand.
- 🎨 Themeable via CSS custom properties; per-brand gradients out of the box.
- 🌍 Localizable labels and placeholders.
- 💜 Plays well with Stripe: the `brand` override + `focused` mirror Stripe Elements'
  metadata without ever touching the number — see
  [`examples/stripe`](./examples/stripe).
- 📦 Zero runtime dependencies (React/Vue/Svelte are optional peers, only for their subpaths).

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

## Vue usage

```vue
<script setup>
import { ref } from 'vue';
import { Card } from 'crd-ui/vue';
import 'crd-ui/styles.css';

const number = ref('');
const focused = ref(null);
</script>

<template>
  <Card :number="number" :focused="focused" @brand-change="(b) => console.log(b)" />
  <input
    v-model="number"
    @focus="focused = 'number'"
    @blur="focused = null"
  />
  <!-- name / expiry / cvc inputs alike -->
</template>
```

## Svelte usage

```svelte
<script>
  import Card from 'crd-ui/svelte';
  import 'crd-ui/styles.css';

  let number = $state('');
  let focused = $state(null);
</script>

<Card {number} {focused} />
<input
  bind:value={number}
  onfocus={() => (focused = 'number')}
  onblur={() => (focused = null)}
/>
<!-- name / expiry / cvc inputs alike -->
```

## Variants

Pick the card's finish with the `variant` prop/option:
`'sunset'` (default) · `'ember'` · `'holo'` · `'porcelain'` · `'graphite'` · `'gradient'`.

`sunset` is a light porcelain face with a color bloom that adapts to the detected brand;
`gradient` is the classic dark per-brand gradient. The rest are brand-agnostic finishes —
the brand still shows through its logo and the sunset bloom.

```tsx
import { Card } from 'crd-ui/react';

<Card variant="holo" number={number} focused={focused} />;
```

```js
import { createCard } from 'crd-ui';

const card = createCard(el, { variant: 'holo' });
card.update({ variant: 'graphite' });
```

## Display layout

Set `layout="display"` to present a card the user already owns — dashboards,
saved-card lists, wallet views. Expiry and CVC move to a meta row on the front,
empty values stay masked, the empty name hides, and focusing the CVC no longer
flips the card. Start with `last4` and **reveal** by passing the real values
(fetched securely on demand) — the component only presents; it never stores data.

```tsx
import { useState } from 'react';
import { Card } from 'crd-ui/react';

function SavedCard() {
  const [revealed, setRevealed] = useState(false);
  const details = revealed
    ? { number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' }
    : {};

  return (
    <>
      <Card layout="display" brand="mastercard" last4="5460" variant="graphite" {...details} />
      <button onClick={() => setRevealed((r) => !r)}>
        {revealed ? 'Hide' : 'Reveal details'}
      </button>
    </>
  );
}
```

```js
import { createCard } from 'crd-ui';

const card = createCard(el, { layout: 'display', brand: 'mastercard', last4: '5460' });
// later, when the user asks to reveal:
card.update({ number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' });
```

Add `copyable` to let the user click the revealed number, expiry and CVC to
copy them (with a "Copied" bubble); an optional `onCopy(field, value)` fires
after each copy for your own toast or analytics:

```tsx
<Card layout="display" copyable brand="mastercard" last4="5460" {...details}
  onCopy={(field, value) => console.log('copied', field)} />
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

## AI & agents

The documentation is available as plain markdown for LLMs and coding agents:

- [`crd-ui.juanda.co/llms.txt`](https://crd-ui.juanda.co/llms.txt) — concise index ([llms.txt convention](https://llmstxt.org)).
- [`crd-ui.juanda.co/llms-full.txt`](https://crd-ui.juanda.co/llms-full.txt) — full docs in one markdown file.
- `node_modules/crd-ui/llms.txt` — a compact version ships inside the package.
- The [website](https://crd-ui.juanda.co) has a **Copy Page** button: copy the docs as
  markdown, view them raw, or open them in Claude/ChatGPT.
- [`AGENTS.md`](./AGENTS.md) guides coding agents working on this repo.

## Development

```bash
pnpm install
pnpm test    # vitest
pnpm build   # tsup: ESM + CJS + d.ts
pnpm dev     # playground
```

## Roadmap

- [ ] Prebuilt official-logo add-on pack (opt-in)
- [ ] Bank/issuer custom themes gallery

## License

[MIT](./LICENSE)
