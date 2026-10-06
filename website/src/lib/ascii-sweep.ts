// ASCII sweep between framework snippets: a band of glowing characters crosses
// the code block and swaps one framework's snippet for the next, growing
// glyphs on the exact character cells it passes over. The band spans the
// whole viewport: every other piece of text it crosses dissolves into glyphs
// and comes back, so the page reads as being rewritten for the new framework.
//
// Effect design adapted from Canvas UI's ASCII Sweep
// (https://canvasui.dev/docs/components/ascii-sweep). That component captures
// live DOM through Chrome's flagged HTML-in-Canvas API; this version needs no
// capture: the glyph grid is derived from the text itself (the snippet's
// character cells, and the measured word boxes of everything else), so it
// runs in every browser.

const ORDER = ['react', 'vanilla', 'vue', 'svelte'];
const GLYPHS = '.:-=+*<>/{}[]01#%&$@';

const DURATION_MS = 1200;
const PAGE_DURATION_MS = 1400;
/** How far the page dims underneath the band. */
const FADE = 0.8;
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
/** Width of the glyph band as a fraction of the block width. */
const BAND = 0.28;
/** Feather of the band's leading edge, as a fraction of the band. */
const SOFTNESS = 0.45;
/** Glowing trail left behind the band, as a fraction of the band. */
const TRAIL = 0.75;
/** How ragged the sweep edge is, row by row. */
const TURBULENCE = 0.25;
const DENSITY = 0.92;
const FLICKER = 0.35;

interface Sweep {
  /** First `.fw-block` of the group, stable across framework changes. */
  group: Element;
  from: string;
  dir: 1 | -1;
  /** Timestamp the sweep started at; null while it waits to scroll into view. */
  start: number | null;
  /** Driven by the page-wide band instead of running on its own clock. */
  page: boolean;
  /** Distance from the band's entering viewport edge to the block's. */
  offset: number;
  block: HTMLElement;
  pre: HTMLElement;
  layers: [HTMLElement, HTMLElement];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  lines: [string[], string[]];
  heights: [number, number];
  width: number;
  band: number;
  padLeft: number;
  padTop: number;
  charWidth: number;
  lineHeight: number;
  ink: string;
  hot: string;
}

/** A word on screen: its box, and how many glyphs stand in for it. */
interface Word {
  x: number;
  y: number;
  width: number;
  count: number;
  fixed: boolean;
  /** How many page-driven snippets sit above it and push it as they resize. */
  shift: number;
}

interface Page {
  start: number;
  dir: 1 | -1;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Dims the page under the band; separate so the glyphs' glow skips it. */
  dim: HTMLCanvasElement;
  dimCtx: CanvasRenderingContext2D;
  band: number;
  width: number;
  height: number;
  scrollY: number;
  /** Words grouped by canvas font, to set it once per group. */
  fonts: Map<string, Word[]>;
  sweeps: Sweep[];
  ink: string;
  hot: string;
  cover: [number, number, number];
}

let active: Sweep[] = [];
let page: Page | null = null;
let frame = 0;
let observer: IntersectionObserver | undefined;

