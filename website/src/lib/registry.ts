// shadcn/ui registry for crd-ui. The item installs the npm package and drops a
// thin wrapper into the user's components/ui folder, so they keep getting
// library updates through npm. Served at /r/registry.json and /r/{name}.json.
// Schema: https://ui.shadcn.com/docs/registry

const SITE = 'https://crd-ui.juanda.co';

export const REGISTRY_ITEM_NAME = 'credit-card';
export const REGISTRY_ITEM_URL = `${SITE}/r/${REGISTRY_ITEM_NAME}.json`;

// Exported as CreditCard so it never clashes with shadcn's own <Card />.
export const registryComponent = `'use client';

import 'crd-ui/styles.css';

export { Card as CreditCard, brandFromStripe } from 'crd-ui/react';
export type {
  CardProps as CreditCardProps,
  Brand,
  CardVariant,
  FocusedField,
} from 'crd-ui/react';
`;

const item = {
  name: REGISTRY_ITEM_NAME,
  type: 'registry:ui',
  title: 'Credit Card',
  description:
    'Credit & debit card preview for payment forms: live brand detection, 3D CVC flip, themeable variants.',
  dependencies: ['crd-ui'],
  docs: `Docs: ${SITE}`,
  files: [
    {
      path: 'registry/crd-ui/credit-card.tsx',
      type: 'registry:ui',
    },
  ],
};

export const registryItem = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  ...item,
  files: item.files.map((file) => ({ ...file, content: registryComponent })),
};

export const registryIndex = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'crd-ui',
  homepage: SITE,
  items: [item],
};
