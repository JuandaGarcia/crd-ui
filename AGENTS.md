# Agent guide for crd-ui

crd-ui is a framework-agnostic credit/debit card visualization library: a
zero-dependency vanilla core with React, Vue and Svelte adapters published as
subpaths of a single npm package. Library docs in markdown:
https://crd-ui.juanda.co/llms-full.txt (also in `packages/crd-ui/llms.txt`).

## Monorepo map (pnpm workspaces)

- `packages/crd-ui` — the published package.
  - `src/brands.ts` / `src/format.ts` — brand detection and number/expiry/cvc formatting.
  - `src/card.ts` — the core renderer (`createCard`): owns the DOM, flip
    choreography, magic focus ring, variant classes.
  - `src/react.tsx`, `src/vue.ts`, `src/svelte/Card.svelte` — framework adapters.
  - `styles/crd-ui.css` — all visuals: brand themes, variants, animations.
  - `tests/` — Vitest (jsdom). Svelte tests use the `.svelte.test.ts` suffix (runes).
- `website/` — Astro one-pager (crd-ui.juanda.co). Deploys to Vercel on push to main.
  - `src/lib/snippets.ts` + `src/lib/api.ts` — single source of truth for docs:
    both the HTML page and `/llms-full.txt` (`src/lib/docs-md.ts`) render from them.
- `examples/playground` — Vite+React dev playground.

## Commands

```bash
pnpm install
pnpm test                    # vitest for packages/crd-ui (59+ tests)
pnpm build                   # tsup: ESM+CJS+d.ts, plus dist/svelte copy
pnpm --filter website dev    # docs site on :4321
pnpm --filter website build
```

This machine uses pnpm only (npm is disabled and forwards to pnpm).

## Architecture rules

- **The core owns the DOM.** Adapters are thin controlled wrappers: render an
  empty container, `createCard` on mount, forward props with `card.update()`,
  `destroy()` on unmount. Never manipulate card internals from an adapter.
- `placeholders`, `locale` and `logos` are creation-time options — not updatable.
- The Svelte adapter ships as **source** (`dist/svelte/Card.svelte` with
  handwritten `index.d.ts`); its import of the core is relative and
  extensionless on purpose so it resolves both from `src/` (tests) and `dist/`.
- React/Vue/Svelte are optional `peerDependencies` — the core must keep zero
  runtime dependencies.

## Conventions

- Docs always show **React examples first**, then Vanilla, Vue, Svelte.
- No trademarked assets in the package: brand logos are generic recreations;
  users pass their own SVGs via the `logos` option.
- When docs content changes, update `website/src/lib/snippets.ts` /
  `api.ts` — the markdown endpoints and HTML page both derive from them.
  Keep `packages/crd-ui/llms.txt` and `README.md` in sync.
- Design attributions live in source comments (site design adapted from
  NumberFlow, MIT).

## Release flow

1. Bump `packages/crd-ui/package.json` version (semver).
2. `pnpm test && pnpm build`.
3. Commit + push (website deploys automatically via Vercel Git integration).
4. `cd packages/crd-ui && pnpm publish --access public` (npm auth via ~/.npmrc).
