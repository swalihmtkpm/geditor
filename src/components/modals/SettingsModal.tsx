/**
 * Preferences & Workspace Settings Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Settings, Sliders, Moon, Monitor, Check } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  showGuides: boolean;
  setShowGuides: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  showRulers,
  setShowRulers,
  showGuides,
  setShowGuides,
  showGrid,
  setShowGrid,
}) => {
  const [historyLimit, setHistoryLimit] = useState(50);
  const [gpuAcceleration, setGpuAcceleration] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-xs flex flex-col">
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Preferences & Performance</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
              Canvas Guides & Overlays
            </span>
            <div className="bg-[#14161d] p-3 rounded border border-[#252834] flex flex-col gap-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Show Rulers (Top & Left)</span>
                <input
                  type="checkbox"
                  checked={showRulers}
                  onChange={(e) => setShowRulers(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Show Canvas Guides</span>
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Show Grid</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
              Performance & Memory
            </span>
            <div className="bg-[#14161d] p-3 rounded border border-[#252834] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">History Undo States:</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={historyLimit}
                  onChange={(e) => setHistoryLimit(parseInt(e.target.value) || 50)}
                  className="w-16 bg-[#20222b] border border-[#2e3240] rounded px-2 py-0.5 text-center font-mono text-gray-200"
                />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Hardware Buffer Acceleration</span>
                <input
                  type="checkbox"
                  checked={gpuAcceleration}
                  onChange={(e) => setGpuAcceleration(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
