// The `.svelte.test.ts` suffix enables runes here, so props can be driven
// reactively from the test via $state.
import { flushSync, mount, unmount } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Card from '../src/svelte/Card.svelte';

describe('<Card /> (Svelte)', () => {
  let target: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('renders the card and defaults to the sunset variant', () => {
    const component = mount(Card, { target });
    flushSync();
    const root = target.querySelector('.crd')!;
    expect(root).not.toBeNull();
    expect(root.classList.contains('crd--v-sunset')).toBe(true);
    expect(root.querySelector('.crd__number')?.textContent).toBe('•••• •••• •••• ••••');
    unmount(component);
  });

  it('updates the card and calls onBrandChange when props change', () => {
    const onBrandChange = vi.fn();
    const props = $state({ number: '', focused: null, onBrandChange });
    const component = mount(Card, { target, props });
    flushSync();
    expect(onBrandChange).not.toHaveBeenCalled();

    props.number = '4111 1111';
    flushSync();
    const root = target.querySelector('.crd')!;
    expect(root.classList.contains('crd--brand-visa')).toBe(true);
    expect(onBrandChange).toHaveBeenLastCalledWith('visa');

    props.number = '';
    flushSync();
    expect(onBrandChange).toHaveBeenLastCalledWith(null);
    unmount(component);
  });

  it('flips when the cvc is focused and applies variant changes', () => {
    const props = $state<{ focused: 'cvc' | null; variant: 'sunset' | 'holo' }>({
      focused: 'cvc',
      variant: 'sunset',
    });
    const component = mount(Card, { target, props });
    flushSync();
    expect(target.querySelector('.crd')!.classList.contains('crd--flipped')).toBe(true);

    props.focused = null;
    props.variant = 'holo';
    flushSync();
    const root = target.querySelector('.crd')!;
    expect(root.classList.contains('crd--flipped')).toBe(false);
    expect(root.classList.contains('crd--v-holo')).toBe(true);
    unmount(component);
  });

  it('passes creation-time options through', () => {
    const component = mount(Card, {
      target,
      props: {
        placeholders: { name: 'NOMBRE COMPLETO' },
        locale: { validThru: 'válida hasta' },
      },
    });
    flushSync();
    expect(target.querySelector('.crd__name')?.textContent).toBe('NOMBRE COMPLETO');
    expect(target.querySelector('.crd__expiry-label')?.textContent).toBe('válida hasta');
    unmount(component);
  });

  it('destroys the card on unmount', () => {
    const component = mount(Card, { target });
    flushSync();
    expect(target.querySelector('.crd')).not.toBeNull();
    unmount(component);
    expect(target.querySelector('.crd')).toBeNull();
  });
});
