/**
 * Native .gpro Project File Engine & Sample Project Generator
 */

import { GProDocument, Layer } from '../types';

export function serializeDocument(doc: GProDocument): string {
  const serializableLayers = doc.layers.map((l) => {
    const serialized: any = { ...l };
    if (l.canvas) {
      serialized.canvasDataUrl = l.canvas.toDataURL('image/png');
      delete serialized.canvas;
    }
    if (l.mask && l.mask.canvas) {
      serialized.maskDataUrl = l.mask.canvas.toDataURL('image/png');
      delete serialized.mask.canvas;
    }
    return serialized;
  });

  const serializableDoc = {
    ...doc,
    layers: serializableLayers,
  };

  return JSON.stringify(serializableDoc);
}

export async function deserializeDocument(jsonStr: string): Promise<GProDocument> {
  const parsed = JSON.parse(jsonStr);

  const restoredLayers: Layer[] = await Promise.all(
    parsed.layers.map(async (l: any) => {
      const layer: Layer = { ...l };

      if (l.canvasDataUrl) {
        const img = new Image();
        img.src = l.canvasDataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        canvas.width = l.width || img.width;
        canvas.height = l.height || img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        layer.canvas = canvas;
        delete (layer as any).canvasDataUrl;
      }

      if (l.maskDataUrl) {
        const mImg = new Image();
        mImg.src = l.maskDataUrl;
        await new Promise((resolve) => {
          mImg.onload = resolve;
        });

        const mCanvas = document.createElement('canvas');
        mCanvas.width = mImg.width;
        mCanvas.height = mImg.height;
        const mCtx = mCanvas.getContext('2d')!;
        mCtx.drawImage(mImg, 0, 0);
        layer.mask = {
          enabled: l.mask.enabled ?? true,
          inverted: l.mask.inverted ?? false,
          density: l.mask.density ?? 100,
          feather: l.mask.feather ?? 0,
          canvas: mCanvas,
        };
        delete (layer as any).maskDataUrl;
      }

      return layer;
    })
  );

  return {
    ...parsed,
    layers: restoredLayers,
  };
}

/**
 * Save .gpro Project to file download
 */
