/**
 * New Document & Project Creation Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, FilePlus, Sparkles, Check } from 'lucide-react';
import { GProDocument, Layer } from '../../types';

interface NewDocumentModalProps {
  onClose: () => void;
  onCreateDocument: (doc: GProDocument) => void;
}

const PRESETS = [
  { name: '4K Ultra HD', width: 3840, height: 2160, dpi: 300, cat: 'Photo' },
  { name: 'Full HD Landscape', width: 1920, height: 1080, dpi: 300, cat: 'Photo' },
  { name: 'Instagram Portrait', width: 1080, height: 1350, dpi: 72, cat: 'Social' },
  { name: 'Instagram Square', width: 1080, height: 1080, dpi: 72, cat: 'Social' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, dpi: 72, cat: 'Social' },
  { name: 'Print A4 (300 DPI)', width: 2480, height: 3508, dpi: 300, cat: 'Print' },
  { name: 'Print US Letter', width: 2550, height: 3300, dpi: 300, cat: 'Print' },
];

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  onClose,
  onCreateDocument,
}) => {
  const [docName, setDocName] = useState('Untitled-1.gpro');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [dpi, setDpi] = useState(300);
  const [bgColor, setBgColor] = useState<'white' | 'black' | 'transparent'>('white');

  const handleCreate = () => {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const ctx = bgCanvas.getContext('2d')!;

    if (bgColor === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else if (bgColor === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }

    const bgLayer: Layer = {
      id: 'layer-bg-' + Date.now(),
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
    };

    const newDoc: GProDocument = {
      id: 'doc-' + Date.now(),
      name: docName.endsWith('.gpro') ? docName : `${docName}.gpro`,
      width,
      height,
      dpi,
      colorMode: 'RGB',
      bitDepth: 8,
      colorProfile: 'sRGB',
      layers: [bgLayer],
      activeLayerId: bgLayer.id,
      history: [
        {
          id: 'hist-init',
          description: 'Create New Document',
          timestamp: Date.now(),
          documentState: '',
        },
      ],
      historyIndex: 0,
      snapshots: [],
      guides: [],
      zoom: 0.65,
      pan: { x: 0, y: 0 },
      canvasRotation: 0,
      selection: { active: false, feather: 0, mode: 'replace' },
      isModified: false,
      createdAt: Date.now(),
    };

    onCreateDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilePlus size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">New Document</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preset list */}
          <div className="w-64 bg-[#15171e] border-r border-[#252834] p-3 flex flex-col gap-1 overflow-y-auto">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Standard Presets
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setWidth(p.width);
                  setHeight(p.height);
                  setDpi(p.dpi);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-colors border ${
                  width === p.width && height === p.height
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#1a1c24] border-[#282c3a] text-gray-300 hover:bg-[#222530]'
                }`}
              >
                <div className="font-semibold text-[11px]">{p.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {p.width} × {p.height} px ({p.dpi} DPI)
                </div>
              </button>
            ))}
          </div>

          {/* Custom Settings Form */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div>
              <label className="text-gray-400 block mb-1">Document Name:</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full bg-[#20222b] border border-[#2e3240] rounded px-3 py-1.5 text-gray-100 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 block mb-1">Width (px):</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full bg-[#20222b] border border-[#2e3240] rounded px-3 py-1.5 text-gray-100 font-mono"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Height (px):</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full bg-[#20222b] border border-[#2e3240] rounded px-3 py-1.5 text-gray-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 block mb-1">Resolution (DPI):</label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(parseInt(e.target.value) || 72)}
                  className="w-full bg-[#20222b] border border-[#2e3240] rounded px-3 py-1.5 text-gray-100 font-mono"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Canvas Background:</label>
                <select
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value as any)}
                  className="w-full bg-[#20222b] border border-[#2e3240] rounded px-3 py-1.5 text-gray-100 capitalize"
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors"
          >
            Create Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
