/**
 * Professional Non-AI Filter Processing Engine
 * Convolution, Spatial Distortions, Stylizations, and Frequency Filters
 */

export interface FilterParams {
  id: string;
  name: string;
  category: 'Blur' | 'Sharpen' | 'Noise' | 'Distort' | 'Stylize' | 'Artistic' | 'Effects';
  amount?: number;
  radius?: number;
  angle?: number;
  threshold?: number;
  strength?: number;
  wavelength?: number;
  frequency?: number;
  levels?: number;
  color?: string;
}

/**
 * Fast Separable 1D Gaussian Blur
 */
export function applyGaussianBlur(srcData: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius <= 0) return new Uint8ClampedArray(srcData);

  const r = Math.min(60, Math.max(1, Math.round(radius)));
  const size = r * 2 + 1;
  const kernel = new Float32Array(size);
  const sigma = r / 3;
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - r;
    const g = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = g;
    sum += g;
  }
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  const output = new Uint8ClampedArray(srcData.length);
  const temp = new Float32Array(srcData.length);

  // Horizontal Pass
  for (let y = 0; y < height; y++) {
    const yOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let k = -r; k <= r; k++) {
        const px = Math.min(width - 1, Math.max(0, x + k));
        const idx = yOffset + px * 4;
        const weight = kernel[k + r];
        rAcc += srcData[idx] * weight;
        gAcc += srcData[idx + 1] * weight;
        bAcc += srcData[idx + 2] * weight;
        aAcc += srcData[idx + 3] * weight;
      }
      const outIdx = yOffset + x * 4;
      temp[outIdx] = rAcc;
      temp[outIdx + 1] = gAcc;
      temp[outIdx + 2] = bAcc;
      temp[outIdx + 3] = aAcc;
    }
  }

  // Vertical Pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let k = -r; k <= r; k++) {
        const py = Math.min(height - 1, Math.max(0, y + k));
        const idx = (py * width + x) * 4;
        const weight = kernel[k + r];
        rAcc += temp[idx] * weight;
        gAcc += temp[idx + 1] * weight;
        bAcc += temp[idx + 2] * weight;
        aAcc += temp[idx + 3] * weight;
      }
      const outIdx = (y * width + x) * 4;
      output[outIdx] = Math.round(rAcc);
      output[outIdx + 1] = Math.round(gAcc);
      output[outIdx + 2] = Math.round(bAcc);
      output[outIdx + 3] = Math.round(aAcc);
    }
  }

  return output;
}

/**
 * Motion Blur
 */
export function applyMotionBlur(srcData: Uint8ClampedArray, width: number, height: number, distance: number, angleDeg: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const steps = Math.max(1, Math.round(distance));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let samples = 0;

      for (let s = -steps / 2; s <= steps / 2; s += 1) {
        const sampleX = Math.round(x + s * dx);
        const sampleY = Math.round(y + s * dy);

        if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
          const idx = (sampleY * width + sampleX) * 4;
          r += srcData[idx];
          g += srcData[idx + 1];
          b += srcData[idx + 2];
          a += srcData[idx + 3];
          samples++;
        }
      }

      const outIdx = (y * width + x) * 4;
      if (samples > 0) {
        output[outIdx] = Math.round(r / samples);
        output[outIdx + 1] = Math.round(g / samples);
        output[outIdx + 2] = Math.round(b / samples);
        output[outIdx + 3] = Math.round(a / samples);
      } else {
        output[outIdx] = srcData[outIdx];
        output[outIdx + 1] = srcData[outIdx + 1];
        output[outIdx + 2] = srcData[outIdx + 2];
        output[outIdx + 3] = srcData[outIdx + 3];
      }
    }
  }
  return output;
}

/**
 * Radial / Zoom Blur
 */
