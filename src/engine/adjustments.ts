/**
 * Adjustment Engine for G-Pro Photo Editor
 * 100% Non-AI Mathematical Image Processing Algorithms
 */

import {
  BasicAdjustments,
  CurvesAdjustment,
  LevelsAdjustment,
  HSLAdjustment,
  SelectiveColorAdjustment,
  ColorBalanceAdjustment,
  BlackAndWhiteAdjustment,
  ColorGradingAdjustment,
  CurvePoint,
} from '../types';
import { rgbToHsl, hslToRgb, getLuminance, getHSLBandWeight } from '../utils/color';

/**
 * Natural Cubic Spline Interpolation for Curves
 */
export function buildCurveLut(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by x coordinate
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Ensure 0 and 255 boundaries
  if (sorted[0].x > 0) {
    sorted.unshift({ x: 0, y: sorted[0].y });
  }
  if (sorted[sorted.length - 1].x < 255) {
    sorted.push({ x: 255, y: sorted[sorted.length - 1].y });
  }

  const n = sorted.length;
  const x = sorted.map((p) => p.x);
  const y = sorted.map((p) => p.y);

  // Monotone cubic spline interpolation to prevent overshoot
  const d: number[] = new Array(n).fill(0);
  const m: number[] = new Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    const dx = x[i + 1] - x[i];
    m[i] = dx === 0 ? 0 : (y[i + 1] - y[i]) / dx;
  }

  d[0] = m[0];
  d[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      d[i] = 0;
    } else {
      d[i] = (m[i - 1] + m[i]) / 2;
    }
  }

  for (let i = 0; i < 256; i++) {
    // Find segment
    let seg = 0;
    while (seg < n - 2 && i > x[seg + 1]) {
      seg++;
    }

    const x0 = x[seg];
    const x1 = x[seg + 1];
    const y0 = y[seg];
    const y1 = y[seg + 1];
    const dx = Math.max(1, x1 - x0);
    const t = (i - x0) / dx;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const val = h00 * y0 + h10 * dx * d[seg] + h01 * y1 + h11 * dx * d[seg + 1];
    lut[i] = Math.max(0, Math.min(255, Math.round(val)));
  }

  return lut;
}

/**
 * Build Levels LUT
 */
export function buildLevelsLut(
  blackPoint: number,
  gamma: number,
  whitePoint: number,
  outBlack: number,
  outWhite: number
): Uint8Array {
  const lut = new Uint8Array(256);
  const inRange = Math.max(1, whitePoint - blackPoint);
  const outRange = outWhite - outBlack;
  const safeGamma = Math.max(0.1, Math.min(9.9, gamma));

  for (let i = 0; i < 256; i++) {
    // 1. Input range normalization
    let normalized = (i - blackPoint) / inRange;
    normalized = Math.max(0, Math.min(1, normalized));

    // 2. Gamma correction
    const corrected = Math.pow(normalized, 1 / safeGamma);

    // 3. Output range mapping
    const mapped = outBlack + corrected * outRange;
    lut[i] = Math.max(0, Math.min(255, Math.round(mapped)));
  }

  return lut;
}

/**
 * Apply Basic Adjustments to ImageData
 */
