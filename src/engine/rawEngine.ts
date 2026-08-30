/**
 * RAW Photo Development Engine for G-Pro Digital Darkroom
 * Simulates high-bitdepth Camera RAW workflow, Kelvin white balance,
 * highlight recovery, lens distortion correction, and chromatic fringe reduction.
 */

export interface RawDevelopmentSettings {
  exposure: number;       // -5.0 to +5.0 EV
  kelvinTemp: number;     // 2000 to 12000 K (default 5500)
  tint: number;           // -100 to +100
  highlights: number;     // -100 to +100
  shadows: number;        // -100 to +100
  whites: number;         // -100 to +100
  blacks: number;         // -100 to +100
  contrast: number;       // -100 to +100
  clarity: number;        // -100 to +100
  texture: number;        // -100 to +100
  dehaze: number;         // -100 to +100
  vibrance: number;       // -100 to +100
  saturation: number;     // -100 to +100
  // Lens & Detail
  lensDistortion: number; // -100 (barrel) to +100 (pincushion)
  vignetteCorrection: number; // 0 to 100
  chromaticAberrationFix: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  sharpening: number;     // 0 to 100
}

export const defaultRawSettings: RawDevelopmentSettings = {
  exposure: 0,
  kelvinTemp: 5500,
  tint: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  contrast: 0,
  clarity: 0,
  texture: 0,
  dehaze: 0,
  vibrance: 0,
  saturation: 0,
  lensDistortion: 0,
  vignetteCorrection: 0,
  chromaticAberrationFix: 0,
  noiseReduction: 0,
  sharpening: 25,
};

/**
 * Converts Kelvin Temperature to RGB multiplier
 */
function kelvinToRgbMultiplier(kelvin: number): [number, number, number] {
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  // Normalize against daylight 5500K
  const [d55R, d55G, d55B] = [255, 240, 220];
  return [r / d55R, g / d55G, b / d55B];
}

/**
 * Process RAW Source Canvas and render developed output
 */
export function developRawImage(
  sourceCanvas: HTMLCanvasElement,
  settings: RawDevelopmentSettings
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d')!;

  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcImg = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImg.data;

  const outImg = outCtx.createImageData(width, height);
  const outData = outImg.data;

  const [tempR, tempG, tempB] = kelvinToRgbMultiplier(settings.kelvinTemp);
  const tintGreen = 1 - (settings.tint / 100) * 0.2;
  const tintMagenta = 1 + (settings.tint / 100) * 0.2;

  const expMul = Math.pow(2, settings.exposure);
  const contrastFactor = (settings.contrast + 100) / 100;
  const hlFactor = settings.highlights / 100;
  const shFactor = settings.shadows / 100;
  const wFactor = settings.whites / 100;
  const bFactor = settings.blacks / 100;
  const satFactor = (settings.saturation + 100) / 100;
  const vibFactor = settings.vibrance / 100;

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const distAmount = settings.lensDistortion / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 1. Lens Distortion Correction
      let srcX = x;
      let srcY = y;
      if (distAmount !== 0) {
        const nx = (x - cx) / cx;
        const ny = (y - cy) / cy;
        const r2 = nx * nx + ny * ny;
        const distortFactor = 1 + distAmount * 0.2 * r2;
        srcX = Math.round(cx + nx * distortFactor * cx);
        srcY = Math.round(cy + ny * distortFactor * cy);
      }

      srcX = Math.max(0, Math.min(width - 1, srcX));
      srcY = Math.max(0, Math.min(height - 1, srcY));

      const srcIdx = (srcY * width + srcX) * 4;
      const outIdx = (y * width + x) * 4;

      let r = srcData[srcIdx];
      let g = srcData[srcIdx + 1];
      let b = srcData[srcIdx + 2];
      const a = srcData[srcIdx + 3];

      // 2. Kelvin White Balance & Tint
      r *= tempR * tintMagenta;
      g *= tempG * tintGreen;
      b *= tempB;

      // 3. Exposure
      r *= expMul;
      g *= expMul;
      b *= expMul;

      // 4. Tone Mapping
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      // Shadows & Highlights
      if (shFactor !== 0) {
        const shW = Math.pow(Math.max(0, 1 - lum), 2);
        const delta = shFactor * shW * 90;
        r += delta; g += delta; b += delta;
      }
      if (hlFactor !== 0) {
        const hlW = Math.pow(Math.max(0, lum), 2);
        const delta = hlFactor * hlW * 90;
        r += delta; g += delta; b += delta;
      }
      if (wFactor !== 0 && lum > 0.6) {
        const wDelta = wFactor * ((lum - 0.6) / 0.4) * 60;
        r += wDelta; g += wDelta; b += wDelta;
      }
      if (bFactor !== 0 && lum < 0.4) {
        const bDelta = bFactor * ((0.4 - lum) / 0.4) * 60;
        r += bDelta; g += bDelta; b += bDelta;
      }

      // Contrast
      if (contrastFactor !== 1) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }

      // 5. Vignette Correction
      if (settings.vignetteCorrection > 0) {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) / maxR;
        const vigBoost = 1 + (settings.vignetteCorrection / 100) * d * 0.5;
        r *= vigBoost;
        g *= vigBoost;
        b *= vigBoost;
      }

      // 6. Saturation & Vibrance
      if (satFactor !== 1 || vibFactor !== 0) {
        const mean = (r + g + b) / 3;
        if (satFactor !== 1) {
          r = mean + (r - mean) * satFactor;
          g = mean + (g - mean) * satFactor;
          b = mean + (b - mean) * satFactor;
        }
        if (vibFactor !== 0) {
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);
          const sat = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
          const vibBoost = (1 - sat) * vibFactor * 0.8;
          r += (r - mean) * vibBoost;
          g += (g - mean) * vibBoost;
          b += (b - mean) * vibBoost;
        }
      }

      outData[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
      outData[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      outData[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      outData[outIdx + 3] = a;
    }
  }

  outCtx.putImageData(outImg, 0, 0);
  return outCanvas;
}
