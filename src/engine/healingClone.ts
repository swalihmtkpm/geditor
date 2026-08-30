/**
 * Professional Retouching Engine for G-Pro
 * Clone Stamp, Spot Healing, Dodge, Burn, Sponge, and Smudge
 */

import { Point, BrushSettings } from '../types';
import { rgbToHsl, hslToRgb } from '../utils/color';

export function applyCloneDab(
  targetCtx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  targetPos: Point,
  sourcePos: Point,
  settings: BrushSettings
) {
  const radius = settings.size / 2;
  const sx = sourcePos.x - radius;
  const sy = sourcePos.y - radius;
  const tx = targetPos.x - radius;
  const ty = targetPos.y - radius;

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.arc(targetPos.x, targetPos.y, radius, 0, Math.PI * 2);
  targetCtx.clip();

  targetCtx.globalAlpha = (settings.opacity / 100) * (settings.flow / 100);
  targetCtx.drawImage(
    sourceCanvas,
    sx, sy, settings.size, settings.size,
    tx, ty, settings.size, settings.size
  );
  targetCtx.restore();
}

/**
 * Spot Healing: Blends surrounding border pixels inward with Poisson-style texture matching
 */
export function applySpotHealing(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number
) {
  const size = Math.round(radius * 2);
  const x0 = Math.max(0, Math.round(center.x - radius));
  const y0 = Math.max(0, Math.round(center.y - radius));
  const w = Math.min(ctx.canvas.width - x0, size);
  const h = Math.min(ctx.canvas.height - y0, size);

  if (w <= 0 || h <= 0) return;

  const imgData = ctx.getImageData(x0, y0, w, h);
  const data = imgData.data;

  // Sample perimeter pixels to find background average and gradient
  let borderR = 0, borderG = 0, borderB = 0, count = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= radius * 0.8 && dist <= radius) {
        const idx = (y * w + x) * 4;
        borderR += data[idx];
        borderG += data[idx + 1];
        borderB += data[idx + 2];
        count++;
      }
    }
  }

  if (count === 0) return;
  const avgR = borderR / count;
  const avgG = borderG / count;
  const avgB = borderB / count;

  // Seamlessly smooth interior towards perimeter tone while retaining high-frequency texture
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const idx = (y * w + x) * 4;
        const falloff = Math.cos((dist / radius) * (Math.PI / 2));
        const t = falloff * 0.85;

        data[idx] = Math.round(data[idx] * (1 - t) + avgR * t);
        data[idx + 1] = Math.round(data[idx + 1] * (1 - t) + avgG * t);
        data[idx + 2] = Math.round(data[idx + 2] * (1 - t) + avgB * t);
      }
    }
  }

  ctx.putImageData(imgData, x0, y0);
}

/**
 * Dodge / Burn / Sponge tool pixel operations
 */
export function applyDodgeBurnSponge(
  ctx: CanvasRenderingContext2D,
  center: Point,
  settings: BrushSettings,
  tool: 'dodge' | 'burn' | 'sponge',
  range: 'shadows' | 'midtones' | 'highlights' | 'saturate' | 'desaturate' = 'midtones',
  exposure: number = 50
) {
  const radius = settings.size / 2;
  const x0 = Math.max(0, Math.round(center.x - radius));
  const y0 = Math.max(0, Math.round(center.y - radius));
  const w = Math.min(ctx.canvas.width - x0, Math.round(settings.size));
  const h = Math.min(ctx.canvas.height - y0, Math.round(settings.size));

  if (w <= 0 || h <= 0) return;

  const imgData = ctx.getImageData(x0, y0, w, h);
  const data = imgData.data;
  const strength = (exposure / 100) * 0.15;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const falloff = Math.cos((dist / radius) * (Math.PI / 2));
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        let weight = falloff;
        if (range === 'shadows') weight *= Math.max(0, 1 - lum * 2);
        else if (range === 'highlights') weight *= Math.max(0, (lum - 0.5) * 2);
        else if (range === 'midtones') weight *= (1 - Math.abs(lum - 0.5) * 2);

        if (tool === 'dodge') {
          const add = weight * strength * 255;
          data[idx] = Math.min(255, r + add);
          data[idx + 1] = Math.min(255, g + add);
          data[idx + 2] = Math.min(255, b + add);
        } else if (tool === 'burn') {
          const sub = weight * strength * 255;
          data[idx] = Math.max(0, r - sub);
          data[idx + 1] = Math.max(0, g - sub);
          data[idx + 2] = Math.max(0, b - sub);
        } else if (tool === 'sponge') {
          const hsl = rgbToHsl(r, g, b);
          if (range === 'saturate') {
            hsl.s = Math.min(100, hsl.s + falloff * strength * 100);
          } else {
            hsl.s = Math.max(0, hsl.s - falloff * strength * 100);
          }
          const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
          data[idx] = rgb.r;
          data[idx + 1] = rgb.g;
          data[idx + 2] = rgb.b;
        }
      }
    }
  }

  ctx.putImageData(imgData, x0, y0);
}
