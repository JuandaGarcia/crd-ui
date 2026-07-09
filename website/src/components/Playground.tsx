import { useState } from 'react';
import { Card, type FocusedField } from 'crd-ui/react';
import { detectBrand, formatCardNumber, formatExpiry, normalizeDigits } from 'crd-ui';

export function Playground() {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focused, setFocused] = useState<FocusedField | null>(null);

  const focus = (field: FocusedField) => () => setFocused(field);
  const blur = () => setFocused(null);

  return (
    <div className="demo-panel">
      <Card number={number} name={name} expiry={expiry} cvc={cvc} focused={focused} />
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
    </div>
  );
}
