# crd-ui × Stripe Elements

A payment form where **Stripe owns the data and crd-ui owns the looks**.

Stripe Elements renders the card inputs inside its own iframes (that's the
PCI story: the number never touches your code). What Stripe *does* report is
metadata — the detected brand, per-field focus, completeness — and that is
exactly what a display-only preview needs:

- `brand` → crd-ui's `brand` override shows the right logo and theme without
  ever seeing a digit.
- focus/blur events → `focused` drives the highlight ring, and focusing the
  CVC iframe flips the card.
- The digits stay masked (`••••`) on the preview, because they never exist
  outside Stripe's iframes.

## Run it

```bash
echo "VITE_STRIPE_PK=pk_test_..." > .env.local   # your publishable TEST key
pnpm install
pnpm dev                                          # http://localhost:5174
```

Get a publishable test key at
[dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
— publishable test keys are designed to be used in the browser.

Try Stripe's test cards: `4242 4242 4242 4242` (Visa), `5555 5555 5555 4444`
(Mastercard), `3782 822463 10005` (Amex) — any future expiry, any CVC.
Submitting creates a test `PaymentMethod` and prints its id, brand and last4.
