import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Card } from '../src/vue';

describe('<Card /> (Vue)', () => {
  it('renders the card and defaults to the sunset variant', () => {
    const wrapper = mount(Card);
    const root = wrapper.find('.crd');
    expect(root.exists()).toBe(true);
    expect(root.classes()).toContain('crd--v-sunset');
    expect(root.find('.crd__number').text()).toBe('•••• •••• •••• ••••');
  });

  it('updates the card and emits brandChange when props change', async () => {
    const wrapper = mount(Card);
    expect(wrapper.emitted('brandChange')).toBeUndefined();

    await wrapper.setProps({ number: '4111 1111' });
    expect(wrapper.find('.crd').classes()).toContain('crd--brand-visa');
    expect(wrapper.emitted('brandChange')).toEqual([['visa']]);

    await wrapper.setProps({ number: '' });
    expect(wrapper.emitted('brandChange')).toEqual([['visa'], [null]]);
  });

  it('flips when the cvc is focused and applies variant changes', async () => {
    const wrapper = mount(Card, { props: { focused: 'cvc' as const } });
    expect(wrapper.find('.crd').classes()).toContain('crd--flipped');

    await wrapper.setProps({ focused: null, variant: 'holo' as const });
    expect(wrapper.find('.crd').classes()).not.toContain('crd--flipped');
    expect(wrapper.find('.crd').classes()).toContain('crd--v-holo');
  });

  it('passes creation-time options through', () => {
    const wrapper = mount(Card, {
      props: { placeholders: { name: 'NOMBRE COMPLETO' }, locale: { validThru: 'válida hasta' } },
    });
    expect(wrapper.find('.crd__name').text()).toBe('NOMBRE COMPLETO');
    expect(wrapper.find('.crd__expiry-label').text()).toBe('válida hasta');
  });

  it('destroys the card on unmount', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const wrapper = mount(Card, { attachTo: host });
    expect(host.querySelector('.crd')).not.toBeNull();
    wrapper.unmount();
    expect(host.querySelector('.crd')).toBeNull();
    host.remove();
  });
});
