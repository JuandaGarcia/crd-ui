import { beforeEach, describe, expect, it } from 'vitest';
import { createCard } from '../src/card';

describe('createCard', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders the empty state with placeholders', () => {
    const card = createCard(container);
    const root = card.element;
    expect(root.classList.contains('crd')).toBe(true);
    expect(root.classList.contains('crd--unknown')).toBe(true);
    expect(root.querySelector('.crd__number')?.textContent).toBe('•••• •••• •••• ••••');
    expect(root.querySelector('.crd__name')?.textContent).toBe('FULL NAME');
    expect(root.querySelector('.crd__expiry-value')?.textContent).toBe('••/••');
    expect(card.brand).toBeNull();
  });

  it('updates number, brand class and logo on update()', () => {
    const card = createCard(container);
    card.update({ number: '4111 1111' });
    expect(card.brand).toBe('visa');
    expect(card.element.classList.contains('crd--brand-visa')).toBe(true);
    expect(card.element.querySelector('.crd__number')?.textContent).toBe(
      '4111 1111 •••• ••••',
    );
    expect(card.element.querySelector('.crd__logo')?.innerHTML).toContain('VISA');
  });

  it('flips when the cvc is focused', () => {
    const card = createCard(container, { focused: 'cvc' });
    expect(card.element.classList.contains('crd--flipped')).toBe(true);
    card.update({ focused: 'number' });
    expect(card.element.classList.contains('crd--flipped')).toBe(false);
    expect(card.element.classList.contains('crd--focus-number')).toBe(true);
  });

  it('respects custom placeholders and locale', () => {
    const card = createCard(container, {
      placeholders: { name: 'NOMBRE COMPLETO' },
      locale: { validThru: 'válida hasta' },
    });
    expect(card.element.querySelector('.crd__name')?.textContent).toBe('NOMBRE COMPLETO');
    expect(card.element.querySelector('.crd__expiry-label')?.textContent).toBe('válida hasta');
  });

  it('defaults to the sunset variant', () => {
    const card = createCard(container);
    expect(card.element.classList.contains('crd--v-sunset')).toBe(true);
  });

  it('applies and updates the variant class', () => {
    const card = createCard(container, { variant: 'holo' });
    expect(card.element.classList.contains('crd--v-holo')).toBe(true);
    card.update({ variant: 'graphite' });
    expect(card.element.classList.contains('crd--v-graphite')).toBe(true);
    expect(card.element.classList.contains('crd--v-holo')).toBe(false);
    card.update({ variant: 'gradient' });
    expect(card.element.className).not.toContain('crd--v-');
  });

  it('brand override forces the visual brand without a number', () => {
    const card = createCard(container, { brand: 'visa' });
    expect(card.brand).toBe('visa');
    expect(card.element.classList.contains('crd--brand-visa')).toBe(true);
    expect(card.element.querySelector('.crd__logo')?.innerHTML).toContain('VISA');
  });

  it('brand override beats detection and undefined restores it', () => {
    const card = createCard(container, { number: '4111 1111', brand: 'mastercard' });
    expect(card.brand).toBe('mastercard');
    expect(card.element.classList.contains('crd--brand-mastercard')).toBe(true);
    card.update({ brand: null });
    expect(card.brand).toBeNull();
    expect(card.element.classList.contains('crd--unknown')).toBe(true);
    card.update({ brand: undefined });
    expect(card.brand).toBe('visa');
  });

  it('last4 renders a masked number with the tail visible', () => {
    const card = createCard(container, { brand: 'visa', last4: '4242' });
    expect(card.element.querySelector('.crd__number')?.textContent).toBe('•••• •••• •••• 4242');
    card.update({ brand: 'amex' });
    expect(card.element.querySelector('.crd__number')?.textContent).toBe('•••• •••••• •4242');
    // A typed number takes precedence over last4.
    card.update({ brand: undefined, number: '4111' });
    expect(card.element.querySelector('.crd__number')?.textContent).toBe('4111 •••• •••• ••••');
  });

  it('tilt is off by default and toggles via update()', () => {
    const card = createCard(container);
    expect(card.element.classList.contains('crd--tilt')).toBe(false);
    expect(card.element.querySelector('.crd__glare')).not.toBeNull();
    card.update({ tilt: true });
    expect(card.element.classList.contains('crd--tilt')).toBe(true);
    card.update({ tilt: false });
    expect(card.element.classList.contains('crd--tilt')).toBe(false);
  });

  it('display layout shows a masked meta row on the front', () => {
    const card = createCard(container, { layout: 'display', brand: 'mastercard', last4: '5460' });
    expect(card.element.classList.contains('crd--l-display')).toBe(true);
    expect(card.element.querySelector('.crd__number')?.textContent).toBe('•••• •••• •••• 5460');
    expect(card.element.querySelector('.crd__meta-expiry')?.textContent).toBe('••/••');
    expect(card.element.querySelector('.crd__meta-cvc')?.textContent).toBe('•••');
    expect(card.element.querySelector('.crd__meta-label--exp')?.textContent).toBe('Exp');
  });

  it('display layout reveals real values on update()', () => {
    const card = createCard(container, { layout: 'display', brand: 'visa' });
    card.update({ number: '4111 1111 1111 1111', expiry: '12/29', cvc: '123' });
    expect(card.element.querySelector('.crd__number')?.textContent).toBe('4111 1111 1111 1111');
    expect(card.element.querySelector('.crd__meta-expiry')?.textContent).toBe('12/29');
    expect(card.element.querySelector('.crd__meta-cvc')?.textContent).toBe('123');
  });

  it('display layout hides the empty name and never flips on cvc focus', () => {
    const card = createCard(container, { layout: 'display', focused: 'cvc' });
    expect(card.element.querySelector('.crd__name')?.textContent).toBe('');
    expect(card.element.classList.contains('crd--flipped')).toBe(false);
    // A form-layout card with the same focus does flip.
    const form = createCard(container, { focused: 'cvc' });
    expect(form.element.classList.contains('crd--flipped')).toBe(true);
    expect(form.element.querySelector('.crd__name')?.textContent).toBe('FULL NAME');
  });

  it('respects custom exp/cvc labels in the display layout', () => {
    const card = createCard(container, {
      layout: 'display',
      locale: { exp: 'Vence', cvc: 'CVV' },
    });
    expect(card.element.querySelector('.crd__meta-label--exp')?.textContent).toBe('Vence');
    expect(card.element.querySelector('.crd__meta-label--cvc')?.textContent).toBe('CVV');
  });

  it('destroy() removes the card from the DOM', () => {
    const card = createCard(container);
    expect(container.querySelector('.crd')).not.toBeNull();
    card.destroy();
    expect(container.querySelector('.crd')).toBeNull();
  });
});
