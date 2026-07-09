import { useEffect, useRef } from 'react';
import {
  type Brand,
  type CardInstance,
  type CardOptions,
  type FocusedField,
  createCard,
} from '@kardz/core';

export type { Brand, FocusedField };

export interface CardProps {
  number?: string;
  name?: string;
  expiry?: string;
  cvc?: string;
  focused?: FocusedField | null;
  placeholders?: CardOptions['placeholders'];
  locale?: CardOptions['locale'];
  logos?: CardOptions['logos'];
  /** Called whenever the detected brand changes (null when unrecognized). */
  onBrandChange?: (brand: Brand | null) => void;
  className?: string;
}

/**
 * Controlled card preview. Wraps the vanilla `kardz` renderer: the core owns
 * the markup; this component only forwards props on each render.
 */
export function Card({
  number = '',
  name = '',
  expiry = '',
  cvc = '',
  focused = null,
  placeholders,
  locale,
  logos,
  onBrandChange,
  className,
}: CardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<CardInstance | null>(null);
  const brandRef = useRef<Brand | null>(null);
  const onBrandChangeRef = useRef(onBrandChange);
  onBrandChangeRef.current = onBrandChange;

  // placeholders/locale/logos are creation-time options of the core; changing
  // them after mount is not supported (recreate the component with a `key`).
  const initialOptionsRef = useRef({ placeholders, locale, logos });

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
    card.update({ number, name, expiry, cvc, focused });
    if (card.brand !== brandRef.current) {
      brandRef.current = card.brand;
      onBrandChangeRef.current?.(card.brand);
    }
  }, [number, name, expiry, cvc, focused]);

  return <div ref={containerRef} className={className} />;
}
