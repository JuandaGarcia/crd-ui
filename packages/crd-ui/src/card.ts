import { type Brand, detectBrand, getBrandSpec } from './brands';
import { formatCvc, formatExpiry, maskCardNumber } from './format';
import { CHIP_SVG, LOGOS } from './logos';

export type FocusedField = 'number' | 'name' | 'expiry' | 'cvc';

/**
 * Visual style of the card. 'gradient' is the classic per-brand gradient;
 * the rest are brand-agnostic finishes (the brand still shows via its logo).
 */
export type CardVariant = 'gradient' | 'ember' | 'holo' | 'porcelain' | 'sunset' | 'graphite';

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused?: FocusedField | null;
  variant?: CardVariant;
  /** Pointer-tracked 3D hover tilt with a light glare. Default: false. */
  tilt?: boolean;
}

export interface CardOptions extends Partial<CardData> {
  placeholders?: {
    /** Shown on the card while the name is empty. Default: 'FULL NAME'. */
    name?: string;
  };
  locale?: {
    /** Label next to the expiry date. Default: 'valid thru'. */
    validThru?: string;
  };
  /** Override the built-in generic brand marks with your own inline SVG. */
  logos?: Partial<Record<Brand, string>>;
}

export interface CardInstance {
  /** Merge new values and re-render the affected parts of the card. */
  update(data: Partial<CardData>): void;
  /** Brand detected from the current number, or null. */
  readonly brand: Brand | null;
  /** The root `.crd` element, in case you need direct access. */
  readonly element: HTMLElement;
  /** Remove the card from the DOM. The instance must not be used afterwards. */
  destroy(): void;
}

const TEMPLATE = `
<div class="crd__inner">
  <div class="crd__front">
    <div class="crd__chip">${CHIP_SVG}</div>
    <div class="crd__logo"></div>
    <div class="crd__number"></div>
    <div class="crd__footer">
      <div class="crd__name"></div>
      <div class="crd__expiry">
        <span class="crd__expiry-label"></span>
        <span class="crd__expiry-value"></span>
      </div>
    </div>
    <div class="crd__ring"></div>
  </div>
  <div class="crd__back">
    <div class="crd__stripe"></div>
    <div class="crd__signature"><span class="crd__cvc"></span></div>
    <div class="crd__logo crd__logo--back"></div>
  </div>
</div>
<div class="crd__glare"></div>`;

