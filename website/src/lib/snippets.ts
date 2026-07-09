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

export const logos = {
  react: `<Card logos={{ visa: '<svg …>…</svg>' }} />`,
  vanilla: `createCard(el, { logos: { visa: '<svg …>…</svg>' } });`,
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
};
