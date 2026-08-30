/**
 * Blend Mode Algorithms for G-Pro Layer Compositor
 * Provides all 27 standard professional blend modes
 */

import { BlendMode } from '../types';
import { rgbToHsl, hslToRgb, getLuminance } from '../utils/color';

export function blendPixel(
  mode: BlendMode,
  br: number, bg: number, bb: number, ba: number, // Backdrop (Bottom) 0-255
  sr: number, sg: number, sb: number, sa: number  // Source (Top) 0-255
): [number, number, number, number] {
  if (sa === 0) return [br, bg, bb, ba];
  if (ba === 0) return [sr, sg, sb, sa];

  // Normalized 0..1
  const bRn = br / 255;
  const bGn = bg / 255;
  const bBn = bb / 255;
  const sRn = sr / 255;
  const sGn = sg / 255;
  const sBn = sb / 255;

  let r = sRn, g = sGn, b = sBn;

  const blendChannel = (cb: number, cs: number): number => {
    switch (mode) {
      case 'darken':
        return Math.min(cb, cs);
      case 'multiply':
        return cb * cs;
      case 'color-burn':
        return cs === 0 ? 0 : Math.max(0, 1 - (1 - cb) / cs);
      case 'linear-burn':
        return Math.max(0, cb + cs - 1);
      case 'darker-color':
        return (cb * 0.3 + cb * 0.59 + cb * 0.11 < cs * 0.3 + cs * 0.59 + cs * 0.11) ? cb : cs;
      case 'lighten':
        return Math.max(cb, cs);
      case 'screen':
        return cb + cs - cb * cs;
      case 'color-dodge':
        return cs === 1 ? 1 : Math.min(1, cb / (1 - cs));
      case 'linear-dodge':
        return Math.min(1, cb + cs);
      case 'lighter-color':
        return (cb * 0.3 + cb * 0.59 + cb * 0.11 > cs * 0.3 + cs * 0.59 + cs * 0.11) ? cb : cs;
      case 'overlay':
        return cb < 0.5 ? 2 * cb * cs : 1 - 2 * (1 - cb) * (1 - cs);
      case 'soft-light':
        return cs < 0.5
          ? cb - (1 - 2 * cs) * cb * (1 - cb)
          : cb + (2 * cs - 1) * (Math.sqrt(cb) - cb);
      case 'hard-light':
        return cs < 0.5 ? 2 * cb * cs : 1 - 2 * (1 - cb) * (1 - cs);
      case 'vivid-light':
        return cs < 0.5
          ? (cs === 0 ? 0 : Math.max(0, 1 - (1 - cb) / (2 * cs)))
          : (cs === 1 ? 1 : Math.min(1, cb / (2 * (1 - cs))));
      case 'linear-light':
        return Math.max(0, Math.min(1, cb + 2 * cs - 1));
      case 'pin-light':
        return cs < 0.5 ? Math.min(cb, 2 * cs) : Math.max(cb, 2 * (cs - 0.5));
      case 'hard-mix':
        return (cb + cs >= 1) ? 1 : 0;
      case 'difference':
        return Math.abs(cb - cs);
      case 'exclusion':
        return cb + cs - 2 * cb * cs;
      case 'subtract':
        return Math.max(0, cb - cs);
      case 'divide':
        return cs === 0 ? 1 : Math.min(1, cb / cs);
      case 'normal':
      default:
        return cs;
    }
  };

  // Component blend modes (Hue, Saturation, Color, Luminosity)
  if (['hue', 'saturation', 'color', 'luminosity'].includes(mode)) {
    const baseHsl = rgbToHsl(br, bg, bb);
    const srcHsl = rgbToHsl(sr, sg, sb);
    let targetHsl = { ...baseHsl };

    if (mode === 'hue') {
      targetHsl.h = srcHsl.h;
    } else if (mode === 'saturation') {
      targetHsl.s = srcHsl.s;
    } else if (mode === 'color') {
      targetHsl.h = srcHsl.h;
      targetHsl.s = srcHsl.s;
    } else if (mode === 'luminosity') {
      targetHsl.l = srcHsl.l;
    }

    const rgbResult = hslToRgb(targetHsl.h, targetHsl.s, targetHsl.l);
    r = rgbResult.r / 255;
    g = rgbResult.g / 255;
    b = rgbResult.b / 255;
  } else {
    r = blendChannel(bRn, sRn);
    g = blendChannel(bGn, sGn);
    b = blendChannel(bBn, sBn);
  }

  // Alpha compositing (Porter-Duff Over)
  const topA = sa / 255;
  const botA = ba / 255;
  const outA = topA + botA * (1 - topA);

  if (outA === 0) return [0, 0, 0, 0];

  const outR = Math.round(((r * topA + bRn * botA * (1 - topA)) / outA) * 255);
  const outG = Math.round(((g * topA + bGn * botA * (1 - topA)) / outA) * 255);
  const outB = Math.round(((b * topA + bBn * botA * (1 - topA)) / outA) * 255);

  return [
    Math.max(0, Math.min(255, outR)),
    Math.max(0, Math.min(255, outG)),
    Math.max(0, Math.min(255, outB)),
    Math.round(outA * 255)
  ];
}

/**
 * Returns the equivalent CanvasRenderingContext2D globalCompositeOperation
 * when directly supported by the browser GPU for instant compositing
 */
export function getCanvasCompositeOperation(mode: BlendMode): GlobalCompositeOperation {
  switch (mode) {
    case 'multiply': return 'multiply';
    case 'screen': return 'screen';
    case 'overlay': return 'overlay';
    case 'darken': return 'darken';
    case 'lighten': return 'lighten';
    case 'color-dodge': return 'color-dodge';
    case 'color-burn': return 'color-burn';
    case 'hard-light': return 'hard-light';
    case 'soft-light': return 'soft-light';
    case 'difference': return 'difference';
    case 'exclusion': return 'exclusion';
    case 'hue': return 'hue';
    case 'saturation': return 'saturation';
    case 'color': return 'color';
    case 'luminosity': return 'luminosity';
    default: return 'source-over';
  }
}