export function saveProjectToJson(doc: GProDocument): void {
  const jsonStr = serializeDocument(doc);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = doc.name.endsWith('.gpro') ? doc.name : `${doc.name}.gpro`;
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Load .gpro project from user uploaded file
 */
export function loadProjectFromJson(file: File): Promise<GProDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const doc = await deserializeDocument(text);
        resolve(doc);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Generate Procedural Sample Photographic & Graphic Canvas for instant editing
 */
export function createSampleProject(type: 'portrait' | 'landscape' | 'poster' | 'blank'): GProDocument {
  const width = type === 'poster' ? 1080 : 1920;
  const height = type === 'poster' ? 1350 : 1080;

  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  const ctx = bgCanvas.getContext('2d')!;

  if (type === 'landscape') {
    // Procedural majestic dusk landscape with mountains, sky gradient, and sun
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.3, '#312e81');
    skyGrad.addColorStop(0.6, '#9333ea');
    skyGrad.addColorStop(0.85, '#f97316');
    skyGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Sun
    ctx.beginPath();
    ctx.arc(width * 0.45, height * 0.55, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 50;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Distant Mountains
    ctx.fillStyle = '#47165c';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.65);
    ctx.lineTo(width * 0.25, height * 0.48);
    ctx.lineTo(width * 0.5, height * 0.62);
    ctx.lineTo(width * 0.78, height * 0.44);
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Foreground Mountains & Lake
    ctx.fillStyle = '#1e0c2e';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(width * 0.35, height * 0.58);
    ctx.lineTo(width * 0.7, height * 0.78);
    ctx.lineTo(width, height * 0.68);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Lake Reflection
    const waterGrad = ctx.createLinearGradient(0, height * 0.78, 0, height);
    waterGrad.addColorStop(0, '#2d1445');
    waterGrad.addColorStop(1, '#090312');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, height * 0.78, width, height * 0.22);
  } else if (type === 'portrait') {
    // Studio Portrait Backdrop with warm rim light
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.4, 80, width * 0.5, height * 0.4, width * 0.8);
    bgGrad.addColorStop(0, '#334155');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stylized silhouette figure / subject
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.38, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.8, 280, 260, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'poster') {
    // High-impact graphic poster background
    const postGrad = ctx.createLinearGradient(0, 0, width, height);
    postGrad.addColorStop(0, '#090a0f');
    postGrad.addColorStop(0.5, '#13192b');
    postGrad.addColorStop(1, '#1e102d');
    ctx.fillStyle = postGrad;
    ctx.fillRect(0, 0, width, height);

    // Graphic Grid Accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } else {
    // Clean transparent or neutral white canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  const layers: Layer[] = [
    {
      id: 'layer-bg',
      name: 'Background',
      type: 'pixel',
      visible: true,
      locked: false,
      opacity: 1,
      fillOpacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: bgCanvas,
    },
  ];

  if (type === 'landscape') {
    // Add non-destructive Curves Adjustment Layer
    layers.push({
      id: 'layer-curves',
      name: 'Cinematic Tone Curve',
      type: 'adjustment',
      visible: true,
      locked: false,
      opacity: 0.9,
      fillOpacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      adjustmentType: 'curves',
      curves: {
        rgb: [
          { x: 0, y: 15 },
          { x: 60, y: 50 },
          { x: 190, y: 210 },
          { x: 255, y: 245 },
        ],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 10 }, { x: 255, y: 245 }],
      },
    });

    // Add Color Grading layer
    layers.push({
      id: 'layer-grading',
      name: 'Warm Sunset Grade',
      type: 'adjustment',
      visible: true,
      locked: false,
      opacity: 0.85,
      fillOpacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      adjustmentType: 'color-grading',
      colorGrading: {
        shadows: { hue: 230, saturation: 35, luminance: -5 },
        midtones: { hue: 35, saturation: 40, luminance: 0 },
        highlights: { hue: 45, saturation: 50, luminance: 5 },
        global: { hue: 40, saturation: 15, luminance: 0 },
        blending: 50,
        balance: 0,
      },
    });
  } else if (type === 'poster') {
    // Add vector graphic shapes and text
    layers.push({
      id: 'layer-shape-accent',
      name: 'Accent Ring',
      type: 'shape',
      shapeType: 'circle',
      visible: true,
      locked: false,
      opacity: 0.9,
      fillOpacity: 1,
      blendMode: 'screen',
      x: width * 0.2,
      y: height * 0.25,
      width: 400,
      height: 400,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fillColor: 'transparent',
      strokeColor: '#38bdf8',
      strokeWidth: 12,
    });

    layers.push({
      id: 'layer-text-title',
      name: 'Title Typography',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1,
      fillOpacity: 1,
      blendMode: 'normal',
      x: 80,
      y: height * 0.6,
      width: width - 160,
      height: 300,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: 'CREATIVE\nHORIZONS',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 84,
      fontWeight: '800',
      textColor: '#ffffff',
      textAlign: 'left',
      lineHeight: 95,
    });
  }

  const docId = 'doc-' + Date.now();
  const doc: GProDocument = {
    id: docId,
    name: type === 'landscape' ? 'Cinematic_Landscape.gpro' : type === 'poster' ? 'Editorial_Poster.gpro' : 'Studio_Project.gpro',
    width,
    height,
    dpi: 300,
    colorMode: 'RGB',
    bitDepth: 8,
    colorProfile: 'sRGB',
    layers,
    activeLayerId: layers[layers.length - 1].id,
    history: [
      {
        id: 'hist-init',
        description: 'Open Project Template',
        timestamp: Date.now(),
        documentState: '',
      },
    ],
    historyIndex: 0,
    snapshots: [
      {
        id: 'snap-orig',
        name: 'Original State',
        timestamp: Date.now(),
        documentState: '',
      },
    ],
    guides: [
      { id: 'g1', orientation: 'horizontal', position: Math.round(height * 0.333) },
      { id: 'g2', orientation: 'horizontal', position: Math.round(height * 0.666) },
      { id: 'g3', orientation: 'vertical', position: Math.round(width * 0.333) },
      { id: 'g4', orientation: 'vertical', position: Math.round(width * 0.666) },
    ],
    zoom: 0.65,
    pan: { x: 0, y: 0 },
    canvasRotation: 0,
    selection: {
      active: false,
      feather: 0,
      mode: 'replace',
    },
    metadata: {
      camera: 'Sony Alpha 7R V',
      lens: 'FE 24-70mm F2.8 GM II',
      iso: 100,
      aperture: 'f/4.0',
      shutterSpeed: '1/250s',
      focalLength: '35mm',
      dateTime: '2026-08-30',
      colorProfile: 'sRGB IEC61966-2.1',
      megapixels: `${((width * height) / 1000000).toFixed(1)} MP`,
      dimensions: `${width} × ${height} px`,
    },
    isModified: false,
    createdAt: Date.now(),
  };

  return doc;
}
