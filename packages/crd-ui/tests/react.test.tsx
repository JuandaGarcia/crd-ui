import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '../src/react';

describe('<Card />', () => {
  it('renders the card through the core', () => {
    const { container } = render(<Card />);
    expect(container.querySelector('.crd')).not.toBeNull();
    expect(container.querySelector('.crd__number')?.textContent).toBe('•••• •••• •••• ••••');
  });

  it('reflects prop updates', () => {
    const { container, rerender } = render(<Card number="" />);
    rerender(<Card number="5555 5555 5555 4444" name="Ada Lovelace" />);
    expect(container.querySelector('.crd--brand-mastercard')).not.toBeNull();
    expect(container.querySelector('.crd__name')?.textContent).toBe('Ada Lovelace');
  });

  it('flips on focused="cvc"', () => {
    const { container, rerender } = render(<Card focused="number" />);
    expect(container.querySelector('.crd--flipped')).toBeNull();
    rerender(<Card focused="cvc" />);
    expect(container.querySelector('.crd--flipped')).not.toBeNull();
  });

  it('notifies brand changes', () => {
    const onBrandChange = vi.fn();
    const { rerender } = render(<Card number="" onBrandChange={onBrandChange} />);
    rerender(<Card number="4111" onBrandChange={onBrandChange} />);
    expect(onBrandChange).toHaveBeenLastCalledWith('visa');
    rerender(<Card number="" onBrandChange={onBrandChange} />);
    expect(onBrandChange).toHaveBeenLastCalledWith(null);
  });

  it('applies className to the card root, not the container', () => {
    const { container } = render(<Card className="ring-1 [--crd-radius:1rem]" />);
    const root = container.querySelector('.crd')!;
    expect(root.classList.contains('ring-1')).toBe(true);
    expect(root.classList.contains('[--crd-radius:1rem]')).toBe(true);
    // the mount container stays unstyled — a knob set there never reaches .crd
    expect((container.firstElementChild as HTMLElement).className).toBe('');
  });

  it('merges className with classNames.root and keeps state modifiers', () => {
    const { container, rerender } = render(
      <Card className="shadow-xl" classNames={{ root: 'ring-2' }} number="4111" />,
    );
    const root = container.querySelector('.crd')!;
    expect(root.classList.contains('shadow-xl')).toBe(true);
    expect(root.classList.contains('ring-2')).toBe(true);
    expect(root.classList.contains('crd--brand-visa')).toBe(true);

    rerender(<Card className="shadow-none" number="4111" />);
    expect(container.querySelector('.crd')!.classList.contains('shadow-none')).toBe(true);
    expect(container.querySelector('.crd')!.classList.contains('shadow-xl')).toBe(false);
  });

  it('cleans up on unmount', () => {
    const { container, unmount } = render(<Card />);
    unmount();
    expect(container.querySelector('.crd')).toBeNull();
  });
});
