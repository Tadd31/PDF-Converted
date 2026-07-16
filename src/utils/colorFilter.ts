/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0 to 1
  s: number; // 0 to 1
  l: number; // 0 to 1
}

export type FilterMode =
  | 'invert_smart'
  | 'invert_raw'
  | 'midnight'
  | 'sepia'
  | 'forest'
  | 'solarized_dark'
  | 'contrast_bw'
  | 'grayscale'
  | 'coffee'
  | 'custom';

export interface FilterConfig {
  mode: FilterMode;
  customBg: string; // Hex string e.g., "#ffffff"
  customFg: string; // Hex string e.g., "#000000"
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  grayscale: boolean;
  hueRotate: number; // 0 to 360
}

export interface Preset {
  id: FilterMode;
  name: string;
  description: string;
  bg: string;
  fg: string;
  isDark: boolean;
}

export const PRESETS: Record<Exclude<FilterMode, 'custom' | 'invert_raw' | 'grayscale' | 'contrast_bw'>, Preset> = {
  invert_smart: {
    id: 'invert_smart',
    name: 'InkShift',
    description: 'Deep newsprint charcoal optimized for high-contrast screentone, preserving full-page splash art.',
    bg: '#141414',
    fg: '#f3f4f6',
    isDark: true,
  },
  midnight: {
    id: 'midnight',
    name: 'Neo-Tokyo Midnight',
    description: 'Deep midnight blue background reminiscent of Akira’s metropolis, with electric cyber-blue highlight ink.',
    bg: '#08090f',
    fg: '#7dd3fc',
    isDark: true,
  },
  sepia: {
    id: 'sepia',
    name: 'Classic Tankōbon',
    description: 'Aged pulpy paper and soft warm ink, replicating vintage tankōbon print editions.',
    bg: '#FAF3E3',
    fg: '#2a1a0d',
    isDark: false,
  },
  forest: {
    id: 'forest',
    name: 'Eva Canopy',
    description: 'Cockpit green glow reminiscent of experimental mecha HUDs and deep bio-organic commands.',
    bg: '#020602',
    fg: '#39ff14',
    isDark: true,
  },
  solarized_dark: {
    id: 'solarized_dark',
    name: 'Gekiga Charcoal',
    description: 'Sleek dark-teal ink of vintage underground seinen comics, relaxing to the eyes during long sessions.',
    bg: '#05161a',
    fg: '#9ce0db',
    isDark: true,
  },
  coffee: {
    id: 'coffee',
    name: 'Kissaten Espresso',
    description: 'Rich dark espresso canvas of a traditional Tokyo manga parlor, paired with cozy cream-toned text.',
    bg: '#1f1a17',
    fg: '#eae0d5',
    isDark: true,
  },
};

// Convert hex string to RGB
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  if (isNaN(bigint)) {
    return { r: 0, g: 0, b: 0 };
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Apply Hue Rotation
export function rotateHue(h: number, degrees: number): number {
  let newH = h + degrees / 360;
  if (newH > 1) newH -= 1;
  if (newH < 0) newH += 1;
  return newH;
}

/**
 * Core image processing filter. Applies custom styling directly to an ImageData array.
 * Highly optimized for running pixel operations.
 */
export function applyPixelFilter(imageData: ImageData, config: FilterConfig): void {
  const data = imageData.data;
  const len = data.length;

  // Pre-calculate configuration constants
  let bgRgb = { r: 255, g: 255, b: 255 };
  let fgRgb = { r: 0, g: 0, b: 0 };
  let isPresetMode = false;

  const mode = config.mode;

  if (mode === 'custom') {
    bgRgb = hexToRgb(config.customBg);
    fgRgb = hexToRgb(config.customFg);
    isPresetMode = true;
  } else if (mode in PRESETS) {
    const preset = PRESETS[mode as keyof typeof PRESETS];
    bgRgb = hexToRgb(preset.bg);
    fgRgb = hexToRgb(preset.fg);
    isPresetMode = true;
  }

  const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
  const isDarkBg = bgHsl.l < 0.5;

  // Contrast factor calculation
  // contrast ranges from -100 to 100
  const contrastFactor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));

  // Single loop over pixels
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    // If fully transparent, we can optionally fill with the background color
    // but typically pdf.js renders onto solid white/opaque. If transparency exists, we treat it.
    if (a === 0) {
      if (isPresetMode) {
        data[i] = bgRgb.r;
        data[i + 1] = bgRgb.g;
        data[i + 2] = bgRgb.b;
        data[i + 3] = 255;
      }
      continue;
    }

    // 1. Core Conversion Mode
    if (mode === 'invert_raw') {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    } else if (mode === 'contrast_bw') {
      // High contrast black & white
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const threshold = 128 + config.brightness; // adjust based on brightness setting
      const val = luminance > threshold ? 255 : 0;
      r = g = b = val;
    } else if (mode === 'grayscale' || config.grayscale) {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      r = g = b = gray;
    } else if (isPresetMode) {
      // Sophisticated color mapping using HSL
      const hsl = rgbToHsl(r, g, b);

      if (config.hueRotate > 0) {
        hsl.h = rotateHue(hsl.h, config.hueRotate);
      }

      // Determine if pixel is neutral (text, lines, page margins) or colorful (images, badges, logos)
      if (hsl.s < 0.18) {
        // Neutral color interpolation
        // Map original lightness (l=0 is dark text, l=1 is white background)
        // newColor = fg + l * (bg - fg)
        // In this formula, originally light colors (l -> 1) become bg,
        // and originally dark colors (l -> 0) become fg.
        const l = hsl.l;
        r = Math.round(fgRgb.r + l * (bgRgb.r - fgRgb.r));
        g = Math.round(fgRgb.g + l * (bgRgb.g - fgRgb.g));
        b = Math.round(fgRgb.b + l * (bgRgb.b - fgRgb.b));
      } else {
        // Colorful color conservation
        // We preserve the colorful hue and saturation, but shift its lightness to stand out
        let newL = hsl.l;
        if (isDarkBg) {
          // Dark background: make colorful elements light and readable
          // Map original l from [0, 1] to [0.35, 0.9]
          newL = 0.35 + hsl.l * 0.55;
        } else {
          // Light background: make colorful elements dark enough for contrast
          // Map original l from [0, 1] to [0.05, 0.65]
          newL = 0.05 + hsl.l * 0.6;
        }

        const mappedRgb = hslToRgb(hsl.h, hsl.s, newL);
        r = mappedRgb.r;
        g = mappedRgb.g;
        b = mappedRgb.b;
      }
    } else if (config.hueRotate > 0) {
      const hsl = rgbToHsl(r, g, b);
      hsl.h = rotateHue(hsl.h, config.hueRotate);
      const rotatedRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      r = rotatedRgb.r;
      g = rotatedRgb.g;
      b = rotatedRgb.b;
    }

    // 2. Brightness Adjustment (-100 to 100)
    if (config.brightness !== 0) {
      const bOffset = Math.round((config.brightness / 100) * 255);
      r = Math.min(255, Math.max(0, r + bOffset));
      g = Math.min(255, Math.max(0, g + bOffset));
      b = Math.min(255, Math.max(0, b + bOffset));
    }

    // 3. Contrast Adjustment (-100 to 100)
    if (config.contrast !== 0) {
      r = Math.min(255, Math.max(0, Math.round(contrastFactor * (r - 128) + 128)));
      g = Math.min(255, Math.max(0, Math.round(contrastFactor * (g - 128) + 128)));
      b = Math.min(255, Math.max(0, Math.round(contrastFactor * (b - 128) + 128)));
    }

    // Save back to pixel array
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}
