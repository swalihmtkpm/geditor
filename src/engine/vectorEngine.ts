/**
 * Vector Path & Shape Engine for G-Pro
 * Pen tool Bezier paths, geometric shapes, strokes, and rasterization
 */

import { Layer, VectorPath, VectorPathNode, Point } from '../types';

export function renderVectorShape(
  ctx: CanvasRenderingContext2D,
  layer: Layer
) {
  const { width, height, shapeType, fillColor, strokeColor, strokeWidth, strokeDash, cornerRadius, polygonSides, starPoints, starInnerRadius, customPath } = layer;

  ctx.save();
  ctx.beginPath();

  if (shapeType === 'rect') {
    ctx.rect(0, 0, width, height);
  } else if (shapeType === 'rounded-rect') {
    const r = Math.min(cornerRadius || 16, Math.min(width, height) / 2);
    ctx.roundRect(0, 0, width, height, r);
  } else if (shapeType === 'circle' || shapeType === 'ellipse') {
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shapeType === 'polygon') {
    const sides = Math.max(3, polygonSides || 5);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy);

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shapeType === 'star') {
    const points = Math.max(3, starPoints || 5);
    const cx = width / 2;
    const cy = height / 2;
    const outerR = Math.min(cx, cy);
    const innerR = outerR * (starInnerRadius || 0.45);

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shapeType === 'line') {
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
  } else if (shapeType === 'arrow') {
    const arrowHeadSize = Math.min(20, width * 0.25);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width - arrowHeadSize, height / 2);
    ctx.moveTo(width - arrowHeadSize, height / 2 - arrowHeadSize / 2);
    ctx.lineTo(width, height / 2);
    ctx.lineTo(width - arrowHeadSize, height / 2 + arrowHeadSize / 2);
  } else if (shapeType === 'custom-path' && customPath && customPath.nodes.length > 0) {
    drawBezierPath(ctx, customPath);
  }

  // Fill
  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Stroke
  if (strokeColor && strokeColor !== 'transparent' && strokeWidth && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (strokeDash && strokeDash.length > 0) {
      ctx.setLineDash(strokeDash);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw Bezier curve path from nodes
 */
export function drawBezierPath(ctx: CanvasRenderingContext2D, path: VectorPath) {
  const nodes = path.nodes;
  if (nodes.length === 0) return;

  ctx.moveTo(nodes[0].x, nodes[0].y);

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];

    const cp1 = curr.handleOut || curr;
    const cp2 = next.handleIn || next;

    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
  }

  if (path.closed && nodes.length > 2) {
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    const cp1 = last.handleOut || last;
    const cp2 = first.handleIn || first;
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, first.x, first.y);
    ctx.closePath();
  }
}
