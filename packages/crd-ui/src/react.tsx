import { useEffect, useRef } from 'react';
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

export interface CardProps {
  number?: string;
  name?: string;
  expiry?: string;
  cvc?: string;
  focused?: FocusedField | null;
  /** Visual finish of the card. Default: 'sunset' (brand-tinted blooms). */
  variant?: CardVariant;
  /** Pointer-tracked 3D hover tilt with a light glare. Default: false. */
  tilt?: boolean;
  /**
   * Force the displayed brand instead of deriving it from `number` — for
   * providers that report the brand without exposing the number (e.g. Stripe
   * Elements). `null` shows the unknown state; omit for automatic detection.
   */
  brand?: Brand | null;
  /**
   * Show only the last digits ('•••• •••• •••• 4242') when the full number is
   * unknown — saved cards or post-tokenization summaries. Ignored while
   * `number` has digits.
   */
  last4?: string;
  /**
   * 'form' (default) is the payment-form preview; 'display' presents an
   * existing card for dashboards (expiry/CVC on the front, no flip, reveal by
   * passing the real values).
   */
  layout?: 'form' | 'display';
  /**
   * Make the revealed number, expiry and CVC click-to-copy (display layout
   * only). Default: false.
   */
  copyable?: boolean;
  placeholders?: CardOptions['placeholders'];
  locale?: CardOptions['locale'];
  logos?: CardOptions['logos'];
  /** Called whenever the detected brand changes (null when unrecognized). */
  onBrandChange?: (brand: Brand | null) => void;
  /** Called after a copyable field is copied to the clipboard. */
  onCopy?: (field: CopyField, value: string) => void;
  className?: string;
}

/**
 * Controlled card preview. Wraps the vanilla `crd-ui` renderer: the core owns
 * the markup; this component only forwards props on each render.
 */
export function Card({
  number = '',
  name = '',
  expiry = '',
  cvc = '',
  focused = null,
  variant = 'sunset',
  tilt = false,
  brand,
  last4 = '',
  layout = 'form',
  copyable = false,
  placeholders,
  locale,
  logos,
  onBrandChange,
  onCopy,
  className,
}: CardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<CardInstance | null>(null);
  const brandRef = useRef<Brand | null>(null);
  const onBrandChangeRef = useRef(onBrandChange);
  onBrandChangeRef.current = onBrandChange;
  const onCopyRef = useRef(onCopy);
  onCopyRef.current = onCopy;

  // placeholders/locale/logos/onCopy are creation-time options of the core;
  // changing them after mount is not supported (recreate with a `key`). onCopy
  // goes through a stable wrapper so a fresh handler each render still fires.
  const initialOptionsRef = useRef({
    placeholders,
    locale,
    logos,
    onCopy: (field: CopyField, value: string) => onCopyRef.current?.(field, value),
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const card = createCard(container, initialOptionsRef.current);
    cardRef.current = card;
    return () => {
      cardRef.current = null;
      card.destroy();
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.update({
      number,
      name,
      expiry,
      cvc,
      focused,
      variant,
      tilt,
      brand,
      last4,
      layout,
      copyable,
    });
    if (card.brand !== brandRef.current) {
      brandRef.current = card.brand;
      onBrandChangeRef.current?.(card.brand);
    }
  }, [number, name, expiry, cvc, focused, variant, tilt, brand, last4, layout, copyable]);

  return <div ref={containerRef} className={className} />;
}
