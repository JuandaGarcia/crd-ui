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
