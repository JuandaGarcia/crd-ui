// The downloadable background library. One WebP per entry under
// public/backgrounds/<slug>.webp, all 430x270 (the card's ISO ratio) so they
// drop into --crd-bg without cropping. Shared by the gallery and the Theming
// showcase so the two can't drift.
//
// Original artwork by Juan David Garcia Rincon, released under CC0 1.0 —
// see public/backgrounds/LICENSE.txt.

export interface Background {
  /** File name without extension: /backgrounds/<slug>.webp */
  slug: string;
  /** Label shown in the gallery. */
  name: string;
}

export const BACKGROUNDS: Background[] = [
  { slug: 'amber', name: 'Amber' },
  { slug: 'apricot', name: 'Apricot' },
  { slug: 'aurora', name: 'Aurora' },
  { slug: 'bubbles', name: 'Bubbles' },
  { slug: 'charcoal', name: 'Charcoal' },
  { slug: 'chrome', name: 'Chrome' },
  { slug: 'cinder', name: 'Cinder' },
  { slug: 'circles', name: 'Circles' },
  { slug: 'deep', name: 'Deep' },
  { slug: 'dune', name: 'Dune' },
  { slug: 'eclipse', name: 'Eclipse' },
  { slug: 'foxes', name: 'Foxes' },
  { slug: 'glitch', name: 'Glitch' },
  { slug: 'gummy', name: 'Gummy' },
  { slug: 'halo', name: 'Halo' },
  { slug: 'holo', name: 'Holo' },
  { slug: 'jade', name: 'Jade' },
  { slug: 'jelly', name: 'Jelly' },
  { slug: 'kaleido', name: 'Kaleido' },
  { slug: 'letters', name: 'Letters' },
  { slug: 'maze', name: 'Maze' },
  { slug: 'mist', name: 'Mist' },
  { slug: 'obsidian', name: 'Obsidian' },
  { slug: 'oil-slick', name: 'Oil Slick' },
  { slug: 'opal', name: 'Opal' },
  { slug: 'orchid', name: 'Orchid' },
  { slug: 'peach', name: 'Peach' },
  { slug: 'pearl', name: 'Pearl' },
  { slug: 'pebbles', name: 'Pebbles' },
  { slug: 'picnic', name: 'Picnic' },
  { slug: 'planet', name: 'Planet' },
  { slug: 'prism', name: 'Prism' },
  { slug: 'reef', name: 'Reef' },
  { slug: 'retro', name: 'Retro' },
  { slug: 'ribbon', name: 'Ribbon' },
  { slug: 'satin', name: 'Satin' },
  { slug: 'silk', name: 'Silk' },
  { slug: 'solar', name: 'Solar' },
  { slug: 'solstice', name: 'Solstice' },
  { slug: 'splash', name: 'Splash' },
  { slug: 'steel', name: 'Steel' },
  { slug: 'stripes', name: 'Stripes' },
  { slug: 'taffy', name: 'Taffy' },
  { slug: 'topography', name: 'Topography' },
  { slug: 'vapor', name: 'Vapor' },
];
