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
<Card number="" brand={brand} focused={focused} />

<CardNumberElement
  onChange={(e) => setBrand(brandFromStripe(e.brand))}
  onFocus={() => setFocused('number')}
  onBlur={blur('number')}
/>

{/* focusing the CVC iframe flips the card */}
<CardCvcElement onFocus={() => setFocused('cvc')} onBlur={blur('cvc')} />`;

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
      <Card layout="display" copyable brand="mastercard" last4="5460" variant="graphite" {...details} />
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
  <Card layout="display" copyable brand="mastercard" last4="5460" variant="graphite" v-bind="details" />
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

<Card layout="display" copyable brand="mastercard" last4="5460" variant="graphite" {...details} />
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

export const themingTailwind = `// Every knob is a CSS custom property, so Tailwind arbitrary-property
// utilities theme the card — on the card or any ancestor (they inherit).
// v4: var(--color-*)   ·   v3: theme(colors.*)
<Card
  className="[--crd-radius:1.25rem] [--crd-color:white]
    [--crd-bg:var(--color-indigo-600)] [--crd-shadow:0_10px_40px_theme(colors.indigo.500/40%)]"
/>;`;

export const themingClassNames = `// Style the card's internal sections with a classNames slot map.
// Your classes are merged with the built-ins (state modifiers stay intact).
<Card
  classNames={{
    root: 'shadow-2xl ring-1 ring-white/10',
    number: 'tracking-widest',
    name: 'uppercase',
    metaExpiry: 'tabular-nums opacity-80',
  }}
/>;

// Slots: root · inner · front · back · chip · logo · number · footer ·
//        name · expiry · expiryLabel · expiryValue · meta · metaExpiry ·
//        metaCvc · cvc`;

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
