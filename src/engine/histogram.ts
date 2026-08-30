/**
 * Real-time Histogram Engine for G-Pro
 * RGB, Luminance, Red, Green, Blue channel histograms and clipping analysis
 */

export interface HistogramData {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  lum: Uint32Array;
  maxCount: number;
  shadowClipping: number; // percentage of crushed shadows
  highlightClipping: number; // percentage of blown highlights
  meanLum: number;
}

export function computeHistogram(canvas: HTMLCanvasElement): HistogramData {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const lum = new Uint32Array(256);

  const ctx = canvas.getContext('2d');
  if (!ctx || canvas.width === 0 || canvas.height === 0) {
    return {
      r, g, b, lum, maxCount: 1, shadowClipping: 0, highlightClipping: 0, meanLum: 128
    };
  }

  // Downsample large canvas for rapid 60fps histogram calculation
  const sampleW = Math.min(canvas.width, 400);
  const sampleH = Math.min(canvas.height, 300);

  const off = document.createElement('canvas');
  off.width = sampleW;
  off.height = sampleH;
  const offCtx = off.getContext('2d')!;
  offCtx.drawImage(canvas, 0, 0, sampleW, sampleH);

  const imgData = offCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;
  const totalPixels = sampleW * sampleH;

  let maxCount = 0;
  let shadowCrushed = 0;
  let highlightBlown = 0;
  let lumSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;

    const rV = data[i];
    const gV = data[i + 1];
    const bV = data[i + 2];
    const lV = Math.round(0.2126 * rV + 0.7152 * gV + 0.0722 * bV);

    r[rV]++;
    g[gV]++;
    b[bV]++;
    lum[lV]++;

    lumSum += lV;

    if (lV <= 2) shadowCrushed++;
    if (lV >= 253) highlightBlown++;

    if (r[rV] > maxCount) maxCount = r[rV];
    if (g[gV] > maxCount) maxCount = g[gV];
    if (b[bV] > maxCount) maxCount = b[bV];
    if (lum[lV] > maxCount) maxCount = lum[lV];
  }

  return {
    r,
    g,
    b,
    lum,
    maxCount: Math.max(1, maxCount),
    shadowClipping: totalPixels > 0 ? (shadowCrushed / totalPixels) * 100 : 0,
    highlightClipping: totalPixels > 0 ? (highlightBlown / totalPixels) * 100 : 0,
    meanLum: totalPixels > 0 ? lumSum / totalPixels : 128,
  };
}
