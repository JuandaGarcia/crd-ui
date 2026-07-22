import type { Component } from 'svelte';
import type { Brand, CardOptions, CardVariant, FocusedField } from '../index';

export type { Brand, CardVariant, FocusedField };

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
   * existing card for dashboards (expiry/CVC on the front, no flip).
   */
  layout?: 'form' | 'display';
  /**
   * Make the revealed number, expiry and CVC click-to-copy (display layout
   * only). Default: false.
   */
  copyable?: boolean;
  /** Called after a copyable field is copied to the clipboard. */
  onCopy?: (field: 'number' | 'expiry' | 'cvc', value: string) => void;
  placeholders?: CardOptions['placeholders'];
  locale?: CardOptions['locale'];
  logos?: CardOptions['logos'];
  /** Called whenever the detected brand changes (null when unrecognized). */
  onBrandChange?: (brand: Brand | null) => void;
  class?: string;
}

/**
 * Controlled card preview. Wraps the vanilla `crd-ui` renderer: the core owns
 * the markup; this component only forwards props on each update.
 */
declare const Card: Component<CardProps>;
export default Card;
