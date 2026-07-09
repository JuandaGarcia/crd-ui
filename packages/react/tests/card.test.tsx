import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '../src/index';

describe('<Card />', () => {
  it('renders the card through the core', () => {
    const { container } = render(<Card />);
    expect(container.querySelector('.kardz')).not.toBeNull();
    expect(container.querySelector('.kardz__number')?.textContent).toBe('•••• •••• •••• ••••');
  });

  it('reflects prop updates', () => {
    const { container, rerender } = render(<Card number="" />);
    rerender(<Card number="5555 5555 5555 4444" name="Ada Lovelace" />);
    expect(container.querySelector('.kardz--brand-mastercard')).not.toBeNull();
    expect(container.querySelector('.kardz__name')?.textContent).toBe('Ada Lovelace');
  });

  it('flips on focused="cvc"', () => {
    const { container, rerender } = render(<Card focused="number" />);
    expect(container.querySelector('.kardz--flipped')).toBeNull();
    rerender(<Card focused="cvc" />);
    expect(container.querySelector('.kardz--flipped')).not.toBeNull();
  });

  it('notifies brand changes', () => {
    const onBrandChange = vi.fn();
    const { rerender } = render(<Card number="" onBrandChange={onBrandChange} />);
    rerender(<Card number="4111" onBrandChange={onBrandChange} />);
    expect(onBrandChange).toHaveBeenLastCalledWith('visa');
    rerender(<Card number="" onBrandChange={onBrandChange} />);
    expect(onBrandChange).toHaveBeenLastCalledWith(null);
  });

  it('cleans up on unmount', () => {
    const { container, unmount } = render(<Card />);
    unmount();
    expect(container.querySelector('.kardz')).toBeNull();
  });
});
