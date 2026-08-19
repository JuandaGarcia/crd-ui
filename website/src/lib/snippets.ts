export const usage = {
  react: `import { useState } from 'react';
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
}`,
  vanilla: `import { createCard } from 'crd-ui';
import 'crd-ui/styles.css';

const card = createCard(document.querySelector('#preview'), {
  number: '',
  name: '',
  expiry: '',
  cvc: '',
});

numberInput.addEventListener('input', (e) => {
  card.update({ number: e.target.value });
});
cvcInput.addEventListener('focus', () => card.update({ focused: 'cvc' })); // flips
cvcInput.addEventListener('blur', () => card.update({ focused: null }));

card.brand;      // 'visa' | 'mastercard' | … | null
card.destroy();  // remove from the DOM`,
  vue: `<script setup>
import { ref } from 'vue';
import { Card } from 'crd-ui/vue';
import 'crd-ui/styles.css';

const number = ref('');
const focused = ref(null);
</script>

<template>
  <Card :number="number" :focused="focused" />
  <input
    v-model="number"
    @focus="focused = 'number'"
    @blur="focused = null"
  />
  <!-- name / expiry / cvc inputs alike -->
</template>`,
  svelte: `<script>
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
<!-- name / expiry / cvc inputs alike -->`,
};

export const stripeExample = `import { CardCvcElement, CardNumberElement } from '@stripe/react-stripe-js';
import { Card, brandFromStripe, type Brand } from 'crd-ui/react';

// Stripe reports the brand without ever exposing the number (PCI iframes) —
// exactly what a display-only preview needs. brandFromStripe() translates
// Stripe's slugs (e.g. 'diners' → 'dinersclub'; 'unknown' → null).
const [brand, setBrand] = useState<Brand | null>(null);
const [focused, setFocused] = useState(null);

// Stripe iframe events arrive async (postMessage): a field's blur can land
// AFTER the next field's focus — only clear if the focus is still ours.
const blur = (field) => () => setFocused((f) => (f === field ? null : f));

{/* digits stay masked — they only exist inside Stripe's iframes */}
<Card
  number=""
  brand={brand}
  focused={focused}
/>

<CardNumberElement
  onChange={(e) => setBrand(brandFromStripe(e.brand))}
  onFocus={() => setFocused('number')}
  onBlur={blur('number')}
/>

{/* focusing the CVC iframe flips the card */}
<CardCvcElement
  onFocus={() => setFocused('cvc')}
  onBlur={blur('cvc')}
/>`;

export const displayExample = {
  react: `import { useState } from 'react';
import { Card } from 'crd-ui/react';

function SavedCard() {
  const [revealed, setRevealed] = useState(false);

  // In a real app the reveal handler fetches the sensitive values on demand.
  const details = revealed
    ? { number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' }
    : {};

  return (
    <>
      {/* copyable makes the revealed number/exp/cvc click-to-copy */}
      <Card
        layout="display"
        copyable
        brand="mastercard"
        last4="5460"
        variant="graphite"
        {...details}
      />
      <button onClick={() => setRevealed((r) => !r)}>
        {revealed ? 'Hide' : 'Reveal details'}
      </button>
    </>
  );
}`,
  vanilla: `import { createCard } from 'crd-ui';
import 'crd-ui/styles.css';

const card = createCard(el, {
  layout: 'display',
  copyable: true, // revealed number/exp/cvc become click-to-copy
  brand: 'mastercard',
  last4: '5460',
  variant: 'graphite',
});

// later, when the user asks to reveal (fetch the real values first):
revealBtn.addEventListener('click', () => {
  card.update({ number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' });
});`,
  vue: `<script setup>
import { ref } from 'vue';
import { Card } from 'crd-ui/vue';
import 'crd-ui/styles.css';

const details = ref({});
const reveal = () => {
  // fetch the real values on demand
  details.value = { number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' };
};
</script>

<template>
  <Card
    layout="display"
    copyable
    brand="mastercard"
    last4="5460"
    variant="graphite"
    v-bind="details"
  />
  <button @click="reveal">Reveal details</button>
</template>`,
  svelte: `<script>
  import Card from 'crd-ui/svelte';
  import 'crd-ui/styles.css';

  let details = $state({});
  const reveal = () => {
    // fetch the real values on demand
    details = { number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' };
  };
</script>

<Card
  layout="display"
  copyable
  brand="mastercard"
  last4="5460"
  variant="graphite"
  {...details}
/>
<button onclick={reveal}>Reveal details</button>`,
};

export const theming = `.crd {
  --crd-width: 340px;
  --crd-radius: 18px;
  --crd-bg: linear-gradient(135deg, #111, #333);
  --crd-font: 'SF Mono', monospace;
}

/* Brand themes are plain classes you can redefine entirely */
.crd--brand-visa {
  --crd-bg: linear-gradient(135deg, #1a1f71, #4b6cb7);
}`;

