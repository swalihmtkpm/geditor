/**
 * Contextual Properties Panel for G-Pro
 * Displays Transform, Typography, Shape attributes, and Selection Operations
 */

import React from 'react';
import {
  Maximize2,
  RotateCw,
  Type,
  Square,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { GProDocument, Layer } from '../../types';
import { invertSelectionMask, applyFeatherToMask } from '../../engine/selectionEngine';

interface PropertiesPanelProps {
  document: GProDocument | null;
  onUpdateDocument: (doc: GProDocument, recordHistory?: boolean, desc?: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  document: doc,
  onUpdateDocument,
}) => {
  if (!doc) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs">
        No active document
      </div>
    );
  }

  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

  const updateActiveLayer = (updates: Partial<Layer>, desc = 'Update Layer Properties') => {
    if (!activeLayer) return;
    const updatedLayers = doc.layers.map((l) =>
      l.id === activeLayer.id ? { ...l, ...updates } : l
    );
    onUpdateDocument({ ...doc, layers: updatedLayers }, true, desc);
  };

  // Selection Invert / Feather
  const handleInvertSelection = () => {
    if (doc.selection.maskCanvas) {
      invertSelectionMask(doc.selection.maskCanvas);
      onUpdateDocument({ ...doc }, true, 'Invert Selection');
    }
  };

  const handleFeatherSelection = (radius: number) => {
    if (doc.selection.maskCanvas) {
      applyFeatherToMask(doc.selection.maskCanvas, radius);
      onUpdateDocument({ ...doc }, true, `Feather Selection (${radius}px)`);
    }
  };

  if (!activeLayer) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs">
        No layer selected. Select a layer to view and adjust its properties.
      </div>
    );
  }

  return (
    <div id="gpro-properties-panel" className="flex flex-col h-full bg-[#181a22] text-xs p-3 overflow-y-auto gap-4 select-none">
      {/* 1. Transform Section */}
      <div>
        <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
          Transform & Geometry
        </span>
        <div className="grid grid-cols-2 gap-2 bg-[#14161d] p-2.5 rounded border border-[#252834]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">X:</span>
            <input
              type="number"
              value={Math.round(activeLayer.x)}
              onChange={(e) => updateActiveLayer({ x: parseInt(e.target.value) || 0 })}
              className="w-16 bg-[#20222b] border border-[#2e3240] rounded px-1.5 py-0.5 text-right font-mono text-gray-200"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Y:</span>
            <input
              type="number"
              value={Math.round(activeLayer.y)}
              onChange={(e) => updateActiveLayer({ y: parseInt(e.target.value) || 0 })}
              className="w-16 bg-[#20222b] border border-[#2e3240] rounded px-1.5 py-0.5 text-right font-mono text-gray-200"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">W:</span>
            <input
              type="number"
              value={Math.round(activeLayer.width)}
              onChange={(e) => updateActiveLayer({ width: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 bg-[#20222b] border border-[#2e3240] rounded px-1.5 py-0.5 text-right font-mono text-gray-200"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">H:</span>
            <input
              type="number"
              value={Math.round(activeLayer.height)}
              onChange={(e) => updateActiveLayer({ height: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 bg-[#20222b] border border-[#2e3240] rounded px-1.5 py-0.5 text-right font-mono text-gray-200"
            />
          </div>
          <div className="flex items-center justify-between col-span-2 pt-1 border-t border-[#252834]">
            <span className="text-gray-400">Rotation:</span>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min="-180"
                max="180"
                value={activeLayer.rotation}
                onChange={(e) => updateActiveLayer({ rotation: parseInt(e.target.value) })}
                className="w-24"
              />
              <span className="w-10 text-right font-mono text-gray-300">{activeLayer.rotation}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Text Layer Properties */}
      {activeLayer.type === 'text' && (
        <div className="pt-2 border-t border-[#252834]">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
            Typography
          </span>
          <div className="flex flex-col gap-2 bg-[#14161d] p-2.5 rounded border border-[#252834]">
            {/* Text Input */}
            <textarea
              rows={2}
              value={activeLayer.text || ''}
              onChange={(e) => updateActiveLayer({ text: e.target.value })}
              className="w-full bg-[#20222b] border border-[#2e3240] rounded p-1.5 text-gray-100 text-[11px] focus:outline-none focus:border-blue-500"
              placeholder="Enter text..."
            />

            {/* Font Family */}
            <select
              value={activeLayer.fontFamily || 'Plus Jakarta Sans'}
              onChange={(e) => updateActiveLayer({ fontFamily: e.target.value })}
              className="w-full bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-gray-200 text-[11px]"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Inter">Inter</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono (Monospace)</option>
              <option value="Impact">Impact</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
            </select>

            {/* Font Size & Align */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Size:</span>
                <input
                  type="number"
                  min="8"
                  max="300"
                  value={activeLayer.fontSize || 36}
                  onChange={(e) => updateActiveLayer({ fontSize: parseInt(e.target.value) || 12 })}
                  className="w-14 bg-[#20222b] border border-[#2e3240] rounded px-1 py-0.5 text-center font-mono text-gray-200"
                />
              </div>

              {/* Text Align Buttons */}
              <div className="flex items-center bg-[#20222b] border border-[#2e3240] rounded p-0.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateActiveLayer({ textAlign: align })}
                    className={`p-1 rounded ${
                      (activeLayer.textAlign || 'left') === align
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {align === 'left' ? <AlignLeft size={12} /> : align === 'center' ? <AlignCenter size={12} /> : <AlignRight size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Color */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Color:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeLayer.textColor || '#ffffff'}
                  onChange={(e) => updateActiveLayer({ textColor: e.target.value })}
                  className="w-6 h-6 rounded border border-[#2e3240] cursor-pointer bg-transparent"
                />
                <span className="font-mono text-gray-300 uppercase">{activeLayer.textColor || '#ffffff'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Shape Layer Properties */}
      {activeLayer.type === 'shape' && (
        <div className="pt-2 border-t border-[#252834]">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
            Vector Shape Styling
          </span>
          <div className="flex flex-col gap-2.5 bg-[#14161d] p-2.5 rounded border border-[#252834]">
            {/* Fill Color */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Fill:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeLayer.fillColor || '#38bdf8'}
                  onChange={(e) => updateActiveLayer({ fillColor: e.target.value })}
                  className="w-6 h-6 rounded border border-[#2e3240] cursor-pointer bg-transparent"
                />
                <span className="font-mono text-gray-300 uppercase">{activeLayer.fillColor}</span>
              </div>
            </div>

            {/* Stroke Color & Width */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Stroke:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeLayer.strokeColor || '#ffffff'}
                  onChange={(e) => updateActiveLayer({ strokeColor: e.target.value })}
                  className="w-6 h-6 rounded border border-[#2e3240] cursor-pointer bg-transparent"
                />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={activeLayer.strokeWidth || 0}
                  onChange={(e) => updateActiveLayer({ strokeWidth: parseInt(e.target.value) || 0 })}
                  className="w-12 bg-[#20222b] border border-[#2e3240] rounded px-1 py-0.5 text-center font-mono text-gray-200"
                />
                <span className="text-gray-400">px</span>
              </div>
            </div>

            {/* Corner Radius (Rounded Rect) */}
            {activeLayer.shapeType === 'rounded-rect' && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Radius:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeLayer.cornerRadius || 16}
                  onChange={(e) => updateActiveLayer({ cornerRadius: parseInt(e.target.value) })}
                  className="w-28"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Active Selection Actions */}
      {doc.selection.active && (
        <div className="pt-2 border-t border-[#252834]">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
            Active Selection Actions
          </span>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleInvertSelection}
              className="w-full py-1 bg-[#202431] hover:bg-[#2a2f40] rounded text-gray-300 hover:text-white transition-colors"
            >
              Invert Selection
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFeatherSelection(5)}
                className="flex-1 py-1 bg-[#202431] hover:bg-[#2a2f40] rounded text-gray-300 hover:text-white"
              >
                Feather 5px
              </button>
              <button
                onClick={() => handleFeatherSelection(15)}
                className="flex-1 py-1 bg-[#202431] hover:bg-[#2a2f40] rounded text-gray-300 hover:text-white"
              >
                Feather 15px
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
