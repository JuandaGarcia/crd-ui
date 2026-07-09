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
    expect(root.classList.contains('kardz')).toBe(true);
    expect(root.classList.contains('kardz--unknown')).toBe(true);
    expect(root.querySelector('.kardz__number')?.textContent).toBe('•••• •••• •••• ••••');
    expect(root.querySelector('.kardz__name')?.textContent).toBe('FULL NAME');
    expect(root.querySelector('.kardz__expiry-value')?.textContent).toBe('••/••');
    expect(card.brand).toBeNull();
  });

  it('updates number, brand class and logo on update()', () => {
    const card = createCard(container);
    card.update({ number: '4111 1111' });
    expect(card.brand).toBe('visa');
    expect(card.element.classList.contains('kardz--brand-visa')).toBe(true);
    expect(card.element.querySelector('.kardz__number')?.textContent).toBe(
      '4111 1111 •••• ••••',
    );
    expect(card.element.querySelector('.kardz__logo')?.innerHTML).toContain('VISA');
  });

  it('flips when the cvc is focused', () => {
    const card = createCard(container, { focused: 'cvc' });
    expect(card.element.classList.contains('kardz--flipped')).toBe(true);
    card.update({ focused: 'number' });
    expect(card.element.classList.contains('kardz--flipped')).toBe(false);
    expect(card.element.classList.contains('kardz--focus-number')).toBe(true);
  });

  it('respects custom placeholders and locale', () => {
    const card = createCard(container, {
      placeholders: { name: 'NOMBRE COMPLETO' },
      locale: { validThru: 'válida hasta' },
    });
    expect(card.element.querySelector('.kardz__name')?.textContent).toBe('NOMBRE COMPLETO');
    expect(card.element.querySelector('.kardz__expiry-label')?.textContent).toBe('válida hasta');
  });

  it('destroy() removes the card from the DOM', () => {
    const card = createCard(container);
    expect(container.querySelector('.kardz')).not.toBeNull();
    card.destroy();
    expect(container.querySelector('.kardz')).toBeNull();
  });
});
