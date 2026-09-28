# Next.js checkout with crd-ui

A payment form with a live credit card preview: brand detection, formatting, and a 3D flip
when the CVC is focused. Next.js App Router, React 19, TypeScript, no other dependencies.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/JuandaGarcia/crd-ui/tree/main/starters/nextjs-checkout?file=app%2Fcheckout.tsx)

Try `4242 4242 4242 4242` (Visa) or `3782 822463 10005` (Amex) — any future expiry.

## Run it locally

```bash
npx degit JuandaGarcia/crd-ui/starters/nextjs-checkout my-checkout
cd my-checkout
npm install
npm run dev
```

## What's where

- `app/checkout.tsx` — the form. A client component: the card and the inputs share state.
- `app/layout.tsx` — imports `crd-ui/styles.css` once for the whole app.
- `app/globals.css` — the page styles. The card itself is themed through `--crd-*` CSS
  custom properties; see the [theming docs](https://crd-ui.juanda.co/#theming).

## Going to production

The inputs here are plain `<input>`s so the starter runs with no account or keys. **Don't
send raw card numbers to your own server.** Use your payment provider's hosted fields
instead — the preview keeps working, because crd-ui only needs the metadata they report:

- the detected brand → the `brand` prop (`brandFromStripe()` maps Stripe's names),
- focus and blur → the `focused` prop, which also flips the card on the CVC,
- after tokenization, `last4` and the expiry → the `last4` and `expiry` props.

A complete Stripe Elements version lives in
[`examples/stripe`](https://github.com/JuandaGarcia/crd-ui/tree/main/examples/stripe).

Docs: https://crd-ui.juanda.co
