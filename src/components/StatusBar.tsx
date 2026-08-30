/**
 * Bottom Status Bar for G-Pro
 */

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Cpu } from 'lucide-react';
import { GProDocument } from '../types';

interface StatusBarProps {
  document: GProDocument | null;
  cursorCoords: { x: number; y: number } | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitCanvas: () => void;
  onActualPixels: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  document: doc,
  cursorCoords,
  zoom,
  onZoomChange,
  onFitCanvas,
  onActualPixels,
}) => {
  if (!doc) return null;

  return (
    <footer
      id="gpro-status-bar"
      className="h-6 bg-[#14161d] border-t border-[#252834] flex items-center justify-between px-3 text-[11px] text-gray-400 select-none shrink-0 z-40"
    >
      {/* Left: Document Info & Coordinates */}
      <div className="flex items-center gap-3">
        {/* Document Dimensions & MP */}
        <span className="font-mono text-gray-300">
          {doc.width} × {doc.height} px
        </span>
        <span className="text-gray-600">•</span>
        <span>{((doc.width * doc.height) / 1000000).toFixed(1)} MP</span>
        <span className="text-gray-600">•</span>
        <span className="text-blue-400">{doc.colorProfile} ({doc.bitDepth}-bit)</span>

        {/* Cursor Coordinates */}
        {cursorCoords && (
          <>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-gray-400">
              X: {Math.round(cursorCoords.x)} Y: {Math.round(cursorCoords.y)}
            </span>
          </>
        )}
      </div>

      {/* Right: Engine Status & Zoom Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Local Engine Active</span>
        </div>

        <span className="text-gray-600">•</span>

        {/* Fit / 100% Buttons */}
        <button
          onClick={onFitCanvas}
          className="hover:text-white transition-colors"
          title="Fit Canvas on Screen (Ctrl+0)"
        >
          Fit
        </button>
        <button
          onClick={onActualPixels}
          className="hover:text-white transition-colors"
          title="100% Actual Pixels (Ctrl+1)"
        >
          100%
        </button>

        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onZoomChange(Math.max(0.05, zoom / 1.25))}
            className="hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <input
            type="range"
            min="0.05"
            max="16"
            step="0.05"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#252834] rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => onZoomChange(Math.min(32, zoom * 1.25))}
            className="hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <span className="font-mono text-gray-300 w-10 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
    </footer>
  );
};
