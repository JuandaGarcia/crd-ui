// Composes the library documentation as markdown, from the same sources the
// page renders (snippets.ts, api.ts) so HTML and markdown never drift.
// Served at /llms-full.txt and /index.md; the short index lives at /llms.txt.

import { API_ROWS } from './api';
import { localization, logos, theming, themingImage, usage } from './snippets';

const SITE = 'https://crd-ui.juanda.co';

export const SUMMARY =
  'Framework-agnostic credit/debit card visualization for payment forms. ' +
  'Zero-dependency vanilla core with React, Vue and Svelte subpaths in a single npm package.';

const escapeCell = (text: string): string => text.replace(/\|/g, '\\|');

const apiTable = [
  '| Prop | Type | Description |',
  '| --- | --- | --- |',
  ...API_ROWS.map(
    (row) => `| \`${row.prop}\` | \`${escapeCell(row.type)}\` | ${escapeCell(row.description)} |`,
  ),
].join('\n');

export const FULL_DOCS = `# crd-ui

> ${SUMMARY}

- Website: ${SITE}
- npm: https://www.npmjs.com/package/crd-ui
- GitHub: https://github.com/JuandaGarcia/crd-ui
- License: MIT

## Install

\`\`\`bash
npm i crd-ui
\`\`\`

Subpath exports (one package for every framework):

- \`crd-ui\` — vanilla core: brand detection, formatting and the card renderer.
- \`crd-ui/react\` — React component \`<Card />\` (peer: react >=18).
- \`crd-ui/vue\` — Vue 3 component \`<Card />\` (peer: vue >=3).
- \`crd-ui/svelte\` — Svelte 5 component \`<Card />\` (peer: svelte >=5).
- \`crd-ui/styles.css\` — required stylesheet.

All framework peers are optional: install only the one you use.

## React usage

\`\`\`tsx
${usage.react}
\`\`\`

## Vanilla usage

\`\`\`js
${usage.vanilla}
\`\`\`

## Vue usage

\`\`\`vue
${usage.vue}
\`\`\`

## Svelte usage

\`\`\`svelte
${usage.svelte}
\`\`\`

## API

Props of \`<Card />\` — the vanilla \`createCard(container, options)\` accepts the same
fields and returns \`{ update, brand, element, destroy }\`.

${apiTable}

\`CardInstance\` (vanilla):

- \`update(data)\` — merge new values and re-render the affected parts.
- \`brand\` — detected brand or null: 'visa' | 'mastercard' | 'amex' | 'discover' | 'dinersclub' | 'jcb' | 'unionpay' | 'maestro' | 'elo' | 'hipercard'.
- \`element\` — the root \`.crd\` HTMLElement.
- \`destroy()\` — remove the card from the DOM.

## Variants

Pick the card's finish with the \`variant\` prop/option:
\`'sunset'\` (default) · \`'ember'\` · \`'holo'\` · \`'porcelain'\` · \`'graphite'\` · \`'gradient'\`.

\`sunset\` is a light porcelain face with a color bloom that adapts to the detected brand;
\`gradient\` is the classic dark per-brand gradient. The rest are brand-agnostic finishes.

## Brands

Live detection for 10 brands, each with its own theme: Visa, Mastercard, Amex, Discover,
Diners Club, JCB, UnionPay, Maestro, Elo, Hipercard.

## Theming

Override CSS custom properties on \`.crd\` or any ancestor:

\`\`\`css
${theming}
\`\`\`

\`--crd-bg\` is a full CSS background value, so images work as well as gradients
(use \`variant: 'gradient'\` so no variant artwork overrides it):

\`\`\`css
${themingImage}
\`\`\`

The built-in brand marks are deliberately generic so the package ships no trademarked
assets — pass your own SVGs if you're licensed to use the official ones:

\`\`\`tsx
${logos.react}
\`\`\`

\`\`\`js
${logos.vanilla}
\`\`\`

## Localization

Every label and placeholder on the card is configurable:

\`\`\`tsx
${localization.react}
\`\`\`

\`\`\`js
${localization.vanilla}
\`\`\`

## Behavior notes for agents

- The core owns the DOM. Framework components are thin controlled wrappers: they render
  an empty container, call \`createCard\` on mount, forward props via \`card.update()\`,
  and \`destroy()\` on unmount. Never mutate the card's inner DOM directly.
- \`placeholders\`, \`locale\` and \`logos\` are creation-time options; to change them,
  recreate the component (e.g. with a \`key\`).
- Setting \`focused: 'cvc'\` flips the card to the back with a choreographed 3D animation
  (disabled under \`prefers-reduced-motion\`).
- A single "magic" focus ring travels between sections when \`focused\` changes.
- The component is display-only: it never handles or stores real card data itself —
  wire it to your own inputs.
`;

export const LLMS_INDEX = `# crd-ui

> ${SUMMARY}

crd-ui renders a live, themeable card preview (brand detection, number masking,
CVC flip, focus ring) you wire to your own payment-form inputs. MIT licensed.

## Docs

- [Full documentation (markdown)](${SITE}/llms-full.txt): install, usage for React/Vanilla/Vue/Svelte, API table, variants, theming, localization
- [README](https://github.com/JuandaGarcia/crd-ui#readme): same content on GitHub

## Source

- [GitHub repository](https://github.com/JuandaGarcia/crd-ui): monorepo (packages/crd-ui + website)
- [npm package](https://www.npmjs.com/package/crd-ui): crd-ui, subpaths /react /vue /svelte /styles.css

## Notes

- The npm tarball also ships this file at node_modules/crd-ui/llms.txt
`;
