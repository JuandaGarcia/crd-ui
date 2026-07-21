import { useEffect, useState } from 'react';
import { Card, type FocusedField } from 'crd-ui/react';

const SCENES = [
  { number: '4111111111111111', name: 'Ada Lovelace', expiry: '1229', cvc: '123' },
  { number: '5555555555554444', name: 'Grace Hopper', expiry: '0630', cvc: '321' },
  { number: '378282246310005', name: 'Alan Turing', expiry: '0928', cvc: '4321' },
  { number: '6062825624254001', name: 'Margaret Hamilton', expiry: '1127', cvc: '456' },
];

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => clearTimeout(t), { once: true });
  });

/** Self-typing looping demo for the hero. Static card if reduced motion. */
export function HeroCard() {
  const [data, setData] = useState({ ...SCENES[0]!, focused: null as FocusedField | null });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      let i = 0;
      while (!signal.aborted) {
        const scene = SCENES[i % SCENES.length]!;
        setData({ number: '', name: '', expiry: '', cvc: '', focused: 'number' });
        await sleep(600, signal);

        for (let n = 1; n <= scene.number.length && !signal.aborted; n++) {
          setData((d) => ({ ...d, number: scene.number.slice(0, n) }));
          await sleep(55, signal);
        }
        setData((d) => ({ ...d, focused: 'name', name: scene.name }));
        await sleep(700, signal);
        setData((d) => ({ ...d, focused: 'expiry', expiry: scene.expiry }));
        await sleep(700, signal);
        setData((d) => ({ ...d, focused: 'cvc' }));
        await sleep(650, signal);
        for (let n = 1; n <= scene.cvc.length && !signal.aborted; n++) {
          setData((d) => ({ ...d, cvc: scene.cvc.slice(0, n) }));
          await sleep(160, signal);
        }
        await sleep(900, signal);
        setData((d) => ({ ...d, focused: null }));
        await sleep(1600, signal);
        i++;
      }
    })();

    return () => controller.abort();
  }, []);

  return <Card {...data} tilt />;
}
