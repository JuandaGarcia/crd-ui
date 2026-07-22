<!--
  Controlled card preview. Wraps the vanilla `crd-ui` renderer: the core owns
  the markup; this component only forwards props on each update. Calls
  `onBrandChange` whenever the detected brand changes (null when unrecognized).
-->
<script>
  // Relative + extensionless on purpose: resolves to ../index.ts here in src
  // (tests) and to ../index.js once copied into dist (consumers' bundlers).
  import { createCard } from '../index';

  let {
    number = '',
    name = '',
    expiry = '',
    cvc = '',
    focused = null,
    variant = 'sunset',
    tilt = false,
    brand: brandOverride = undefined,
    last4 = '',
    layout = 'form',
    copyable = false,
    classNames = undefined,
    placeholders = undefined,
    locale = undefined,
    logos = undefined,
    onBrandChange = undefined,
    onCopy = undefined,
    class: className = undefined,
  } = $props();

  let container;
  let card = null;
  let brand = null;

  // placeholders/locale/logos are creation-time options of the core; changing
  // them after mount is not supported (recreate the component with a #key).
  $effect(() => {
    card = createCard(container, { placeholders, locale, logos, onCopy });
    return () => {
      card.destroy();
      card = null;
    };
  });

  $effect(() => {
    if (!card) return;
    card.update({
      number,
      name,
      expiry,
      cvc,
      focused,
      variant,
      tilt,
      brand: brandOverride,
      last4,
      layout,
      copyable,
      classNames,
    });
    if (card.brand !== brand) {
      brand = card.brand;
      onBrandChange?.(brand);
    }
  });
</script>

<div bind:this={container} class={className}></div>