export function applyBasicAdjustments(data: Uint8ClampedArray, adj: BasicAdjustments, width: number, height: number) {
  const expFactor = Math.pow(2, adj.exposure || 0);
  const brightVal = (adj.brightness || 0) * 1.2;
  const contrastFactor = ((adj.contrast || 0) + 100) / 100;
  const hlFactor = (adj.highlights || 0) / 100;
  const shFactor = (adj.shadows || 0) / 100;
  const wFactor = (adj.whites || 0) / 100;
  const bFactor = (adj.blacks || 0) / 100;

  const tempVal = (adj.temperature || 0) / 100;
  const tintVal = (adj.tint || 0) / 100;
  const satFactor = ((adj.saturation || 0) + 100) / 100;
  const vibFactor = (adj.vibrance || 0) / 100;
  const hueShift = adj.hue || 0;

  const hasLight = adj.exposure !== 0 || adj.brightness !== 0 || adj.contrast !== 0 ||
                   adj.highlights !== 0 || adj.shadows !== 0 || adj.whites !== 0 || adj.blacks !== 0;
  const hasColor = adj.temperature !== 0 || adj.tint !== 0 || adj.saturation !== 0 || adj.vibrance !== 0 || hueShift !== 0;
  const hasFade = (adj.fade || 0) > 0;
  const fadeAmount = (adj.fade || 0) / 100;

  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    if (adj.exposure !== 0) {
      r *= expFactor;
      g *= expFactor;
      b *= expFactor;
    }

    // 2. Highlights, Shadows, Whites, Blacks Tone Mapping
    if (hasLight) {
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      
      // Shadows (lift/crush low end)
      if (shFactor !== 0) {
        const shadowWeight = Math.pow(1 - lum, 2);
        const shadowDelta = shFactor * shadowWeight * 80;
        r += shadowDelta;
        g += shadowDelta;
        b += shadowDelta;
      }

      // Highlights (recover/boost high end)
      if (hlFactor !== 0) {
        const hlWeight = Math.pow(lum, 2);
        const hlDelta = hlFactor * hlWeight * 80;
        r += hlDelta;
        g += hlDelta;
        b += hlDelta;
      }

      // Whites
      if (wFactor !== 0 && lum > 0.6) {
        const wWeight = (lum - 0.6) / 0.4;
        r += wFactor * wWeight * 50;
        g += wFactor * wWeight * 50;
        b += wFactor * wWeight * 50;
      }

      // Blacks
      if (bFactor !== 0 && lum < 0.4) {
        const bWeight = (0.4 - lum) / 0.4;
        r += bFactor * bWeight * 50;
        g += bFactor * bWeight * 50;
        b += bFactor * bWeight * 50;
      }

      // Brightness & Contrast
      if (brightVal !== 0) {
        r += brightVal;
        g += brightVal;
        b += brightVal;
      }

      if (contrastFactor !== 1) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }
    }

    // 3. White Balance: Temperature & Tint
    if (tempVal !== 0 || tintVal !== 0) {
      // Temperature: warm adds red/yellow, cool adds blue
      r += tempVal * 35;
      b -= tempVal * 35;

      // Tint: green vs magenta
      g -= tintVal * 30;
      r += tintVal * 15;
      b += tintVal * 15;
    }

    // 4. Color: Saturation, Vibrance, Hue
    if (hasColor) {
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      const hsl = rgbToHsl(r, g, b);

      if (hueShift !== 0) {
        hsl.h = (hsl.h + hueShift + 360) % 360;
      }

      if (satFactor !== 1) {
        hsl.s = Math.max(0, Math.min(100, hsl.s * satFactor));
      }

      if (vibFactor !== 0) {
        // Boost less-saturated colors more, protecting highly saturated ones
        const vibWeight = (1 - (hsl.s / 100)) * (1 - (hsl.s / 100));
        hsl.s = Math.max(0, Math.min(100, hsl.s + vibFactor * vibWeight * 60));
      }

      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }

    // 5. Film Fade (Lift blacks, compress whites)
    if (hasFade) {
      r = r * (1 - fadeAmount * 0.25) + fadeAmount * 35;
      g = g * (1 - fadeAmount * 0.25) + fadeAmount * 35;
      b = b * (1 - fadeAmount * 0.25) + fadeAmount * 35;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  // 6. Vignette
  if (adj.vignette && adj.vignette !== 0) {
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const vigStrength = adj.vignette / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
        const factor = Math.cos(Math.min(Math.PI / 2, dist * Math.PI * 0.8));

        if (vigStrength < 0) {
          // Dark vignette
          const darkMul = 1 - Math.abs(vigStrength) * (1 - factor);
          data[idx] = Math.max(0, Math.min(255, Math.round(data[idx] * darkMul)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round(data[idx + 1] * darkMul)));
          data[idx + 2] = Math.max(0, Math.min(255, Math.round(data[idx + 2] * darkMul)));
        } else {
          // White vignette
          const whiteAdd = vigStrength * (1 - factor) * 255;
          data[idx] = Math.max(0, Math.min(255, Math.round(data[idx] + whiteAdd)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round(data[idx + 1] + whiteAdd)));
          data[idx + 2] = Math.max(0, Math.min(255, Math.round(data[idx + 2] + whiteAdd)));
        }
      }
    }
  }

  // 7. Grain
  if (adj.grain && adj.grain > 0) {
    const grainAmount = (adj.grain / 100) * 40;
    for (let i = 0; i < len; i += 4) {
      if (data[i + 3] === 0) continue;
      const noise = (Math.random() - 0.5) * grainAmount;
      data[i] = Math.max(0, Math.min(255, Math.round(data[i] + noise)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] + noise)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] + noise)));
    }
  }
}

