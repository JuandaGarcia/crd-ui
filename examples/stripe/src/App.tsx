// crd-ui × Stripe Elements.
//
// Stripe's iframes own the sensitive data (PCI), so the card number never
// reaches this code. What Stripe does report is metadata: the detected brand
// and per-field focus. crd-ui is display-only, so the two compose cleanly —
// the preview shows the brand Stripe detects, flips when the CVC iframe gains
// focus, and keeps every digit masked.
import { type FormEvent, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Card, brandFromStripe, type Brand, type FocusedField } from 'crd-ui/react';

const PK = import.meta.env.VITE_STRIPE_PK as string | undefined;

const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: "'Avenir Next', 'Segoe UI', ui-sans-serif, sans-serif",
      color: dark ? '#e8eaef' : '#1e2126',
      '::placeholder': { color: dark ? '#5b6270' : '#a3a9b7' },
    },
    invalid: { color: '#e5484d' },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [focused, setFocused] = useState<FocusedField | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Known only AFTER tokenization: Stripe's PaymentMethod reports last4 and
  // expiry, so the preview can show the confirmed card ('•••• 4242', '12/29').
  const [last4, setLast4] = useState('');
  const [expiry, setExpiry] = useState('');

  const focus = (field: FocusedField) => () => setFocused(field);
  // Stripe iframe events arrive via postMessage, so a field's blur can land
  // AFTER the next field's focus — only clear if the focus is still ours.
  const blur = (field: FocusedField) => () =>
    setFocused((current) => (current === field ? null : current));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setStatus(null);
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardNumberElement)!,
      billing_details: { name },
    });
    setBusy(false);
    if (error) {
      setStatus(`⚠ ${error.message}`);
      return;
    }
    const card = paymentMethod.card;
    if (card) {
      setLast4(card.last4);
      setExpiry(`${String(card.exp_month).padStart(2, '0')}/${String(card.exp_year).slice(-2)}`);
    }
    setStatus(`✓ PaymentMethod ${paymentMethod.id} (${card?.brand} ····${card?.last4})`);
  };

  return (
    <>
      <div className="demo__card">
        {/* Display-only: no digits ever reach the preview — Stripe reports
            the brand, crd-ui shows it, and 'cvc' focus flips the card. */}
        <Card
          number=""
          name={name}
          expiry={expiry}
          cvc=""
          brand={brand}
          last4={last4}
          focused={focused}
          tilt
        />
      </div>
      <form className="demo__form" onSubmit={submit}>
        <label>
          Card number
          <div className="stripe-field">
            <CardNumberElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => setBrand(brandFromStripe(e.brand))}
              onFocus={focus('number')}
              onBlur={blur('number')}
            />
          </div>
        </label>
        <label>
          Name
          <input
            placeholder="ADA LOVELACE"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={focus('name')}
            onBlur={blur('name')}
          />
        </label>
        <div className="demo__row">
          <label>
            Expiry
            <div className="stripe-field">
              <CardExpiryElement
                options={ELEMENT_OPTIONS}
                onFocus={focus('expiry')}
                onBlur={blur('expiry')}
              />
            </div>
          </label>
          <label>
            CVC
            <div className="stripe-field">
              <CardCvcElement options={ELEMENT_OPTIONS} onFocus={focus('cvc')} onBlur={blur('cvc')} />
            </div>
          </label>
        </div>
        <button type="submit" disabled={!stripe || busy}>
          {busy ? 'Creating…' : 'Create test PaymentMethod'}
        </button>
        {status && <p className="demo__status">{status}</p>}
      </form>
    </>
  );
}

function SetupNotice() {
  return (
    <div className="demo__notice">
      <h2>Add your Stripe test key</h2>
      <p>This demo needs a Stripe publishable test key to render the Elements:</p>
      <pre>echo "VITE_STRIPE_PK=pk_test_..." &gt; .env.local{'\n'}pnpm dev</pre>
      <p>
        Get one at <a href="https://dashboard.stripe.com/test/apikeys">dashboard.stripe.com</a> —
        publishable test keys are safe to use in the browser.
      </p>
    </div>
  );
}

export function App() {
  const stripePromise = useMemo(() => (PK ? loadStripe(PK) : null), []);

  return (
    <div className="demo">
      <h1>crd-ui × Stripe</h1>
      <p className="demo__tagline">Stripe owns the data; crd-ui owns the looks.</p>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <SetupNotice />
      )}
    </div>
  );
}
