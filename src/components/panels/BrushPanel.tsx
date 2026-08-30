/**
 * Brush & Tool Settings Panel for G-Pro
 */

import React from 'react';
import { Brush, Sparkles, Feather, Sliders } from 'lucide-react';
import { BrushSettings } from '../../types';

interface BrushPanelProps {
  settings: BrushSettings;
  onChange: (settings: BrushSettings) => void;
}

export const BrushPanel: React.FC<BrushPanelProps> = ({ settings, onChange }) => {
  const updateSetting = (key: keyof BrushSettings, val: number | string | boolean) => {
    onChange({ ...settings, [key]: val });
  };

  const BRUSH_PRESETS = [
    { name: 'Soft Round', size: 60, hardness: 0, opacity: 1, flow: 1 },
    { name: 'Hard Round', size: 30, hardness: 100, opacity: 1, flow: 1 },
    { name: 'Airbrush Soft', size: 120, hardness: 0, opacity: 0.4, flow: 0.3 },
    { name: 'Fine Detail', size: 5, hardness: 100, opacity: 1, flow: 1 },
    { name: 'Rough Scatter', size: 50, hardness: 50, scatter: 60, spacing: 25 },
  ];

  return (
    <div id="gpro-brush-panel" className="flex flex-col h-full bg-[#181a22] text-xs p-3 overflow-y-auto gap-4 select-none">
      {/* Presets */}
      <div>
        <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
          Brush Presets
        </span>
        <div className="grid grid-cols-1 gap-1">
          {BRUSH_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => onChange({ ...settings, ...p })}
              className="flex items-center justify-between px-2.5 py-1.5 bg-[#14161d] hover:bg-[#222634] rounded text-left transition-colors border border-[#252834]"
            >
              <span className="text-[11px] text-gray-200">{p.name}</span>
              <span className="text-[10px] text-gray-500 font-mono">{p.size}px</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dynamics */}
      <div className="pt-2 border-t border-[#252834] flex flex-col gap-2.5">
        <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
          Brush Dynamics
        </span>

        {/* Size */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Size</label>
          <input
            type="range"
            min="1"
            max="500"
            value={settings.size}
            onChange={(e) => updateSetting('size', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {settings.size}px
          </span>
        </div>

        {/* Hardness */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Hardness</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.hardness}
            onChange={(e) => updateSetting('hardness', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {settings.hardness}%
          </span>
        </div>

        {/* Opacity */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Opacity</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={settings.opacity}
            onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {Math.round(settings.opacity * 100)}%
          </span>
        </div>

        {/* Flow */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Flow</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={settings.flow}
            onChange={(e) => updateSetting('flow', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {Math.round(settings.flow * 100)}%
          </span>
        </div>

        {/* Spacing */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Spacing</label>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.spacing}
            onChange={(e) => updateSetting('spacing', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {settings.spacing}%
          </span>
        </div>

        {/* Scatter */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 w-16">Scatter</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.scatter || 0}
            onChange={(e) => updateSetting('scatter', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
            {settings.scatter || 0}%
          </span>
        </div>
      </div>
    </div>
  );
};
