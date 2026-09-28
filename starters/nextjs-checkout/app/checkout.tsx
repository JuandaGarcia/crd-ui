'use client';

// The card preview is display-only: it renders whatever the inputs hold and
// never sends anything anywhere. In production, replace these plain inputs with
// your payment provider's fields (see the README for Stripe Elements) — the
// preview keeps working from the brand and focus they report.
import { type SubmitEvent, useState } from 'react';
import { Card, type FocusedField } from 'crd-ui/react';
import {
  detectBrand,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  getBrandSpec,
  normalizeDigits,
} from 'crd-ui';

// formatExpiry pads with '•' for display; inputs want only what was typed.
const typedExpiry = (raw: string) => formatExpiry(raw).replace(/•/g, '').replace(/\/$/, '');

export function Checkout() {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focused, setFocused] = useState<FocusedField | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const brand = detectBrand(number);
  const spec = brand ? getBrandSpec(brand) : null;
  const digits = normalizeDigits(number);
  const complete =
    spec !== null &&
    spec.lengths.includes(digits.length) &&
    name.trim() !== '' &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvc.length === spec.cvcLength;

  const focus = (field: FocusedField) => () => setFocused(field);
  const blur = () => setFocused(null);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="checkout">
      <div className="checkout__preview">
        <Card number={number} name={name} expiry={expiry} cvc={cvc} focused={focused} tilt />
      </div>

      <form className="checkout__form" onSubmit={submit}>
        <label>
          Card number
          <input
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value, detectBrand(e.target.value)))}
            onFocus={focus('number')}
            onBlur={blur}
          />
        </label>
        <label>
          Name on card
          <input
            autoComplete="cc-name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={focus('name')}
            onBlur={blur}
          />
        </label>
        <div className="checkout__row">
          <label>
            Expiry
            <input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(typedExpiry(e.target.value))}
              onFocus={focus('expiry')}
              onBlur={blur}
            />
          </label>
          <label>
            CVC
            <input
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={spec?.cvcLength === 4 ? '1234' : '123'}
              value={cvc}
              onChange={(e) => setCvc(formatCvc(e.target.value, brand))}
              onFocus={focus('cvc')}
              onBlur={blur}
            />
          </label>
        </div>
        <button type="submit" disabled={!complete}>
          Pay $42.00
        </button>
        {submitted && (
          <p className="checkout__note" role="status">
            Demo only — nothing was charged. Wire this form to your payment provider.
          </p>
        )}
      </form>
    </div>
  );
}
