// Generates styles/crd-ui.layer.css — the stylesheet wrapped in a cascade
// layer, for consumers who style the card with utility classes (Tailwind).
//
// Tailwind emits its utilities inside `@layer utilities`, and unlayered CSS
// always beats layered CSS regardless of specificity, so the plain stylesheet
// would win over every utility. Importing this build instead puts crd-ui in a
// layer the consumer can order before Tailwind's.
//
// Generated at build time so it can never drift from crd-ui.css.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const styles = join(dirname(fileURLToPath(import.meta.url)), '..', 'styles');
const source = readFileSync(join(styles, 'crd-ui.css'), 'utf8');

const banner = `/* crd-ui — the stylesheet of crd-ui/styles.css wrapped in the "crd-ui"
   cascade layer. Generated from crd-ui.css; do not edit by hand.

   Declare the layer order once, before importing, so utilities win:
     @layer crd-ui, theme, base, components, utilities; */
`;

writeFileSync(join(styles, 'crd-ui.layer.css'), `${banner}\n@layer crd-ui {\n${source}\n}\n`);