/**
 * Apply Curves Adjustment to ImageData
 */
export function applyCurves(data: Uint8ClampedArray, curves: CurvesAdjustment) {
  const masterLut = buildCurveLut(curves.rgb);
  const redLut = buildCurveLut(curves.red);
  const greenLut = buildCurveLut(curves.green);
  const blueLut = buildCurveLut(curves.blue);

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    // Master curve then channel curves
    const r = masterLut[data[i]];
    const g = masterLut[data[i + 1]];
    const b = masterLut[data[i + 2]];

    data[i] = redLut[r];
    data[i + 1] = greenLut[g];
    data[i + 2] = blueLut[b];
  }
}

/**
 * Apply Levels Adjustment to ImageData
 */
export function applyLevels(data: Uint8ClampedArray, levels: LevelsAdjustment) {
  const masterLut = buildLevelsLut(
    levels.rgb.blackPoint,
    levels.rgb.gamma,
    levels.rgb.whitePoint,
    levels.rgb.outputBlack,
    levels.rgb.outputWhite
  );
  const redLut = buildLevelsLut(
    levels.red.blackPoint,
    levels.red.gamma,
    levels.red.whitePoint,
    levels.red.outputBlack,
    levels.red.outputWhite
  );
  const greenLut = buildLevelsLut(
    levels.green.blackPoint,
    levels.green.gamma,
    levels.green.whitePoint,
    levels.green.outputBlack,
    levels.green.outputWhite
  );
  const blueLut = buildLevelsLut(
    levels.blue.blackPoint,
    levels.blue.gamma,
    levels.blue.whitePoint,
    levels.blue.outputBlack,
    levels.blue.outputWhite
  );

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = masterLut[data[i]];
    const g = masterLut[data[i + 1]];
    const b = masterLut[data[i + 2]];

    data[i] = redLut[r];
    data[i + 1] = greenLut[g];
    data[i + 2] = blueLut[b];
  }
}

/**
 * Apply 8-Band HSL Adjustment
 */
export function applyHSL(data: Uint8ClampedArray, hslAdj: HSLAdjustment) {
  const bands = [
    { targetHue: 0, band: hslAdj.red },
    { targetHue: 30, band: hslAdj.orange },
    { targetHue: 60, band: hslAdj.yellow },
    { targetHue: 120, band: hslAdj.green },
    { targetHue: 180, band: hslAdj.aqua },
    { targetHue: 240, band: hslAdj.blue },
    { targetHue: 280, band: hslAdj.purple },
    { targetHue: 320, band: hslAdj.magenta },
  ];

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const hsl = rgbToHsl(r, g, b);
    if (hsl.s === 0) continue;

    let deltaH = 0;
    let deltaS = 0;
    let deltaL = 0;

    for (const { targetHue, band } of bands) {
      const weight = getHSLBandWeight(hsl.h, targetHue, 35);
      if (weight > 0) {
        deltaH += band.hue * weight;
        deltaS += band.saturation * weight;
        deltaL += band.lightness * weight;
      }
    }

    if (deltaH !== 0 || deltaS !== 0 || deltaL !== 0) {
      const newH = (hsl.h + deltaH + 360) % 360;
      const newS = Math.max(0, Math.min(100, hsl.s + deltaS));
      const newL = Math.max(0, Math.min(100, hsl.l + deltaL));

      const newRgb = hslToRgb(newH, newS, newL);
      data[i] = newRgb.r;
      data[i + 1] = newRgb.g;
      data[i + 2] = newRgb.b;
    }
  }
}

