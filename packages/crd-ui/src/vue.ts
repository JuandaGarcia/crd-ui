import {
  type PropType,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  type Brand,
  type CardInstance,
  type CardOptions,
  type CardVariant,
  type CopyField,
  type FocusedField,
  createCard,
} from './index';

export type { Brand, CardVariant, CopyField, FocusedField };
export { brandFromStripe } from './index';

/**
 * Controlled card preview. Wraps the vanilla `crd-ui` renderer: the core owns
 * the markup; this component only forwards props on each update. Emits
 * `brandChange` whenever the detected brand changes (null when unrecognized).
 */
export const Card = defineComponent({
  name: 'CrdCard',
  props: {
    number: { type: String, default: '' },
    name: { type: String, default: '' },
    expiry: { type: String, default: '' },
    cvc: { type: String, default: '' },
    focused: { type: String as PropType<FocusedField | null>, default: null },
    /** Visual finish of the card. Default: 'sunset' (brand-tinted blooms). */
    variant: { type: String as PropType<CardVariant>, default: 'sunset' },
    /** Pointer-tracked 3D hover tilt with a light glare. Default: false. */
    tilt: { type: Boolean, default: false },
    /**
     * Force the displayed brand (e.g. from Stripe Elements' metadata) instead
     * of deriving it from `number`. `null` shows the unknown state; leave
     * unset for automatic detection.
     */
    brand: { type: String as PropType<Brand | null>, default: undefined },
    /**
     * Show only the last digits ('•••• •••• •••• 4242') when the full number
     * is unknown — saved cards or post-tokenization summaries. Ignored while
     * `number` has digits.
     */
    last4: { type: String, default: '' },
    /**
     * 'form' (default) is the payment-form preview; 'display' presents an
     * existing card for dashboards (expiry/CVC on the front, no flip).
     */
    layout: { type: String as PropType<'form' | 'display'>, default: 'form' },
    /**
     * Make the revealed number, expiry and CVC click-to-copy (display layout
     * only). Default: false.
     */
    copyable: { type: Boolean, default: false },
    placeholders: { type: Object as PropType<CardOptions['placeholders']>, default: undefined },
    locale: { type: Object as PropType<CardOptions['locale']>, default: undefined },
    logos: { type: Object as PropType<CardOptions['logos']>, default: undefined },
  },
  emits: {
    brandChange: (_brand: Brand | null) => true,
    copy: (_field: CopyField, _value: string) => true,
  },
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>();
    let card: CardInstance | null = null;
    let brand: Brand | null = null;

    const sync = (): void => {
      if (!card) return;
      card.update({
        number: props.number,
        name: props.name,
        expiry: props.expiry,
        cvc: props.cvc,
        focused: props.focused,
        variant: props.variant,
        tilt: props.tilt,
        brand: props.brand,
        last4: props.last4,
        layout: props.layout,
        copyable: props.copyable,
      });
      if (card.brand !== brand) {
        brand = card.brand;
        emit('brandChange', brand);
      }
    };

    onMounted(() => {
      if (!container.value) return;
      // placeholders/locale/logos are creation-time options of the core;
      // changing them after mount is not supported (recreate with a `key`).
      card = createCard(container.value, {
        placeholders: props.placeholders,
        locale: props.locale,
        logos: props.logos,
        onCopy: (field, value) => emit('copy', field, value),
      });
      sync();
    });

    watch(
      () => [
        props.number,
        props.name,
        props.expiry,
        props.cvc,
        props.focused,
        props.variant,
        props.tilt,
        props.brand,
        props.last4,
        props.layout,
        props.copyable,
      ],
      sync,
    );

    onBeforeUnmount(() => {
      card?.destroy();
      card = null;
    });

    return () => h('div', { ref: container });
  },
});
