import { useState } from 'react';
import { Card, type CardVariant, type FocusedField } from 'crd-ui/react';
import { detectBrand, formatCardNumber, formatExpiry, normalizeDigits } from 'crd-ui';

export function Playground() {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focused, setFocused] = useState<FocusedField | null>(null);
  const [variant, setVariant] = useState<CardVariant>('sunset');
  const [tilt, setTilt] = useState(true);
  const [copied, setCopied] = useState(false);

  const VARIANTS: CardVariant[] = ['sunset', 'ember', 'holo', 'porcelain', 'graphite', 'gradient'];

  const focus = (field: FocusedField) => () => setFocused(field);
  const blur = () => setFocused(null);

  // Builds a ready-to-paste snippet for the framework picked in the masthead,
  // reflecting the playground's current variant/tilt configuration.
  const copyCode = async () => {
    const fw = document.documentElement.dataset.fw ?? 'react';
    const jsxProps =
      (variant !== 'sunset' ? ` variant="${variant}"` : '') + (tilt ? ' tilt' : '');
    const snippets: Record<string, string> = {
      react: `import { Card } from 'crd-ui/react';\nimport 'crd-ui/styles.css';\n\n<Card number={number} name={name} expiry={expiry} cvc={cvc} focused={focused}${jsxProps} />;`,
      vanilla: `import { createCard } from 'crd-ui';\nimport 'crd-ui/styles.css';\n\nconst card = createCard(document.querySelector('#preview'), {${
        variant !== 'sunset' ? `\n  variant: '${variant}',` : ''
      }${tilt ? '\n  tilt: true,' : ''}\n});`,
      vue: `<script setup>\nimport { Card } from 'crd-ui/vue';\nimport 'crd-ui/styles.css';\n</script>\n\n<template>\n  <Card :number="number" :focused="focused"${jsxProps} />\n</template>`,
      svelte: `<script>\n  import Card from 'crd-ui/svelte';\n  import 'crd-ui/styles.css';\n</script>\n\n<Card {number} {focused}${jsxProps} />`,
    };
    await navigator.clipboard.writeText(snippets[fw] ?? snippets.react);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="demo-panel">
      <Card
        number={number}
        name={name}
        expiry={expiry}
        cvc={cvc}
        focused={focused}
        variant={variant}
        tilt={tilt}
      />
      <form className="demo-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Card number
          <input
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4111 1111 1111 1111"
            value={number}
            onChange={(e) =>
              setNumber(formatCardNumber(e.target.value, detectBrand(e.target.value)))
            }
            onFocus={focus('number')}
            onBlur={blur}
          />
        </label>
        <label>
          Name
          <input
            autoComplete="cc-name"
            placeholder="ADA LOVELACE"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={focus('name')}
            onBlur={blur}
          />
        </label>
        <div className="demo-row">
          <label>
            Expiry
            <input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) =>
                setExpiry(formatExpiry(e.target.value).replace(/•/g, '').replace(/\/$/, ''))
              }
              onFocus={focus('expiry')}
              onBlur={blur}
            />
          </label>
          <label>
            CVC
            <input
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(normalizeDigits(e.target.value, 4))}
              onFocus={focus('cvc')}
              onBlur={blur}
            />
          </label>
        </div>
      </form>
      <div className="customize">
        <div className="customize__head">
          <h3>Customize</h3>
          <button type="button" className="customize__copy" onClick={copyCode}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="2"></rect>
              <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
            </svg>
            {copied ? 'copied!' : 'copy code'}
          </button>
        </div>
        <div className="customize__row">
          <span className="customize__label">Variant</span>
          <div className="variant-row" role="group" aria-label="Card variant">
            {VARIANTS.map((v) => (
              <button
                key={v}
                type="button"
                className="variant-chip"
                aria-pressed={variant === v}
                onClick={() => setVariant(v)}
              >
                {v === 'gradient' ? 'classic' : v}
              </button>
            ))}
          </div>
        </div>
        <div className="customize__row">
          <span className="customize__label">Tilt</span>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={tilt}
            aria-label="Toggle tilt"
            onClick={() => setTilt((t) => !t)}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
