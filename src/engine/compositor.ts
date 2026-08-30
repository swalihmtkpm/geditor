/**
 * Professional Layer Stack Compositor for G-Pro
 * Composites Pixel layers, Text layers, Shape layers, Adjustment layers,
 * Layer Masks, Clipping Masks, and Layer FX onto the target buffer.
 */

import { Layer, GProDocument } from '../types';
import { getCanvasCompositeOperation } from './blendModes';
import {
  applyBasicAdjustments,
  applyCurves,
  applyLevels,
  applyHSL,
  applyColorGrading,
  applyBlackAndWhite,
} from './adjustments';
import { renderVectorShape } from './vectorEngine';

export function renderDocument(
  doc: GProDocument,
  targetCanvas: HTMLCanvasElement,
  options: { renderGuides?: boolean; renderSelection?: boolean } = {}
) {
  const width = doc.width;
  const height = doc.height;

  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true })!;

  // Clear background
  ctx.clearRect(0, 0, width, height);

  // Filter visible layers
  const visibleLayers = doc.layers.filter((l) => l.visible);

  for (let i = 0; i < visibleLayers.length; i++) {
    const layer = visibleLayers[i];

    // Handle Adjustment Layers
    if (layer.type === 'adjustment') {
      applyAdjustmentLayerToCanvas(ctx, layer, width, height);
      continue;
    }

    // Render normal layer to offscreen buffer
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = width;
    layerCanvas.height = height;
    const lCtx = layerCanvas.getContext('2d', { willReadFrequently: true })!;

    lCtx.save();
    // Transform
    lCtx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    if (layer.rotation !== 0) {
      lCtx.rotate((layer.rotation * Math.PI) / 180);
    }
    if (layer.scaleX !== 1 || layer.scaleY !== 1) {
      lCtx.scale(layer.scaleX || 1, layer.scaleY || 1);
    }
    lCtx.translate(-layer.width / 2, -layer.height / 2);

    // 1. Pixel Layer
    if (layer.type === 'pixel' && layer.canvas) {
      lCtx.drawImage(layer.canvas, 0, 0, layer.width, layer.height);
    }
    // 2. Text Layer
    else if (layer.type === 'text') {
      renderTextLayer(lCtx, layer);
    }
    // 3. Shape Layer
    else if (layer.type === 'shape') {
      renderVectorShape(lCtx, layer);
    }

    lCtx.restore();

    // 4. Apply Layer Effects (Drop Shadow, Stroke, Overlay)
    if (layer.effects) {
      applyLayerEffects(layerCanvas, layer.effects);
    }

    // 5. Apply Layer Mask if present
    if (layer.mask && layer.mask.enabled && layer.mask.canvas) {
      applyMaskToCanvas(layerCanvas, layer.mask.canvas, layer.mask.inverted, layer.mask.density);
    }

    // 6. Handle Clipping Mask
    if (layer.isClippingMask && i > 0) {
      const parentLayer = visibleLayers[i - 1];
      // Clip to parent layer alpha
      lCtx.globalCompositeOperation = 'destination-in';
      if (parentLayer.canvas) {
        lCtx.drawImage(parentLayer.canvas, parentLayer.x, parentLayer.y);
      }
    }

    // Composite layer onto main target buffer
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation = getCanvasCompositeOperation(layer.blendMode);
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();
  }
}

/**
 * Render Text Layer
 */
function renderTextLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  const { text, fontSize = 36, fontFamily = 'Plus Jakarta Sans', fontWeight = '600', fontStyle = 'normal', textColor = '#ffffff', textAlign = 'left', width, height } = layer;

  if (!text) return;

  ctx.save();
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';

  const lines = text.split('\n');
  const lineHeight = layer.lineHeight ? fontSize * (layer.lineHeight / 100) : fontSize * 1.25;

  let startY = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let startX = 0;
    if (textAlign === 'center') startX = width / 2;
    else if (textAlign === 'right') startX = width;

    ctx.textAlign = textAlign;
    ctx.fillText(line, startX, startY);
    startY += lineHeight;
  }

  ctx.restore();
}

/**
 * Apply Adjustment Layer to current composite
 */
function applyAdjustmentLayerToCanvas(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  width: number,
  height: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  if (layer.adjustmentType === 'basic' && layer.basicAdjustments) {
    applyBasicAdjustments(data, layer.basicAdjustments, width, height);
  } else if (layer.adjustmentType === 'curves' && layer.curves) {
    applyCurves(data, layer.curves);
  } else if (layer.adjustmentType === 'levels' && layer.levels) {
    applyLevels(data, layer.levels);
  } else if (layer.adjustmentType === 'hsl' && layer.hsl) {
    applyHSL(data, layer.hsl);
  } else if (layer.adjustmentType === 'color-grading' && layer.colorGrading) {
    applyColorGrading(data, layer.colorGrading);
  } else if (layer.adjustmentType === 'black-and-white' && layer.blackAndWhite) {
    applyBlackAndWhite(data, layer.blackAndWhite);
  } else if (layer.adjustmentType === 'invert') {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  } else if (layer.adjustmentType === 'threshold') {
    const thresh = layer.thresholdValue || 128;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = lum >= thresh ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (layer.adjustmentType === 'posterize') {
    const levels = Math.max(2, layer.posterizeLevels || 4);
    const step = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      data[i] = Math.round(Math.round(data[i] / step) * step);
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    }
  }

  // Put image data back with opacity blend
  if (layer.opacity < 1) {
    const original = ctx.getImageData(0, 0, width, height).data;
    const alpha = layer.opacity;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(original[i] * (1 - alpha) + data[i] * alpha);
      data[i + 1] = Math.round(original[i + 1] * (1 - alpha) + data[i + 1] * alpha);
      data[i + 2] = Math.round(original[i + 2] * (1 - alpha) + data[i + 2] * alpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Apply Grayscale Mask buffer to Layer Canvas
 */
function applyMaskToCanvas(
  layerCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  inverted: boolean,
  density: number = 100
) {
  const lCtx = layerCanvas.getContext('2d')!;
  const lData = lCtx.getImageData(0, 0, layerCanvas.width, layerCanvas.height);
  const mCtx = maskCanvas.getContext('2d')!;
  const mData = mCtx.getImageData(0, 0, Math.min(layerCanvas.width, maskCanvas.width), Math.min(layerCanvas.height, maskCanvas.height));

  const dFactor = density / 100;
  const len = lData.data.length;

  for (let i = 0; i < len; i += 4) {
    let maskVal = mData.data[i] || 255;
    if (inverted) maskVal = 255 - maskVal;

    const effectiveMaskAlpha = (maskVal / 255) * dFactor + (1 - dFactor);
    lData.data[i + 3] = Math.round(lData.data[i + 3] * effectiveMaskAlpha);
  }

  lCtx.putImageData(lData, 0, 0);
}

/**
 * Apply Drop Shadow, Stroke, and Color Overlay
 */
function applyLayerEffects(layerCanvas: HTMLCanvasElement, effects: any) {
  const ctx = layerCanvas.getContext('2d')!;

  // Color Overlay
  if (effects.colorOverlay && effects.colorOverlay.enabled) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = effects.colorOverlay.color;
    ctx.globalAlpha = effects.colorOverlay.opacity || 1;
    ctx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
    ctx.restore();
  }

  // Stroke
  if (effects.stroke && effects.stroke.enabled) {
    ctx.save();
    ctx.strokeStyle = effects.stroke.color;
    ctx.lineWidth = effects.stroke.size;
    ctx.strokeRect(0, 0, layerCanvas.width, layerCanvas.height);
    ctx.restore();
  }
}
