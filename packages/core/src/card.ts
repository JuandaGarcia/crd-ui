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
  /** The root `.kardz` element, in case you need direct access. */
  readonly element: HTMLElement;
  /** Remove the card from the DOM. The instance must not be used afterwards. */
  destroy(): void;
}

const TEMPLATE = `
<div class="kardz__inner">
  <div class="kardz__front">
    <div class="kardz__chip">${CHIP_SVG}</div>
    <div class="kardz__logo"></div>
    <div class="kardz__number"></div>
    <div class="kardz__footer">
      <div class="kardz__name"></div>
      <div class="kardz__expiry">
        <span class="kardz__expiry-label"></span>
        <span class="kardz__expiry-value"></span>
      </div>
    </div>
  </div>
  <div class="kardz__back">
    <div class="kardz__stripe"></div>
    <div class="kardz__signature"><span class="kardz__cvc"></span></div>
    <div class="kardz__logo kardz__logo--back"></div>
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
    number: query('.kardz__number'),
    name: query('.kardz__name'),
    expiryLabel: query('.kardz__expiry-label'),
    expiryValue: query('.kardz__expiry-value'),
    cvc: query('.kardz__cvc'),
    logoFront: query('.kardz__logo'),
    logoBack: query('.kardz__logo--back'),
  };
  refs.expiryLabel.textContent = validThru;

  let brand: Brand | null = null;
  let renderedLogoBrand: Brand | null | undefined;

  function render(): void {
    brand = detectBrand(state.number);

    root.className = [
      'kardz',
      brand ? `kardz--brand-${brand}` : 'kardz--unknown',
      state.focused === 'cvc' ? 'kardz--flipped' : '',
      state.focused ? `kardz--focus-${state.focused}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    refs.number.textContent = maskCardNumber(state.number, brand);

    const name = state.name.trim();
    refs.name.textContent = name || namePlaceholder;
    refs.name.classList.toggle('kardz__name--placeholder', !name);

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
