/**
 * Professional Export Studio Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { GProDocument } from '../../types';
import { renderDocument } from '../../engine/compositor';

interface ExportModalProps {
  document: GProDocument;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ document: doc, onClose }) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'bmp'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [scale, setScale] = useState<number>(1);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('© Created with G-Pro');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const outWidth = Math.round(doc.width * scale);
  const outHeight = Math.round(doc.height * scale);

  const handleExport = () => {
    setIsExporting(true);

    // Render high quality composite
    const canvas = document.createElement('canvas');
    renderDocument(doc, canvas);

    let exportCanvas = canvas;
    if (scale !== 1) {
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = outWidth;
      exportCanvas.height = outHeight;
      const ctx = exportCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0, outWidth, outHeight);
    }

    if (includeWatermark && watermarkText.trim()) {
      const ctx = exportCanvas.getContext('2d')!;
      ctx.save();
      ctx.font = 'bold 20px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'right';
      ctx.fillText(watermarkText, exportCanvas.width - 30, exportCanvas.height - 30);
      ctx.restore();
    }

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = exportCanvas.toDataURL(mimeType, quality / 100);

    const a = window.document.createElement('a');
    const baseName = doc.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.${format}`;
    a.href = dataUrl;
    a.click();

    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Export Image</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'jpeg', 'webp', 'bmp'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 rounded font-bold uppercase transition-colors border ${
                    format === f
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#15171e] border-[#252834] text-gray-300 hover:bg-[#20222b]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (JPEG / WebP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div className="flex flex-col gap-1.5 bg-[#14161d] p-2.5 rounded border border-[#252834]">
              <div className="flex justify-between text-gray-300">
                <span>Quality:</span>
                <span className="font-mono">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
              />
            </div>
          )}

          {/* Dimensions & Scale */}
          <div className="bg-[#14161d] p-2.5 rounded border border-[#252834] flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Target Resolution:</span>
              <span className="font-mono text-white font-semibold">
                {outWidth} × {outHeight} px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-16">Scale:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-1 rounded text-[11px] font-semibold border ${
                    scale === s
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#20222b] border-[#2e3240] text-gray-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Option */}
          <div className="bg-[#14161d] p-2.5 rounded border border-[#252834] flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWatermark}
                onChange={(e) => setIncludeWatermark(e.target.checked)}
                className="rounded border-[#2e3240]"
              />
              <span className="text-gray-200">Include Custom Watermark</span>
            </label>
            {includeWatermark && (
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Watermark text..."
                className="w-full bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-gray-200 text-[11px]"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Download Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
