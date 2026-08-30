/**
 * Color Picker & Swatches Panel for G-Pro
 */

import React, { useState } from 'react';
import { Palette, Pipette, Plus, RefreshCw } from 'lucide-react';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '../../utils/color';

interface ColorSwatchesPanelProps {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundColorChange?: (color: string) => void;
  setForegroundColor?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

const DEFAULT_SWATCHES = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9',
];

export const ColorSwatchesPanel: React.FC<ColorSwatchesPanelProps> = ({
  foregroundColor,
  backgroundColor,
  onForegroundColorChange,
  setForegroundColor,
  onBackgroundColorChange,
  setBackgroundColor,
}) => {
  const updateFgColor = onForegroundColorChange || setForegroundColor || (() => {});
  const updateBgColor = onBackgroundColorChange || setBackgroundColor || (() => {});
  const [swatches, setSwatches] = useState<string[]>(DEFAULT_SWATCHES);
  const rgb = hexToRgb(foregroundColor) || { r: 255, g: 255, b: 255 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const handleAddCurrentColor = () => {
    if (!swatches.includes(foregroundColor)) {
      setSwatches([foregroundColor, ...swatches]);
    }
  };

  return (
    <div id="gpro-color-swatches-panel" className="flex flex-col h-full bg-[#181a22] text-xs p-3 overflow-y-auto gap-4 select-none">
      {/* Visual Color Picker */}
      <div className="flex flex-col gap-2 bg-[#14161d] p-2.5 rounded border border-[#252834]">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => updateFgColor(e.target.value)}
            className="w-12 h-12 rounded border border-[#2e3240] cursor-pointer bg-transparent"
          />
          <div className="flex flex-col gap-0.5 font-mono text-[11px]">
            <span className="text-white font-bold uppercase">{foregroundColor}</span>
            <span className="text-gray-400">RGB: {rgb.r}, {rgb.g}, {rgb.b}</span>
            <span className="text-gray-400">HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</span>
          </div>
        </div>
      </div>

      {/* Palette Swatches */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            Palette Swatches
          </span>
          <button
            onClick={handleAddCurrentColor}
            className="p-1 hover:bg-[#252834] text-gray-400 hover:text-white rounded transition-colors"
            title="Add Current Color to Palette"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1.5 bg-[#14161d] p-2 rounded border border-[#252834]">
          {swatches.map((color, i) => (
            <button
              key={`${color}-${i}`}
              onClick={() => updateFgColor(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                updateBgColor(color);
              }}
              style={{ backgroundColor: color }}
              className="w-full aspect-square rounded-sm border border-[#2e3240] hover:scale-110 transition-transform shadow-sm"
              title={`${color} (Left-click FG, Right-click BG)`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