export function applyRadialBlur(srcData: Uint8ClampedArray, width: number, height: number, amount: number, mode: 'spin' | 'zoom' = 'spin'): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const cx = width / 2;
  const cy = height / 2;
  const steps = Math.min(20, Math.max(4, Math.round(amount / 3)));
  const strength = (amount / 100) * 0.15;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      const relX = x - cx;
      const relY = y - cy;

      for (let s = 0; s < steps; s++) {
        let sampleX = x;
        let sampleY = y;

        if (mode === 'zoom') {
          const scale = 1 - (s / steps) * strength;
          sampleX = Math.round(cx + relX * scale);
          sampleY = Math.round(cy + relY * scale);
        } else {
          const angle = ((s - steps / 2) / steps) * strength;
          sampleX = Math.round(cx + relX * Math.cos(angle) - relY * Math.sin(angle));
          sampleY = Math.round(cy + relX * Math.sin(angle) + relY * Math.cos(angle));
        }

        sampleX = Math.max(0, Math.min(width - 1, sampleX));
        sampleY = Math.max(0, Math.min(height - 1, sampleY));

        const idx = (sampleY * width + sampleX) * 4;
        r += srcData[idx];
        g += srcData[idx + 1];
        b += srcData[idx + 2];
        a += srcData[idx + 3];
      }

      const outIdx = (y * width + x) * 4;
      output[outIdx] = Math.round(r / steps);
      output[outIdx + 1] = Math.round(g / steps);
      output[outIdx + 2] = Math.round(b / steps);
      output[outIdx + 3] = Math.round(a / steps);
    }
  }
  return output;
}

/**
 * Unsharp Mask
 */
export function applyUnsharpMask(srcData: Uint8ClampedArray, width: number, height: number, amount: number, radius: number, threshold: number): Uint8ClampedArray {
  const blurred = applyGaussianBlur(srcData, width, height, radius);
  const output = new Uint8ClampedArray(srcData.length);
  const factor = amount / 100;

  for (let i = 0; i < srcData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const orig = srcData[i + c];
      const blur = blurred[i + c];
      const diff = orig - blur;

      if (Math.abs(diff) >= threshold) {
        output[i + c] = Math.max(0, Math.min(255, Math.round(orig + diff * factor)));
      } else {
        output[i + c] = orig;
      }
    }
    output[i + 3] = srcData[i + 3];
  }
  return output;
}

/**
 * High Pass Sharpening
 */
export function applyHighPass(srcData: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  const blurred = applyGaussianBlur(srcData, width, height, radius);
  const output = new Uint8ClampedArray(srcData.length);

  for (let i = 0; i < srcData.length; i += 4) {
    output[i] = Math.max(0, Math.min(255, 128 + (srcData[i] - blurred[i])));
    output[i + 1] = Math.max(0, Math.min(255, 128 + (srcData[i + 1] - blurred[i + 1])));
    output[i + 2] = Math.max(0, Math.min(255, 128 + (srcData[i + 2] - blurred[i + 2])));
    output[i + 3] = srcData[i + 3];
  }
  return output;
}

/**
 * Find Edges (Sobel filter)
 */
export function applyFindEdges(srcData: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const gray = new Uint8ClampedArray(width * height);

  for (let i = 0; i < srcData.length; i += 4) {
    gray[i / 4] = Math.round(0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2]);
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)];

      const gy =
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)];

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const idx = (y * width + x) * 4;
      output[idx] = mag;
      output[idx + 1] = mag;
      output[idx + 2] = mag;
      output[idx + 3] = 255;
    }
  }
  return output;
}

/**
 * Twirl & Spherize Distortions
 */
export function applyTwirl(srcData: Uint8ClampedArray, width: number, height: number, angleDeg: number, radius: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const cx = width / 2;
  const cy = height / 2;
  const rad = (angleDeg * Math.PI) / 180;
  const r2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;

      let srcX = x;
      let srcY = y;

      if (d2 < r2) {
        const d = Math.sqrt(d2);
        const a = Math.atan2(dy, dx) + rad * (1 - d / radius);
        srcX = Math.round(cx + d * Math.cos(a));
        srcY = Math.round(cy + d * Math.sin(a));
      }

      srcX = Math.max(0, Math.min(width - 1, srcX));
      srcY = Math.max(0, Math.min(height - 1, srcY));

      const inIdx = (srcY * width + srcX) * 4;
      const outIdx = (y * width + x) * 4;
      output[outIdx] = srcData[inIdx];
      output[outIdx + 1] = srcData[inIdx + 1];
      output[outIdx + 2] = srcData[inIdx + 2];
      output[outIdx + 3] = srcData[inIdx + 3];
    }
  }
  return output;
}

/**
 * Spherize Distortion
 */