const hash = (a: number, b = 0, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

let probe: CanvasRenderingContext2D | null | undefined;

/** Resolve any CSS color (hex, rgb(), oklch()…) to RGB plus alpha. */
function parseColor(color: string): [number, number, number, number] {
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return [0, 0, 0, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = color.trim();
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r!, g!, b!, a! / 255];
}

const parseRgb = (color: string) => parseColor(color).slice(0, 3) as [number, number, number];

const mix = (c: [number, number, number], to: number, amount: number) =>
  `rgb(${c.map((v) => Math.round(v + (to - v) * amount)).join(' ')})`;

/** The sibling `.fw-block` of the same group that holds another framework. */
function partner(block: Element, fw: string): HTMLElement | null {
  for (const step of ['previousElementSibling', 'nextElementSibling'] as const) {
    let el = block[step];
    while (el?.classList.contains('fw-block')) {
      if ((el as HTMLElement).dataset.block === fw) return el as HTMLElement;
      el = el[step];
    }
  }
  return null;
}

function groupOf(block: Element): Element {
  let first = block;
  while (first.previousElementSibling?.classList.contains('fw-block')) {
    first = first.previousElementSibling;
  }
  return first;
}

function endPage() {
  page?.canvas.remove();
  page?.dim.remove();
  page = null;
}

function finish(sweep: Sweep) {
  observer?.unobserve(sweep.block);
  for (const layer of sweep.layers) layer.remove();
  sweep.canvas.remove();
  sweep.block.classList.remove('is-sweeping');
  sweep.block.style.removeProperty('--sweep-x');
  sweep.pre.style.height = '';
}

function cancel() {
  cancelAnimationFrame(frame);
  frame = 0;
  for (const sweep of active) finish(sweep);
  active = [];
  endPage();
}

const direction = (from: string, to: string) =>
  ORDER.indexOf(to) > ORDER.indexOf(from) ? 1 : -1;

/** `pageBand` is the page-wide band's width when that band drives this block. */
function prepare(
  toBlock: HTMLElement,
  from: string,
  to: string,
  pageBand: number | null,
): Sweep | null {
  const dir = direction(from, to);
  const fromPre = partner(toBlock, from)?.querySelector<HTMLElement>('pre.astro-code');
  const pre = toBlock.querySelector<HTMLElement>('pre.astro-code');
  const block = pre?.parentElement;
  if (!fromPre || !pre || !block?.classList.contains('code-block')) return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // The real pre keeps its box (and animates its height); its text is hidden
  // while two transparent copies, masked on either side of the band, show the
  // outgoing and incoming snippets.
  const layers = [fromPre, pre].map((source, i) => {
    const layer = source.cloneNode(true) as HTMLElement;
    layer.classList.add('sweep-layer', i === 0 ? 'sweep-layer--from' : 'sweep-layer--to');
    layer.setAttribute('aria-hidden', 'true');
    layer.removeAttribute('tabindex');
    block.append(layer);
    return layer;
  }) as [HTMLElement, HTMLElement];

  const heights: [number, number] = [layers[0].offsetHeight, layers[1].offsetHeight];
  const width = pre.clientWidth;
  const band = pageBand ?? BAND * width;
  const rect = pre.getBoundingClientRect();
  const preStyle = getComputedStyle(pre);
  const codeStyle = getComputedStyle(pre.querySelector('code') ?? pre);
  const font = `${codeStyle.fontWeight} ${codeStyle.fontSize} ${codeStyle.fontFamily}`;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const height = Math.max(...heights);
  canvas.className = 'sweep-canvas';
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  block.append(canvas);

  block.classList.add('is-sweeping');
  block.style.setProperty('--sweep-dir', dir > 0 ? '90deg' : '270deg');
  block.style.setProperty('--sweep-feather', `${SOFTNESS * band}px`);
  block.style.setProperty('--sweep-band', `${band}px`);
  block.style.setProperty('--sweep-tail', `${(1 + TRAIL) * band}px`);
  block.style.setProperty('--sweep-jitter', `${TURBULENCE * band * 0.6}px`);

  return {
    group: groupOf(toBlock),
    from,
    dir,
    start: null,
    page: pageBand !== null,
    offset: dir > 0 ? rect.left : window.innerWidth - rect.right,
    block,
    pre,
    layers,
    canvas,
    ctx,
    lines: [fromPre.textContent!.split('\n'), pre.textContent!.split('\n')],
    heights,
    width,
    band,
    padLeft: parseFloat(preStyle.paddingLeft),
    padTop: parseFloat(preStyle.paddingTop),
    charWidth: ctx.measureText('0'.repeat(40)).width / 40,
    lineHeight: parseFloat(preStyle.lineHeight) || parseFloat(codeStyle.fontSize) * 1.7,
    ink: '',
    hot: '',
  };
}

/** Read the colors when the sweep fires: the theme may have changed since. */
function tint(target: Sweep | Page, surface: [number, number, number]) {
  const accent = parseRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  const dark = surface[0] * 0.299 + surface[1] * 0.587 + surface[2] * 0.114 < 128;
  // Brand accents are tuned for dark surfaces; on a light one they need to be
  // deepened to read as ink.
  target.ink = dark ? mix(accent, 0, 0) : mix(accent, 0, 0.35);
  target.hot = dark ? mix(accent, 255, 0.6) : target.ink;
  target.canvas.style.filter = `drop-shadow(0 0 ${dark ? 6 : 3}px ${mix(accent, 0, 0)})`;
}

const surfaceOf = (el: Element) => parseRgb(getComputedStyle(el).backgroundColor);

/**
 * Where the band's head is, measured from the edge it enters by. It starts
 * far enough off that edge to leave the outgoing text untouched, and travels
 * until the trail and the ragged edge have cleared the far side.
 */
function headAt(progress: number, band: number, width: number) {
  const maxJitter = TURBULENCE * band * 0.6;
  const lead = maxJitter + SOFTNESS * band;
  return -lead + progress * (width + (1 + TRAIL) * band + maxJitter + lead);
}

function draw(sweep: Sweep, head: number, progress: number, time: number) {
  const { ctx, dir, band, width, charWidth, lineHeight, padLeft, padTop, lines, heights } = sweep;
  const feather = SOFTNESS * band;
  const tail = (1 + TRAIL) * band;
  const height = heights[0] + (heights[1] - heights[0]) * progress;

  sweep.block.style.setProperty('--sweep-x', `${head}px`);
  if (heights[0] !== heights[1]) {
    sweep.pre.style.height = `${height}px`;
    for (const layer of sweep.layers) layer.style.height = `${height}px`;
  }

  ctx.clearRect(0, 0, width, Math.max(...heights));

  const rows = Math.max(lines[0].length, lines[1].length);
  const churn = Math.floor(time * 15);
  const flick = Math.floor(time * 18);
  for (let row = 0; row < rows; row++) {
    const y = padTop + (row + 0.5) * lineHeight;
    if (y + lineHeight / 2 > height) break;
    // Tear the edge per row so the band eats lines instead of cutting straight.
    const rowJitter = (hash(row, 19.7) - 0.5) * 0.8;
    const cols = Math.max(lines[0][row]?.length ?? 0, lines[1][row]?.length ?? 0);
    for (let col = 0; col < cols; col++) {
      const x = padLeft + (col + 0.5) * charWidth;
      if (x > width) break;
      const jitter = (rowJitter + (hash(row, col, 3.1) - 0.5) * 0.4) * TURBULENCE * band;
      const behind = head - (dir > 0 ? x : width - x) + jitter;
      if (behind <= 0 || behind >= tail) continue;

      // Swap inside the band, where the characters are densest.
      const char = lines[behind > band * 0.46 ? 1 : 0][row]?.[col];
      if (!char || char === ' ') continue;
      if (hash(row, col, 11.3) > DENSITY) continue;

      const level = 0.72 + 0.28 * hash(row, col, 7.7);
      let alpha = smoothstep(0, feather, behind) * (1 - smoothstep(band, tail, behind)) * level;
      if (hash(row * 31 + col, flick) < 0.4) alpha *= 1 - FLICKER;

      // Past the band the glyphs settle onto the incoming characters, so the
      // trail resolves into the new snippet instead of dissolving over it.
      const settled = behind > band * 0.9;
      const glyph = settled
        ? char
        : GLYPHS[Math.floor(hash(row, col, churn) * GLYPHS.length)]!;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = !settled && level > 0.93 ? sweep.hot : sweep.ink;
      ctx.fillText(glyph, x, y);
    }
  }
}

/** Whether an element's text is worth standing glyphs in for, and in what font. */
function describe(el: Element, sweeps: Sweep[], fixedCache: Map<Element, boolean>) {
  const rect = el.getBoundingClientRect();
  if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) return null;
  // The card animates on its own, so glyphs measured now would drift off it.
  if (el.closest('script, style, noscript, svg, select, textarea, .crd, .is-sweeping')) return null;
  const visible = (el as Element & { checkVisibility?: (o: object) => boolean }).checkVisibility?.({
    opacityProperty: true,
    visibilityProperty: true,
  });
  if (visible === false) return null;

  const isFixed = (node: Element | null): boolean => {
    if (!node) return false;
    let fixed = fixedCache.get(node);
    if (fixed === undefined) {
      fixed = getComputedStyle(node).position === 'fixed' || isFixed(node.parentElement);
      fixedCache.set(node, fixed);
    }
    return fixed;
  };
  const style = getComputedStyle(el);
  const fixed = isFixed(el);
  return {
    font: `${style.fontWeight} ${style.fontSize} ${MONO}`,
    fixed,
    shift: fixed
      ? 0
      : sweeps.filter(
          (s) => s.block.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).length,
  };
}

