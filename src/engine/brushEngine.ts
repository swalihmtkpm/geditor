/**
 * Professional Brush Engine for G-Pro
 * Interpolated dabs, hardness falloff, spacing, scatter, and flow
 */

import { BrushSettings, Point } from '../types';

export function renderBrushDab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  settings: BrushSettings,
  pressure: number = 1.0
) {
  const effectiveSize = settings.pressureSensitivity
    ? Math.max(1, settings.size * pressure)
    : settings.size;
  const radius = effectiveSize / 2;

  let dabX = x;
  let dabY = y;

  // Scatter & Jitter
  if (settings.scatter > 0) {
    const maxScatter = (settings.scatter / 100) * effectiveSize * 1.5;
    dabX += (Math.random() - 0.5) * maxScatter;
    dabY += (Math.random() - 0.5) * maxScatter;
  }

  const alpha = (settings.opacity / 100) * (settings.flow / 100);

  ctx.save();
  ctx.translate(dabX, dabY);

  if (settings.angle > 0) {
    ctx.rotate((settings.angle * Math.PI) / 180);
  }

  if (settings.roundness < 100) {
    ctx.scale(1, settings.roundness / 100);
  }

  if (settings.hardness >= 99) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
  } else {
    // Soft radial gradient dab
    const grad = ctx.createRadialGradient(0, 0, radius * (settings.hardness / 100), 0, 0, radius);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Interpolates dabs along a line between previous point and current point based on brush spacing
 */
export function strokeBrushLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  settings: BrushSettings,
  pressure: number = 1.0
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const step = Math.max(1, (settings.size * (settings.spacing / 100)));
  const count = Math.max(1, Math.floor(dist / step));

  for (let i = 0; i <= count; i++) {
    const t = count === 0 ? 0 : i / count;
    const curX = p1.x + dx * t;
    const curY = p1.y + dy * t;
    renderBrushDab(ctx, curX, curY, color, settings, pressure);
  }
}
