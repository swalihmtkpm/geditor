/**
 * Collage Designer Studio Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Grid, Sparkles, Check } from 'lucide-react';
import { GProDocument, Layer } from '../../types';

interface CollageModeModalProps {
  onClose: () => void;
  onCreateCollageDoc: (doc: GProDocument) => void;
}

export const CollageModeModal: React.FC<CollageModeModalProps> = ({ onClose, onCreateCollageDoc }) => {
  const [layout, setLayout] = useState<'2x1' | '1x2' | '2x2' | '3x1' | '3x3'>('2x2');
  const [gap, setGap] = useState<number>(16);
  const [cornerRadius, setCornerRadius] = useState<number>(8);
  const [bgColor, setBgColor] = useState<string>('#111318');

  const handleGenerateCollage = () => {
    const width = 1920;
    const height = 1080;

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const ctx = bgCanvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Calculate grid cells
    let rows = 2;
    let cols = 2;
    if (layout === '2x1') { rows = 1; cols = 2; }
    if (layout === '1x2') { rows = 2; cols = 1; }
    if (layout === '3x1') { rows = 1; cols = 3; }
    if (layout === '3x3') { rows = 3; cols = 3; }

    const cellW = (width - gap * (cols + 1)) / cols;
    const cellH = (height - gap * (rows + 1)) / rows;

    const layers: Layer[] = [
      {
        id: 'layer-collage-bg',
        name: 'Collage Canvas Background',
        type: 'pixel',
        visible: true,
        locked: true,
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

    let cellIndex = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gap + c * (cellW + gap);
        const y = gap + r * (cellH + gap);

        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = cellW;
        cellCanvas.height = cellH;
        const cCtx = cellCanvas.getContext('2d')!;

        // Procedural gradient cell placeholder
        const grad = cCtx.createLinearGradient(0, 0, cellW, cellH);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#334155');
        cCtx.fillStyle = grad;
        cCtx.roundRect(0, 0, cellW, cellH, cornerRadius);
        cCtx.fill();

        cCtx.fillStyle = '#94a3b8';
        cCtx.font = 'bold 24px Plus Jakarta Sans, sans-serif';
        cCtx.textAlign = 'center';
        cCtx.textBaseline = 'middle';
        cCtx.fillText(`Photo Cell #${cellIndex}`, cellW / 2, cellH / 2);

        layers.push({
          id: `layer-cell-${cellIndex}`,
          name: `Collage Cell ${cellIndex}`,
          type: 'pixel',
          visible: true,
          locked: false,
          opacity: 1,
          fillOpacity: 1,
          blendMode: 'normal',
          x,
          y,
          width: cellW,
          height: cellH,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          canvas: cellCanvas,
        });

        cellIndex++;
      }
    }

    const collageDoc: GProDocument = {
      id: 'doc-collage-' + Date.now(),
      name: `Collage_${layout.toUpperCase()}.gpro`,
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
          description: `Create Collage (${layout})`,
          timestamp: Date.now(),
          documentState: '',
        },
      ],
      historyIndex: 0,
      snapshots: [],
      guides: [],
      zoom: 0.6,
      pan: { x: 0, y: 0 },
      canvasRotation: 0,
      selection: { active: false, feather: 0, mode: 'replace' },
      isModified: false,
      createdAt: Date.now(),
    };

    onCreateCollageDoc(collageDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Collage Designer Studio</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Grid Layout Template
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['2x1', '1x2', '2x2', '3x1', '3x3'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`py-2 rounded font-bold uppercase transition-colors border ${
                    layout === l
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#15171e] border-[#252834] text-gray-300 hover:bg-[#20222b]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#14161d] p-3 rounded border border-[#252834] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Cell Gap Spacing:</span>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={gap}
                  onChange={(e) => setGap(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="font-mono text-gray-200 w-8 text-right">{gap}px</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Corner Radius:</span>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="font-mono text-gray-200 w-8 text-right">{cornerRadius}px</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Backdrop Color:</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#2e3240] cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleGenerateCollage}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors"
          >
            Create Collage
          </button>
        </div>
      </div>
    </div>
  );
};
