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
  type FocusedField,
  createCard,
} from './index';

export type { Brand, CardVariant, FocusedField };

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
    placeholders: { type: Object as PropType<CardOptions['placeholders']>, default: undefined },
    locale: { type: Object as PropType<CardOptions['locale']>, default: undefined },
    logos: { type: Object as PropType<CardOptions['logos']>, default: undefined },
  },
  emits: {
    brandChange: (_brand: Brand | null) => true,
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