/** Measure every word on screen, outside the snippets that sweep themselves. */
function collectWords(sweeps: Sweep[]) {
  const fonts = new Map<string, Word[]>();
  const described = new Map<Element, ReturnType<typeof describe>>();
  const fixedCache = new Map<Element, boolean>();
  // Skip whole subtrees that are scrolled out of view: the page is long and
  // this runs inside the click handler.
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    (node) => {
      if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
      const rect = (node as Element).getBoundingClientRect();
      const offScreen = rect.bottom < 0 || rect.top > window.innerHeight;
      return rect.height && offScreen ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
    },
  );
  const range = document.createRange();
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const parent = node.parentElement;
    if (!parent || !node.data.trim()) continue;
    let meta = described.get(parent);
    if (meta === undefined) {
      meta = describe(parent, sweeps, fixedCache);
      described.set(parent, meta);
    }
    if (!meta) continue;
    for (const match of node.data.matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const words = fonts.get(meta.font) ?? [];
      fonts.set(meta.font, words);
      words.push({
        x: rect.left,
        y: rect.top + rect.height / 2,
        width: rect.width,
        count: match[0].length,
        fixed: meta.fixed,
        shift: meta.shift,
      });
    }
  }
  return fonts;
}

function startPage(sweeps: Sweep[], dir: 1 | -1, band: number) {
  const canvas = document.createElement('canvas');
  const dim = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dimCtx = dim.getContext('2d');
  if (!ctx || !dimCtx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  dim.className = 'sweep-page';
  dim.width = width;
  dim.height = height;
  canvas.className = 'sweep-page';
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // The page color may sit on either root element.
  let cover = parseColor(getComputedStyle(document.body).backgroundColor);
  if (!cover[3]) cover = parseColor(getComputedStyle(document.documentElement).backgroundColor);

  page = {
    start: performance.now(),
    dir,
    canvas,
    ctx,
    dim,
    dimCtx,
    band,
    width,
    height,
    scrollY: window.scrollY,
    fonts: collectWords(sweeps),
    sweeps,
    ink: '',
    hot: '',
    cover: [cover[0], cover[1], cover[2]],
  };
  tint(page, page.cover);
  for (const sweep of sweeps) {
    sweep.start = page.start;
    tint(sweep, surfaceOf(sweep.pre));
  }
  document.body.append(dim, canvas);
  frame ||= requestAnimationFrame(tick);
}

function drawPage(page: Page, progress: number, time: number) {
  const { ctx, dimCtx, dir, band, width, height } = page;
  const feather = SOFTNESS * band;
  const tail = (1 + TRAIL) * band;
  const maxJitter = TURBULENCE * band * 0.6;
  const head = headAt(progress, band, width);
  const toScreen = (x: number) => (dir > 0 ? x : width - x);

  // The snippets resize as they swap, pushing everything below them.
  const pushed: number[] = [];
  for (const sweep of page.sweeps) {
    draw(sweep, head - sweep.offset, progress, time);
    const delta = (sweep.heights[1] - sweep.heights[0]) * progress;
    pushed.push((pushed[pushed.length - 1] ?? 0) + delta);
  }
  const scrolled = page.scrollY - window.scrollY;

  ctx.clearRect(0, 0, width, height);
  dimCtx.clearRect(0, 0, width, height);

  // Dim the page under the band so the glyphs replace the text they cover.
  const [r, g, b] = page.cover;
  const dim = dimCtx.createLinearGradient(toScreen(head), 0, toScreen(head - tail), 0);
  dim.addColorStop(0, `rgb(${r} ${g} ${b} / 0)`);
  dim.addColorStop(feather / tail, `rgb(${r} ${g} ${b} / ${FADE})`);
  dim.addColorStop(band / tail, `rgb(${r} ${g} ${b} / ${FADE})`);
  dim.addColorStop(1, `rgb(${r} ${g} ${b} / 0)`);
  dimCtx.fillStyle = dim;
  dimCtx.fillRect(Math.min(toScreen(head), toScreen(head - tail)), 0, tail, height);
  // The swapping snippets mask their own text; keep their boxes intact.
  for (const sweep of page.sweeps) {
    const rect = sweep.pre.getBoundingClientRect();
    dimCtx.clearRect(rect.left, rect.top, rect.width, rect.height);
  }

  const churn = Math.floor(time * 15);
  const flick = Math.floor(time * 18);
  for (const [font, words] of page.fonts) {
    ctx.font = font;
    for (const word of words) {
      const near = dir > 0 ? word.x : width - word.x - word.width;
      if (head - near + maxJitter <= 0 || head - near - word.width - maxJitter >= tail) continue;
      const y = word.fixed
        ? word.y
        : word.y + scrolled + (word.shift ? pushed[word.shift - 1]! : 0);
      if (y < -40 || y > height + 40) continue;

      const row = Math.round(word.y / 12);
      const rowJitter = (hash(row, 19.7) - 0.5) * 0.8;
      const step = word.width / word.count;
      for (let i = 0; i < word.count; i++) {
        const x = word.x + (i + 0.5) * step;
        const col = Math.round(x / 4);
        const jitter = (rowJitter + (hash(row, col, 3.1) - 0.5) * 0.4) * TURBULENCE * band;
        const behind = head - toScreen(x) + jitter;
        if (behind <= 0 || behind >= tail) continue;
        if (hash(row, col, 11.3) > DENSITY) continue;

        const level = 0.72 + 0.28 * hash(row, col, 7.7);
        let alpha = smoothstep(0, feather, behind) * (1 - smoothstep(band, tail, behind)) * level;
        if (hash(row * 31 + col, flick) < 0.4) alpha *= 1 - FLICKER;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = level > 0.93 ? page.hot : page.ink;
        ctx.fillText(GLYPHS[Math.floor(hash(row, col, churn) * GLYPHS.length)]!, x, y);
      }
    }
  }
}

function tick(now: number) {
  frame = 0;
  if (page) {
    const t = Math.min((now - page.start) / PAGE_DURATION_MS, 1);
    drawPage(page, ease(t), now / 1000);
    if (t === 1) {
      for (const sweep of page.sweeps) finish(sweep);
      active = active.filter((sweep) => !sweep.page);
      endPage();
    }
  }
  for (const sweep of [...active]) {
    if (sweep.page || sweep.start === null) continue;
    const t = Math.min((now - sweep.start) / DURATION_MS, 1);
    draw(sweep, headAt(ease(t), sweep.band, sweep.width), ease(t), now / 1000);
    if (t === 1) {
      finish(sweep);
      active.splice(active.indexOf(sweep), 1);
    }
  }
  if (page || active.some((sweep) => !sweep.page && sweep.start !== null)) {
    frame = requestAnimationFrame(tick);
  }
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const sweep = active.find((s) => s.block === entry.target);
    if (!entry.isIntersecting || !sweep || sweep.start !== null) continue;
    observer!.unobserve(sweep.block);
    tint(sweep, surfaceOf(sweep.pre));
    sweep.start = performance.now();
    frame ||= requestAnimationFrame(tick);
  }
}