/**
 * Apply 3-Way Color Grading (Shadows, Midtones, Highlights, Global)
 */
export function applyColorGrading(data: Uint8ClampedArray, grade: ColorGradingAdjustment) {
  const shadowColor = hslToRgb(grade.shadows.hue, grade.shadows.saturation, 50);
  const midColor = hslToRgb(grade.midtones.hue, grade.midtones.saturation, 50);
  const hlColor = hslToRgb(grade.highlights.hue, grade.highlights.saturation, 50);
  const globalColor = hslToRgb(grade.global.hue, grade.global.saturation, 50);

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Weights
    const shadowWeight = Math.pow(Math.max(0, 1 - lum * 2), 1.5) * (grade.shadows.saturation / 100);
    const hlWeight = Math.pow(Math.max(0, (lum - 0.5) * 2), 1.5) * (grade.highlights.saturation / 100);
    const midWeight = (1 - shadowWeight - hlWeight) * (grade.midtones.saturation / 100);
    const globalWeight = (grade.global.saturation / 100) * 0.6;

    if (shadowWeight > 0) {
      r += (shadowColor.r - 128) * shadowWeight * 0.8 + grade.shadows.luminance * 0.4;
      g += (shadowColor.g - 128) * shadowWeight * 0.8 + grade.shadows.luminance * 0.4;
      b += (shadowColor.b - 128) * shadowWeight * 0.8 + grade.shadows.luminance * 0.4;
    }

    if (midWeight > 0) {
      r += (midColor.r - 128) * midWeight * 0.8 + grade.midtones.luminance * 0.4;
      g += (midColor.g - 128) * midWeight * 0.8 + grade.midtones.luminance * 0.4;
      b += (midColor.b - 128) * midWeight * 0.8 + grade.midtones.luminance * 0.4;
    }

    if (hlWeight > 0) {
      r += (hlColor.r - 128) * hlWeight * 0.8 + grade.highlights.luminance * 0.4;
      g += (hlColor.g - 128) * hlWeight * 0.8 + grade.highlights.luminance * 0.4;
      b += (hlColor.b - 128) * hlWeight * 0.8 + grade.highlights.luminance * 0.4;
    }

    if (globalWeight > 0) {
      r += (globalColor.r - 128) * globalWeight * 0.6 + grade.global.luminance * 0.3;
      g += (globalColor.g - 128) * globalWeight * 0.6 + grade.global.luminance * 0.3;
      b += (globalColor.b - 128) * globalWeight * 0.6 + grade.global.luminance * 0.3;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }
}

/**
 * Apply Black & White / Monochrome conversion
 */
export function applyBlackAndWhite(data: Uint8ClampedArray, bw: BlackAndWhiteAdjustment) {
  const totalWeight =
    (bw.reds || 40) +
    (bw.oranges || 60) +
    (bw.yellows || 80) +
    (bw.greens || 40) +
    (bw.cyans || 60) +
    (bw.blues || 20) +
    (bw.purples || 40) +
    (bw.magentas || 60);

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const hsl = rgbToHsl(r, g, b);
    
    // Channel mixing
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let mixed = lum;

    if (hsl.s > 5) {
      const redW = getHSLBandWeight(hsl.h, 0, 30) * ((bw.reds || 40) / 100);
      const orangeW = getHSLBandWeight(hsl.h, 30, 30) * ((bw.oranges || 60) / 100);
      const yellowW = getHSLBandWeight(hsl.h, 60, 30) * ((bw.yellows || 80) / 100);
      const greenW = getHSLBandWeight(hsl.h, 120, 30) * ((bw.greens || 40) / 100);
      const cyanW = getHSLBandWeight(hsl.h, 180, 30) * ((bw.cyans || 60) / 100);
      const blueW = getHSLBandWeight(hsl.h, 240, 30) * ((bw.blues || 20) / 100);
      const purpleW = getHSLBandWeight(hsl.h, 280, 30) * ((bw.purples || 40) / 100);
      const magentaW = getHSLBandWeight(hsl.h, 320, 30) * ((bw.magentas || 60) / 100);

      const colorFactor = redW + orangeW + yellowW + greenW + cyanW + blueW + purpleW + magentaW;
      if (colorFactor > 0) {
        mixed = lum * (1 + colorFactor * 0.5);
      }
    }

    let outR = mixed;
    let outG = mixed;
    let outB = mixed;

    // Tint
    if (bw.tintColor && bw.tintAmount > 0) {
      const tintRgb = hslToRgb(35, 60, 50); // Sepia warm default or custom tint
      const t = bw.tintAmount / 100;
      outR = outR * (1 - t) + (outR * tintRgb.r / 128) * t;
      outG = outG * (1 - t) + (outG * tintRgb.g / 128) * t;
      outB = outB * (1 - t) + (outB * tintRgb.b / 128) * t;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(outR)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(outG)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(outB)));
  }
}

