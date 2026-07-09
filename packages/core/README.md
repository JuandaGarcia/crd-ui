# kardz

Framework-agnostic credit/debit card visualization. Zero dependencies.

```js
import { createCard } from 'kardz';
import 'kardz/styles.css';

const card = createCard(container, { number: '', name: '', expiry: '', cvc: '' });
card.update({ number: '4111 1111 1111 1111' }); // brand-aware format + theme
card.update({ focused: 'cvc' });                // flips to the back
```

Framework wrappers: [`@kardz/react`](https://www.npmjs.com/package/@kardz/react) — Vue and Svelte planned.
See the repository README for full docs (theming, localization, custom logos).
