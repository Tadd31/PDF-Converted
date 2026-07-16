/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generates mathematically precise halftone pattern SVGs for the application backdrop.
 */

export type BackdropPatternId = 'wave' | 'vignette' | 'spotlight' | 'diagonal' | 'uniform' | 'none';

export interface BackdropPattern {
  id: BackdropPatternId;
  name: string;
  description: string;
}

export const BACKDROP_PATTERNS: BackdropPattern[] = [
  {
    id: 'wave',
    name: 'Cosmic Wave',
    description: 'A beautiful diagonal wavy pattern with randomized feel',
  },
  {
    id: 'vignette',
    name: 'Concentric Vignette',
    description: 'Large dots at the edges, fading to a bright center',
  },
  {
    id: 'spotlight',
    name: 'Manga Spotlight',
    description: 'Dense dots in the center, washing out towards the edges',
  },
  {
    id: 'diagonal',
    name: 'Linear Diagonal',
    description: 'Classic gradient dots fading from top-left to bottom-right',
  },
  {
    id: 'uniform',
    name: 'Newspaper Print',
    description: 'A crisp, retro uniform grid of dots',
  },
  {
    id: 'none',
    name: 'Solid Slate',
    description: 'No screentone overlay, pure off-white or deep charcoal',
  },
];

// Helper to generate a staggered hex-grid of circles for different formulas
function generateStaggeredCircles(formula: (cx: number, cy: number) => number): string {
  let circles = '';
  for (let j = 0; j < 16; j++) {
    const cy = j * 8;
    const isOdd = j % 2 === 1;
    for (let i = 0; i < 8; i++) {
      const cx = i * 16 + (isOdd ? 8 : 0);
      const r = formula(cx, cy);
      circles += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" />`;
    }
  }
  return circles;
}

// Generate the circle elements statically for each pattern
const WAVE_CIRCLES = generateStaggeredCircles((cx, cy) => {
  const angle = Math.PI * (cx - cy) / 128;
  return 0.60 + 4.20 * Math.pow(Math.sin(angle), 2);
});

const VIGNETTE_CIRCLES = generateStaggeredCircles((cx, cy) => {
  const dx = cx - 64;
  const dy = cy - 64;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = Math.sqrt(64 * 64 + 64 * 64);
  const t = dist / maxDist;
  return 0.60 + 4.20 * Math.pow(t, 1.4);
});

const SPOTLIGHT_CIRCLES = generateStaggeredCircles((cx, cy) => {
  const dx = cx - 64;
  const dy = cy - 64;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = Math.sqrt(64 * 64 + 64 * 64);
  const t = dist / maxDist;
  return 0.60 + 4.20 * Math.pow(1 - t, 1.4);
});

const DIAGONAL_CIRCLES = generateStaggeredCircles((cx, cy) => {
  const val = (cx + cy) / 256; // range 0 to 1
  return 0.60 + 4.20 * Math.pow(1 - val, 1.4);
});

const UNIFORM_CIRCLES = generateStaggeredCircles(() => 2.50);

// Wraps circles in an SVG and encodes to standard URL-safe Data URI
function buildSvgDataUri(circles: string, isDark: boolean): string {
  const fill = isDark ? '%23ffffff' : '%23000000';
  const opacity = isDark ? '0.18' : '0.24';
  
  // Construct the SVG and URL-encode the needed parts
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><g fill="${fill}" fill-opacity="${opacity}">${circles}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Returns the exact CSS background-image style for a given pattern and theme mode
 */
export function getBackdropPatternUrl(id: BackdropPatternId, isDark: boolean): string {
  if (id === 'none') {
    return 'none';
  }

  let circlesStr = WAVE_CIRCLES;
  switch (id) {
    case 'vignette':
      circlesStr = VIGNETTE_CIRCLES;
      break;
    case 'spotlight':
      circlesStr = SPOTLIGHT_CIRCLES;
      break;
    case 'diagonal':
      circlesStr = DIAGONAL_CIRCLES;
      break;
    case 'uniform':
      circlesStr = UNIFORM_CIRCLES;
      break;
    case 'wave':
    default:
      circlesStr = WAVE_CIRCLES;
      break;
  }

  return buildSvgDataUri(circlesStr, isDark);
}
