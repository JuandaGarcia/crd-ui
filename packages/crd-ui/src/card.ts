import { type Brand, detectBrand, getBrandSpec } from './brands';
import { formatCvc, formatExpiry, maskCardNumber } from './format';
import { CHIP_SVG, LOGOS } from './logos';

export type FocusedField = 'number' | 'name' | 'expiry' | 'cvc';

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused?: FocusedField | null;
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
  </div>
  <div class="crd__back">
    <div class="crd__stripe"></div>
    <div class="crd__signature"><span class="crd__cvc"></span></div>
    <div class="crd__logo crd__logo--back"></div>
  </div>
</div>`;

export function createCard(container: HTMLElement, options: CardOptions = {}): CardInstance {
  const state: CardData = {
    number: options.number ?? '',
    name: options.name ?? '',
    expiry: options.expiry ?? '',
    cvc: options.cvc ?? '',
    focused: options.focused ?? null,
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
    expiryLabel: query('.crd__expiry-label'),
    expiryValue: query('.crd__expiry-value'),
    cvc: query('.crd__cvc'),
    logoFront: query('.crd__logo'),
    logoBack: query('.crd__logo--back'),
  };
  refs.expiryLabel.textContent = validThru;

  let brand: Brand | null = null;
  let renderedLogoBrand: Brand | null | undefined;

  function render(): void {
    brand = detectBrand(state.number);

    root.className = [
      'crd',
      brand ? `crd--brand-${brand}` : 'crd--unknown',
      state.focused === 'cvc' ? 'crd--flipped' : '',
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
      root.remove();
    },
  };
}
