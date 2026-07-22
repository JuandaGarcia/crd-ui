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
