/**
 * Selection Engine for G-Pro
 * Magic Wand, Lassos, Marquees, Color Range, and Morphological Operations
 */

import { Point, SelectionState } from '../types';
import { colorDistance } from '../utils/color';

export function createEmptySelectionMask(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

/**
 * Rectangular Marquee Mask
 */
export function createRectSelection(
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  feather: number = 0
): HTMLCanvasElement {
  const canvas = createEmptySelectionMask(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';

  const rx = Math.max(0, Math.min(x, x + w));
  const ry = Math.max(0, Math.min(y, y + h));
  const rw = Math.abs(w);
  const rh = Math.abs(h);

  ctx.fillRect(rx, ry, rw, rh);

  if (feather > 0) {
    applyFeatherToMask(canvas, feather);
  }
  return canvas;
}

/**
 * Elliptical Marquee Mask
 */
export function createEllipseSelection(
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  feather: number = 0
): HTMLCanvasElement {
  const canvas = createEmptySelectionMask(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';

  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = Math.abs(w / 2);
  const ry = Math.abs(h / 2);

  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.fill();

  if (feather > 0) {
    applyFeatherToMask(canvas, feather);
  }
  return canvas;
}

/**
 * Polygon / Freehand Lasso Mask
 */
export function createPolygonSelection(
  width: number,
  height: number,
  points: Point[],
  feather: number = 0
): HTMLCanvasElement {
  const canvas = createEmptySelectionMask(width, height);
  if (points.length < 3) return canvas;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  if (feather > 0) {
    applyFeatherToMask(canvas, feather);
  }
  return canvas;
}

/**
 * Magic Wand Flood Fill Selection
 */
export function createMagicWandSelection(
  sourceCanvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  tolerance: number = 32,
  contiguous: boolean = true
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const maskCanvas = createEmptySelectionMask(width, height);

  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, width, height).data;

  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImg = maskCtx.getImageData(0, 0, width, height);
  const maskData = maskImg.data;

  const sx = Math.max(0, Math.min(width - 1, Math.round(startX)));
  const sy = Math.max(0, Math.min(height - 1, Math.round(startY)));
  const seedIdx = (sy * width + sx) * 4;

  const targetR = srcData[seedIdx];
  const targetG = srcData[seedIdx + 1];
  const targetB = srcData[seedIdx + 2];

  if (!contiguous) {
    // Global color range selection
    for (let i = 0; i < srcData.length; i += 4) {
      const d = colorDistance(srcData[i], srcData[i + 1], srcData[i + 2], targetR, targetG, targetB);
      if (d <= tolerance) {
        maskData[i] = 255;
        maskData[i + 1] = 255;
        maskData[i + 2] = 255;
        maskData[i + 3] = 255;
      }
    }
  } else {
    // 4-way breadth-first flood fill
    const visited = new Uint8Array(width * height);
    const queue: number[] = [sx + sy * width];
    visited[sx + sy * width] = 1;

    while (queue.length > 0) {
      const pos = queue.pop()!;
      const px = pos % width;
      const py = Math.floor(pos / width);
      const idx = pos * 4;

      maskData[idx] = 255;
      maskData[idx + 1] = 255;
      maskData[idx + 2] = 255;
      maskData[idx + 3] = 255;

      const neighbors = [
        [px + 1, py],
        [px - 1, py],
        [px, py + 1],
        [px, py - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nPos = nx + ny * width;
          if (!visited[nPos]) {
            visited[nPos] = 1;
            const nIdx = nPos * 4;
            const dist = colorDistance(
              srcData[nIdx],
              srcData[nIdx + 1],
              srcData[nIdx + 2],
              targetR,
              targetG,
              targetB
            );
            if (dist <= tolerance) {
              queue.push(nPos);
            }
          }
        }
      }
    }
  }

  maskCtx.putImageData(maskImg, 0, 0);
  return maskCanvas;
}

/**
 * Feathering via Gaussian blur on selection mask
 */
export function applyFeatherToMask(maskCanvas: HTMLCanvasElement, radius: number) {
  const ctx = maskCanvas.getContext('2d')!;
  const img = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const data = img.data;

  // Simple box-blur approximation for feathering mask
  const w = maskCanvas.width;
  const h = maskCanvas.height;
  const r = Math.min(30, Math.max(1, Math.round(radius)));

  const temp = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    temp[i / 4] = data[i];
  }

  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -r; dy <= r; dy += 2) {
        for (let dx = -r; dx <= r; dx += 2) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            sum += temp[ny * w + nx];
            count++;
          }
        }
      }
      out[y * w + x] = Math.round(sum / count);
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const val = out[i / 4];
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = val > 0 ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Clear Selection Mask
 */
export function clearSelectionMask(maskCanvas: HTMLCanvasElement) {
  const ctx = maskCanvas.getContext('2d')!;
  ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
}

/**
 * Invert Selection Mask
 */
export function invertSelectionMask(maskCanvas: HTMLCanvasElement) {
  const ctx = maskCanvas.getContext('2d')!;
  const img = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const inv = 255 - data[i];
    data[i] = inv;
    data[i + 1] = inv;
    data[i + 2] = inv;
    data[i + 3] = inv > 0 ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
}