/**
 * Sweep the page from one framework to another. Call it right after `data-fw`
 * has changed. A band crosses the whole viewport, swapping the snippets on
 * screen; snippet groups further down hold their outgoing snippet and run
 * their own sweep once they scroll into view.
 */
export function sweepFramework(from: string, to: string) {
  // A group still waiting to be seen keeps sweeping from what the reader last
  // saw there, not from a framework that was only picked in passing.
  const held = new Map(active.filter((s) => s.start === null).map((s) => [s.group, s.from]));
  cancel();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!observer) {
    observer = new IntersectionObserver(onIntersect, { rootMargin: '-15% 0px -15% 0px' });
    // The glyph grid is measured up front; a change in width invalidates it.
    // (Height alone changes on mobile whenever the URL bar slides away.)
    let width = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth !== width) cancel();
      width = window.innerWidth;
    });
  }

  const pageBand = Math.min(Math.max(0.22 * window.innerWidth, 150), 340);
  const onScreen: Sweep[] = [];
  for (const block of document.querySelectorAll<HTMLElement>(`.fw-block[data-block="${to}"]`)) {
    const rect = block.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    const origin = held.get(groupOf(block)) ?? from;
    // The page band has one direction, so a held group joins it from `from`.
    const sweep =
      origin === to && !visible
        ? null
        : prepare(block, visible ? from : origin, to, visible ? pageBand : null);
    if (!sweep) continue;
    active.push(sweep);
    if (sweep.page) {
      onScreen.push(sweep);
    } else {
      draw(sweep, headAt(0, sweep.band, sweep.width), 0, 0);
      observer.observe(sweep.block);
    }
  }
  if (from !== to) startPage(onScreen, direction(from, to), pageBand);
}