export function applySpherize(srcData: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy);
  const k = amount / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / maxR;
      const dy = (y - cy) / maxR;
      const r = Math.sqrt(dx * dx + dy * dy);

      let srcX = x;
      let srcY = y;

      if (r > 0 && r < 1) {
        const theta = Math.asin(r);
        const newR = Math.sin(theta * (1 + k * 0.5));
        srcX = Math.round(cx + (dx / r) * newR * maxR);
        srcY = Math.round(cy + (dy / r) * newR * maxR);
      }

      srcX = Math.max(0, Math.min(width - 1, srcX));
      srcY = Math.max(0, Math.min(height - 1, srcY));

      const inIdx = (srcY * width + srcX) * 4;
      const outIdx = (y * width + x) * 4;
      output[outIdx] = srcData[inIdx];
      output[outIdx + 1] = srcData[inIdx + 1];
      output[outIdx + 2] = srcData[inIdx + 2];
      output[outIdx + 3] = srcData[inIdx + 3];
    }
  }
  return output;
}

/**
 * Pixelate (Mosaic) Filter
 */
export function applyPixelate(srcData: Uint8ClampedArray, width: number, height: number, blockSize: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const bs = Math.max(2, Math.round(blockSize));

  for (let by = 0; by < height; by += bs) {
    for (let bx = 0; bx < width; bx += bs) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;

      for (let y = by; y < Math.min(height, by + bs); y++) {
        for (let x = bx; x < Math.min(width, bx + bs); x++) {
          const idx = (y * width + x) * 4;
          r += srcData[idx];
          g += srcData[idx + 1];
          b += srcData[idx + 2];
          a += srcData[idx + 3];
          count++;
        }
      }

      const avgR = Math.round(r / count);
      const avgG = Math.round(g / count);
      const avgB = Math.round(b / count);
      const avgA = Math.round(a / count);

      for (let y = by; y < Math.min(height, by + bs); y++) {
        for (let x = bx; x < Math.min(width, bx + bs); x++) {
          const idx = (y * width + x) * 4;
          output[idx] = avgR;
          output[idx + 1] = avgG;
          output[idx + 2] = avgB;
          output[idx + 3] = avgA;
        }
      }
    }
  }
  return output;
}

/**
 * Add Noise (Gaussian & Uniform Film Grain)
 */
export function applyNoise(srcData: Uint8ClampedArray, amount: number, monochromatic: boolean = false): Uint8ClampedArray {
  const factor = (amount / 100) * 128;
  for (let i = 0; i < srcData.length; i += 4) {
    if (monochromatic) {
      const noise = (Math.random() - 0.5) * factor;
      srcData[i] = Math.max(0, Math.min(255, srcData[i] + noise));
      srcData[i + 1] = Math.max(0, Math.min(255, srcData[i + 1] + noise));
      srcData[i + 2] = Math.max(0, Math.min(255, srcData[i + 2] + noise));
    } else {
      srcData[i] = Math.max(0, Math.min(255, srcData[i] + (Math.random() - 0.5) * factor));
      srcData[i + 1] = Math.max(0, Math.min(255, srcData[i + 1] + (Math.random() - 0.5) * factor));
      srcData[i + 2] = Math.max(0, Math.min(255, srcData[i + 2] + (Math.random() - 0.5) * factor));
    }
  }
  return srcData;
}

/**
 * Vignette Falloff Filter
 */
export function applyVignette(srcData: Uint8ClampedArray, width: number, height: number, amount: number, midpoint: number = 0.5): Uint8ClampedArray {
  const cx = width / 2;
  const cy = height / 2;
  const maxD = Math.sqrt(cx * cx + cy * cy);
  const strength = amount;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) / maxD;

      if (d > midpoint) {
        const factor = Math.max(0, 1 - ((d - midpoint) / (1 - midpoint)) * strength);
        const idx = (y * width + x) * 4;
        srcData[idx] = Math.round(srcData[idx] * factor);
        srcData[idx + 1] = Math.round(srcData[idx + 1] * factor);
        srcData[idx + 2] = Math.round(srcData[idx + 2] * factor);
      }
    }
  }
  return srcData;
}

/**
 * Chromatic Aberration
 */
export function applyChromaticAberration(srcData: Uint8ClampedArray, width: number, height: number, offset: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(srcData.length);
  const off = Math.round(offset);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const rX = Math.max(0, Math.min(width - 1, x + off));
      const bX = Math.max(0, Math.min(width - 1, x - off));

      const rIdx = (y * width + rX) * 4;
      const bIdx = (y * width + bX) * 4;

      output[idx] = srcData[rIdx];         // Red shifted right
      output[idx + 1] = srcData[idx + 1];  // Green untouched
      output[idx + 2] = srcData[bIdx + 2]; // Blue shifted left
      output[idx + 3] = srcData[idx + 3];
    }
  }
  return output;
}
