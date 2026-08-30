/**
 * Batch Image Processing Studio Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Layers, Sliders, Play, CheckCircle2, Upload } from 'lucide-react';
import { applyGaussianBlur, applyUnsharpMask } from '../../engine/filters';
import { applyBasicAdjustments } from '../../engine/adjustments';

interface BatchProcessingModalProps {
  onClose: () => void;
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({ onClose }) => {
  const [files, setFiles] = useState<{ name: string; size: string; status: 'ready' | 'processing' | 'done' }[]>([
    { name: 'IMG_4821_RAW.jpg', size: '4.2 MB', status: 'ready' },
    { name: 'IMG_4822_RAW.jpg', size: '4.5 MB', status: 'ready' },
    { name: 'IMG_4823_RAW.jpg', size: '3.9 MB', status: 'ready' },
  ]);

  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [targetWidth, setTargetWidth] = useState<number>(1920);
  const [applySharpening, setApplySharpening] = useState<boolean>(true);
  const [autoContrast, setAutoContrast] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f: File) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      status: 'ready' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRunBatch = () => {
    setIsProcessing(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < files.length) {
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done' } : f))
        );
        i++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Batch Image Processing Studio</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          {/* File Queue */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                Batch File Queue ({files.length})
              </span>
              <label className="px-2.5 py-1 bg-[#20222b] hover:bg-[#282b36] border border-[#2e3240] rounded text-gray-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1">
                <Upload size={12} />
                <span>Add Images</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="bg-[#14161d] border border-[#252834] rounded max-h-36 overflow-y-auto p-1.5 flex flex-col gap-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-[#1b1d25] rounded text-gray-300">
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="text-gray-500 font-mono mx-2">{f.size}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    f.status === 'done' ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {f.status === 'done' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Batch Actions Checklist */}
          <div className="grid grid-cols-2 gap-3 bg-[#14161d] p-3 rounded border border-[#252834]">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-gray-300">Format & Scaling</span>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Width:</span>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value))}
                  className="w-20 bg-[#20222b] border border-[#2e3240] rounded px-1.5 py-0.5 text-right font-mono text-gray-200"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Format:</span>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as any)}
                  className="bg-[#20222b] border border-[#2e3240] rounded px-2 py-0.5 text-gray-200 uppercase"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-gray-300">Image Enhancements</span>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySharpening}
                  onChange={(e) => setApplySharpening(e.target.checked)}
                />
                <span>Smart Unsharp Mask Sharpening</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoContrast}
                  onChange={(e) => setAutoContrast(e.target.checked)}
                />
                <span>Auto Contrast & Tone Equalize</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white">
            Close
          </button>
          <button
            onClick={handleRunBatch}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors flex items-center gap-1.5"
          >
            <Play size={13} />
            <span>{isProcessing ? 'Processing...' : 'Run Batch Process'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