export function createCard(container: HTMLElement, options: CardOptions = {}): CardInstance {
  const state: CardData = {
    number: options.number ?? '',
    name: options.name ?? '',
    expiry: options.expiry ?? '',
    cvc: options.cvc ?? '',
    focused: options.focused ?? null,
    variant: options.variant ?? 'sunset',
    tilt: options.tilt ?? false,
  };
  const namePlaceholder = options.placeholders?.name ?? 'FULL NAME';
  const validThru = options.locale?.validThru ?? 'valid thru';
  const logos: Record<Brand, string> = { ...LOGOS, ...options.logos };

  const root = document.createElement('div');
  root.setAttribute('role', 'img');
  root.innerHTML = TEMPLATE;
  container.appendChild(root);

  const query = (selector: string): HTMLElement => root.querySelector<HTMLElement>(selector)!;
  const refs = {
    number: query('.crd__number'),
    name: query('.crd__name'),
    expiry: query('.crd__expiry'),
    expiryLabel: query('.crd__expiry-label'),
    expiryValue: query('.crd__expiry-value'),
    cvc: query('.crd__cvc'),
    logoFront: query('.crd__logo'),
    logoBack: query('.crd__logo--back'),
    ring: query('.crd__ring'),
  };
  refs.expiryLabel.textContent = validThru;

  // The focus ring is one element that travels between sections: on focus
  // changes it slides/resizes to the target (spring transition in CSS); when
  // it (re)appears it snaps into place first so it never slides in from a
  // stale position. Geometry is re-synced on every render so the ring tracks
  // content growth (e.g. the number widening while typing).
  let ringHideTimer: ReturnType<typeof setTimeout> | undefined;

  function updateRing(): void {
    const targets = { number: refs.number, name: refs.name, expiry: refs.expiry } as const;
    const target =
      state.focused && state.focused !== 'cvc' ? targets[state.focused] : undefined;
    const width = target?.offsetWidth ?? 0;
    if (!target || !width) {
      // Grace period before hiding: moving between inputs fires blur before
      // focus, which passes through a focused=null render — deferring the
      // hide lets the ring travel to the next section instead of fading out
      // and reappearing.
      if (!ringHideTimer && refs.ring.classList.contains('crd__ring--on')) {
        ringHideTimer = setTimeout(() => {
          ringHideTimer = undefined;
          refs.ring.classList.remove('crd__ring--on');
        }, 90);
      }
      return;
    }
    if (ringHideTimer) {
      clearTimeout(ringHideTimer);
      ringHideTimer = undefined;
    }
    const wasOn = refs.ring.classList.contains('crd__ring--on');
    if (!wasOn) refs.ring.classList.add('crd__ring--instant');
    refs.ring.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
    refs.ring.style.width = `${width}px`;
    refs.ring.style.height = `${target.offsetHeight}px`;
    refs.ring.classList.add('crd__ring--on');
    if (!wasOn) {
      void refs.ring.offsetWidth;
      refs.ring.classList.remove('crd__ring--instant');
    }
  }

  // Hover tilt (adapted from Transitions.dev's card tilt): pointer position
  // over the card drives rotateX/rotateY and the glare spotlight through CSS
  // custom properties. The handlers stay attached and simply no-op while the
  // option is off, so tilt can be toggled at any time via update().
  const TILT_MAX = 12;
  let tiltHover = false;

  function onTiltMove(event: PointerEvent): void {
    if (!state.tilt) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    tiltHover = true;
    root.classList.add('crd--tilt-hover');
    root.style.setProperty('--crd-tilt-ry', `${((px - 0.5) * TILT_MAX).toFixed(2)}deg`);
    root.style.setProperty('--crd-tilt-rx', `${((0.5 - py) * TILT_MAX).toFixed(2)}deg`);
    root.style.setProperty('--crd-tilt-gx', `${(px * 100).toFixed(1)}%`);
    root.style.setProperty('--crd-tilt-gy', `${(py * 100).toFixed(1)}%`);
  }

  function onTiltLeave(): void {
    tiltHover = false;
    root.classList.remove('crd--tilt-hover');
    root.style.setProperty('--crd-tilt-rx', '0deg');
    root.style.setProperty('--crd-tilt-ry', '0deg');
  }

  root.addEventListener('pointermove', onTiltMove);
  root.addEventListener('pointerleave', onTiltLeave);

  let brand: Brand | null = null;
  let renderedLogoBrand: Brand | null | undefined;

  // Flip choreography: crd--flipping is added for the duration of one flip
  // (either direction) so the CSS can play the lift/sheen/shadow animation,
  // and removed when it ends. Cards created already flipped don't animate.
  let flipped = (options.focused ?? null) === 'cvc';
  let flipping = false;
  root.addEventListener('animationend', (event) => {
    if (event.animationName === 'crd-lift' && event.target === root) {
      flipping = false;
      root.classList.remove('crd--flipping');
    }
  });

  function render(): void {
    brand = detectBrand(state.number);

    const nowFlipped = state.focused === 'cvc';
    if (nowFlipped !== flipped) {
      flipped = nowFlipped;
      if (flipping) {
        // Restart the animation when the flip reverses mid-air.
        root.classList.remove('crd--flipping');
        void root.offsetWidth;
      }
      flipping = true;
    }

    if (!state.tilt && tiltHover) onTiltLeave();

    root.className = [
      'crd',
      brand ? `crd--brand-${brand}` : 'crd--unknown',
      state.variant && state.variant !== 'gradient' ? `crd--v-${state.variant}` : '',
      state.tilt ? 'crd--tilt' : '',
      tiltHover ? 'crd--tilt-hover' : '',
      flipped ? 'crd--flipped' : '',
      flipping ? 'crd--flipping' : '',
      state.focused ? `crd--focus-${state.focused}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    refs.number.textContent = maskCardNumber(state.number, brand);

    const name = state.name.trim();
    refs.name.textContent = name || namePlaceholder;
    refs.name.classList.toggle('crd__name--placeholder', !name);

    refs.expiryValue.textContent = formatExpiry(state.expiry);
    refs.cvc.textContent = formatCvc(state.cvc, brand);

    if (brand !== renderedLogoBrand) {
      const logo = brand ? logos[brand] : '';
      refs.logoFront.innerHTML = logo;
      refs.logoBack.innerHTML = logo;
      renderedLogoBrand = brand;
    }

    const brandLabel = brand ? getBrandSpec(brand).displayName : 'Payment';
    root.setAttribute('aria-label', `${brandLabel} card preview`);

    updateRing();
  }

  render();

  return {
    update(data) {
      Object.assign(state, data);
      render();
    },
    get brand() {
      return brand;
    },
    get element() {
      return root;
    },
    destroy() {
      if (ringHideTimer) clearTimeout(ringHideTimer);
      root.remove();
    },
  };
}