export const themingTailwind = `// Every knob is a CSS custom property whose default is a var()
// fallback, never a declaration on .crd — so utilities theme the
// card with zero config, on the card or on any ancestor.
// v4: var(--color-*)   ·   v3: theme(colors.*)
<Card
  className="[--crd-radius:1.25rem] [--crd-color:white]
    [--crd-bg:var(--color-indigo-600)]
    [--crd-shadow:0_10px_40px_theme(colors.indigo.500/40%)]"
/>;`;

export const themingLayer = `/* app.css — optional: only for utilities that must override the
   card's own rules (font-size, letter-spacing…). Theming through
   --crd-* works without any of this. Tailwind's utilities sit in
   @layer utilities, and unlayered CSS always wins, so load crd-ui
   pre-wrapped in a layer that you order first. */
@layer crd-ui, theme, base, components, utilities;
@import "tailwindcss";

/* …then import 'crd-ui/styles.layer.css' instead of styles.css */`;

export const themingImageTailwind = `// The image background above, in Tailwind — underscores
// become spaces. variant="gradient" keeps the variant
// artwork from covering the image.
<Card
  variant="gradient"
  className="[--crd-bg:url('/textures/holo.png')_center/cover]"
/>;`;

export const backgroundUsage = `/* Drop the downloaded file in your project and point
   --crd-bg at it. variant="gradient" keeps the variant
   artwork from painting over the image. */
.crd {
  --crd-bg: url('/backgrounds/opal.webp') center / cover;
}`;

export const themingClassNames = `// Style the card's internal sections with a classNames slot map.
// Your classes merge with the built-ins (state modifiers stay).
<Card
  classNames={{
    root: 'shadow-2xl ring-1 ring-white/10',
    number: 'tracking-widest',
    name: 'uppercase',
    metaExpiry: 'tabular-nums opacity-80',
  }}
/>;

// Slots: root · inner · front · back · chip · logo · number ·
//        footer · name · expiry · expiryLabel · expiryValue ·
//        meta · metaExpiry · metaCvc · cvc`;

export const themingImage = `/* --crd-bg is a full CSS background: images work too */
.crd {
  --crd-bg: url('/textures/holo.png') center / cover no-repeat;
}`;

export const logos = {
  react: `<Card logos={{ visa: '<svg …>…</svg>' }} />`,
  vanilla: `createCard(el, { logos: { visa: '<svg …>…</svg>' } });`,
  vue: `<Card :logos="{ visa: '<svg …>…</svg>' }" />`,
  svelte: `<Card logos={{ visa: '<svg …>…</svg>' }} />`,
};

export const localization = {
  react: `<Card
  placeholders={{ name: 'NOMBRE COMPLETO' }}
  locale={{ validThru: 'válida hasta' }}
/>`,
  vanilla: `createCard(el, {
  placeholders: { name: 'NOMBRE COMPLETO' },
  locale: { validThru: 'válida hasta' },
});`,
  vue: `<Card
  :placeholders="{ name: 'NOMBRE COMPLETO' }"
  :locale="{ validThru: 'válida hasta' }"
/>`,
  svelte: `<Card
  placeholders={{ name: 'NOMBRE COMPLETO' }}
  locale={{ validThru: 'válida hasta' }}
/>`,
};

// ---- Migrating from react-credit-cards (and react-credit-cards-2) ----
// Both expose the same prop API, so one set of snippets covers both.

export const migrateBefore = `import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';

<Cards
  number={number}
  name={name}
  expiry={expiry}
  cvc={cvc}
  focused={focused}
/>;`;

export const migrateAfter = `import { Card } from 'crd-ui/react';
import 'crd-ui/styles.css';

<Card
  number={number}
  name={name}
  expiry={expiry}
  cvc={cvc}
  focused={focused}
/>;`;

export const migratePreview = `// preview + issuer becomes the display layout, which also
// reveals real values on demand and can copy them on click.
<Card
  layout="display"
  brand="visa"
  last4="4242"
  copyable
/>;`;

export const migrateCallback = `// callback(type, isValid) has no direct equal: onBrandChange
// reports the brand. Rebuild the rest from the exported helpers.
import { detectBrand, getBrandSpec } from 'crd-ui';

const onNumber = (value) => {
  const brand = detectBrand(value);
  if (!brand) return { brand: null, maxLength: 19, isValid: false };
  const { lengths, maskLength } = getBrandSpec(brand); // maskLength counts digits
  const digits = value.replace(/\\D/g, '').length;
  return { brand, maxLength: maskLength, isValid: lengths.includes(digits) };
};`;

export const migrateAccepted = `// acceptedCards has no equal either — gate on the detected
// brand yourself, which also lets you show your own message.
const ACCEPTED = ['visa', 'mastercard'];

<Card number={number} onBrandChange={(b) => setRejected(!!b && !ACCEPTED.includes(b))} />;`;

export const migrateTheming = `/* The SCSS variables become CSS custom properties, so there is
   no stylesheet to recompile: $rccs-size -> --crd-width, and so on. */
.crd {
  --crd-width: 290px;
  --crd-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  --crd-font: Consolas, Courier, monospace;
}`;