/**
 * 100% Non-AI Auto Levels: Independent channel histogram stretch
 */
export function applyAutoLevels(data: Uint8ClampedArray) {
  const rHist = new Uint32Array(256);
  const gHist = new Uint32Array(256);
  const bHist = new Uint32Array(256);
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    rHist[data[i]]++;
    gHist[data[i + 1]]++;
    bHist[data[i + 2]]++;
    totalPixels++;
  }

  if (totalPixels === 0) return;

  const clipLow = totalPixels * 0.005;
  const clipHigh = totalPixels * 0.995;

  const findBounds = (hist: Uint32Array) => {
    let acc = 0, low = 0, high = 255;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= clipLow) { low = i; break; }
    }
    acc = 0;
    for (let i = 255; i >= 0; i--) {
      acc += hist[i];
      if (acc >= totalPixels - clipHigh) { high = i; break; }
    }
    return { low, high: Math.max(low + 1, high) };
  };

  const rB = findBounds(rHist);
  const gB = findBounds(gHist);
  const bB = findBounds(bHist);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.max(0, Math.min(255, Math.round(((data[i] - rB.low) / (rB.high - rB.low)) * 255)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(((data[i + 1] - gB.low) / (gB.high - gB.low)) * 255)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(((data[i + 2] - bB.low) / (bB.high - bB.low)) * 255)));
  }
}

/**
 * 100% Non-AI Auto Contrast: Uniform composite luminance histogram stretch
 */
export function applyAutoContrast(data: Uint8ClampedArray) {
  const lumHist = new Uint32Array(256);
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    lumHist[lum]++;
    totalPixels++;
  }

  if (totalPixels === 0) return;

  const clipLow = totalPixels * 0.005;
  const clipHigh = totalPixels * 0.995;

  let acc = 0, low = 0, high = 255;
  for (let i = 0; i < 256; i++) {
    acc += lumHist[i];
    if (acc >= clipLow) { low = i; break; }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += lumHist[i];
    if (acc >= totalPixels - clipHigh) { high = i; break; }
  }
  high = Math.max(low + 1, high);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.max(0, Math.min(255, Math.round(((data[i] - low) / (high - low)) * 255)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(((data[i + 1] - low) / (high - low)) * 255)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(((data[i + 2] - low) / (high - low)) * 255)));
  }
}

/**
 * 100% Non-AI Auto Color: Neutralizes color casts across darks, midtones, and highlights
 */
export function applyAutoColor(data: Uint8ClampedArray) {
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
    count++;
  }

  if (count === 0) return;

  const avgR = sumR / count;
  const avgG = sumG / count;
  const avgB = sumB / count;
  const avgGray = (avgR + avgG + avgB) / 3;

  const rFactor = avgGray / Math.max(1, avgR);
  const gFactor = avgGray / Math.max(1, avgG);
  const bFactor = avgGray / Math.max(1, avgB);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.max(0, Math.min(255, Math.round(data[i] * rFactor)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] * gFactor)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] * bFactor)));
  }
}
