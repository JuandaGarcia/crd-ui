import { useEffect, useRef, useState } from 'react';
import { Card, type CardVariant, type FocusedField } from 'crd-ui/react';
import { LOGOS, detectBrand, formatCardNumber, formatExpiry, normalizeDigits } from 'crd-ui';
import { TEST_CARDS, type TestCard } from '../lib/test-cards';

export function Playground() {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focused, setFocused] = useState<FocusedField | null>(null);
  const [variant, setVariant] = useState<CardVariant>('sunset');
  const [tilt, setTilt] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDetailsElement>(null);

  const VARIANTS: CardVariant[] = ['sunset', 'ember', 'holo', 'porcelain', 'graphite', 'gradient'];

  const focus = (field: FocusedField) => () => setFocused(field);
  const blur = () => setFocused(null);

  // The built-in marks are right-anchored in a 120x40 viewBox (that's how they
  // sit on the card), so left-aligning them means cropping the box to the ink.
  // getBBox needs the node rendered, hence on open rather than on mount.
  const cropLogos = (): void => {
    const menu = pickerRef.current;
    if (!menu?.open) return;
    menu.querySelectorAll<SVGGraphicsElement>('.test-option__logo svg').forEach((svg) => {
      if (svg.dataset.cropped) return;
      try {
        const b = svg.getBBox();
        if (!b.width || !b.height) return;
        svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.width} ${b.height}`);
        svg.dataset.cropped = 'true';
      } catch {
        // not laid out yet — the next open will crop it
      }
    });
  };

  useEffect(() => {
    const close = (e: Event) => {
      const picker = pickerRef.current;
      if (picker?.open && !picker.contains(e.target as Node)) picker.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pickerRef.current) pickerRef.current.open = false;
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Test-card picker: fills the form so the brand switches live, and puts the
  // number on the clipboard for pasting into the reader's own payment form.
  const useTestCard = async (card: TestCard) => {
    setNumber(formatCardNumber(card.number, detectBrand(card.number)));
    setExpiry(card.expiry);
    if (pickerRef.current) pickerRef.current.open = false;
    numberRef.current?.focus();
    try {
      await navigator.clipboard.writeText(card.number);
      setCopiedCard(card.label);
      setTimeout(() => setCopiedCard(null), 1200);
    } catch {
      // clipboard can be blocked (permissions, insecure origin) — the form is
      // filled either way, which is the part that matters here.
    }
  };

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
      {/* own wrapper: className now lands on .crd, and the sticky/width rules
          below target the box the card sits in */}
      <div className="playground-card">
        <Card
          number={number}
          name={name}
          expiry={expiry}
          cvc={cvc}
          focused={focused}
          variant={variant}
          tilt={tilt}
        />
      </div>
      <form className="demo-form" onSubmit={(e) => e.preventDefault()}>
        {/* The picker is a sibling of the label, not nested inside it: a
            <summary> within a <label> would also toggle the input's focus. */}
        <div className="field">
          <div className="field-head">
            <label htmlFor="pg-number">Card number</label>
            <details className="test-select" ref={pickerRef} onToggle={cropLogos}>
              <summary aria-label="Fill a test card number">
                {copiedCard ? 'copied!' : 'Test card'}
                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </summary>
              <div className="test-menu" role="menu">
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    className="test-option"
                    role="menuitem"
                    /* the marks are decorative SVG, so the button carries the name */
                    aria-label={`${card.label} — ${card.number}`}
                    onClick={() => useTestCard(card)}
                  >
                    <span
                      className="test-option__logo"
                      /* static marks shipped by the library, not user input */
                      dangerouslySetInnerHTML={{ __html: LOGOS[detectBrand(card.number)!] }}
                    />
                    <span className="test-option__number">{card.number}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
          <input
            id="pg-number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4111 1111 1111 1111"
            ref={numberRef}
            value={number}
            onChange={(e) =>
              setNumber(formatCardNumber(e.target.value, detectBrand(e.target.value)))
            }
            onFocus={focus('number')}
            onBlur={blur}
          />
        </div>
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
