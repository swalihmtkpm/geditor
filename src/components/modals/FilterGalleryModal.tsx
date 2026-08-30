/**
 * Filter Gallery & FX Modal for G-Pro
 * Interactive visual filter studio with live before/after preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Sliders, Check } from 'lucide-react';
import { GProDocument, Layer } from '../../types';
import {
  applyGaussianBlur,
  applyUnsharpMask,
  applyHighPass,
  applyNoise,
  applyFindEdges,
  applyPixelate,
  applySpherize,
  applyTwirl,
  applyVignette,
} from '../../engine/filters';

interface FilterGalleryModalProps {
  document: GProDocument;
  onClose: () => void;
  onApplyFilter: (updatedLayer: Layer, filterName: string) => void;
}

type FilterCategory = 'blur' | 'sharpen' | 'noise' | 'distort' | 'stylize';

export const FilterGalleryModal: React.FC<FilterGalleryModalProps> = ({
  document: doc,
  onClose,
  onApplyFilter,
}) => {
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId) || doc.layers[0];
  const [selectedFilter, setSelectedFilter] = useState<string>('gaussian-blur');
  const [category, setCategory] = useState<FilterCategory>('blur');

  // Filter Parameters State
  const [radius, setRadius] = useState<number>(10);
  const [amount, setAmount] = useState<number>(50);
  const [threshold, setThreshold] = useState<number>(0);
  const [size, setSize] = useState<number>(16);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview canvas with filter applied
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !activeLayer || !activeLayer.canvas) return;

    const sourceCanvas = activeLayer.canvas;
    const pw = Math.min(600, sourceCanvas.width);
    const ph = Math.min(400, sourceCanvas.height);

    canvas.width = pw;
    canvas.height = ph;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(sourceCanvas, 0, 0, pw, ph);

    const imgData = ctx.getImageData(0, 0, pw, ph);
    const data = imgData.data;

    // Apply Filter
    let result = data;
    if (selectedFilter === 'gaussian-blur') {
      result = applyGaussianBlur(data, pw, ph, radius);
    } else if (selectedFilter === 'unsharp-mask') {
      result = applyUnsharpMask(data, pw, ph, amount, radius, threshold);
    } else if (selectedFilter === 'high-pass') {
      result = applyHighPass(data, pw, ph, radius);
    } else if (selectedFilter === 'add-noise') {
      result = applyNoise(data, amount);
    } else if (selectedFilter === 'pixelate') {
      result = applyPixelate(data, pw, ph, size);
    } else if (selectedFilter === 'find-edges') {
      result = applyFindEdges(data, pw, ph);
    } else if (selectedFilter === 'spherize') {
      result = applySpherize(data, pw, ph, amount);
    } else if (selectedFilter === 'twirl') {
      result = applyTwirl(data, pw, ph, amount, Math.min(pw, ph) / 2);
    } else if (selectedFilter === 'vignette') {
      result = applyVignette(data, pw, ph, amount / 100);
    }

    if (result !== data) {
      data.set(result);
    }

    ctx.putImageData(imgData, 0, 0);
  }, [activeLayer, selectedFilter, radius, amount, threshold, size]);

  const handleApply = () => {
    if (!activeLayer || !activeLayer.canvas) return;

    // Create full resolution output canvas
    const outCanvas = document.createElement('canvas');
    outCanvas.width = activeLayer.width;
    outCanvas.height = activeLayer.height;
    const ctx = outCanvas.getContext('2d')!;
    ctx.drawImage(activeLayer.canvas, 0, 0);

    const imgData = ctx.getImageData(0, 0, activeLayer.width, activeLayer.height);
    const data = imgData.data;

    let result = data;
    if (selectedFilter === 'gaussian-blur') {
      result = applyGaussianBlur(data, activeLayer.width, activeLayer.height, radius);
    } else if (selectedFilter === 'unsharp-mask') {
      result = applyUnsharpMask(data, activeLayer.width, activeLayer.height, amount, radius, threshold);
    } else if (selectedFilter === 'high-pass') {
      result = applyHighPass(data, activeLayer.width, activeLayer.height, radius);
    } else if (selectedFilter === 'add-noise') {
      result = applyNoise(data, amount);
    } else if (selectedFilter === 'pixelate') {
      result = applyPixelate(data, activeLayer.width, activeLayer.height, size);
    } else if (selectedFilter === 'find-edges') {
      result = applyFindEdges(data, activeLayer.width, activeLayer.height);
    } else if (selectedFilter === 'spherize') {
      result = applySpherize(data, activeLayer.width, activeLayer.height, amount);
    } else if (selectedFilter === 'twirl') {
      result = applyTwirl(data, activeLayer.width, activeLayer.height, amount, Math.min(activeLayer.width, activeLayer.height) / 2);
    } else if (selectedFilter === 'vignette') {
      result = applyVignette(data, activeLayer.width, activeLayer.height, amount / 100);
    }

    if (result !== data) {
      data.set(result);
    }

    ctx.putImageData(imgData, 0, 0);

    const updatedLayer: Layer = {
      ...activeLayer,
      canvas: outCanvas,
    };

    onApplyFilter(updatedLayer, selectedFilter.replace('-', ' ').toUpperCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Filter Gallery & Special Effects</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Category & Filter List */}
          <div className="w-56 bg-[#15171e] border-r border-[#252834] flex flex-col p-2 gap-1 overflow-y-auto">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
              Filter Categories
            </span>

            {[
              { id: 'gaussian-blur', name: 'Gaussian Blur', cat: 'blur' },
              { id: 'unsharp-mask', name: 'Unsharp Mask Sharpen', cat: 'sharpen' },
              { id: 'high-pass', name: 'High Pass Filter', cat: 'sharpen' },
              { id: 'add-noise', name: 'Add Film Grain / Noise', cat: 'noise' },
              { id: 'pixelate', name: 'Pixelate / Mosaic', cat: 'stylize' },
              { id: 'find-edges', name: 'Find Edges & Sketch', cat: 'stylize' },
              { id: 'spherize', name: 'Spherize (Lens Warp)', cat: 'distort' },
              { id: 'twirl', name: 'Twirl Distortion', cat: 'distort' },
              { id: 'vignette', name: 'Vignette Falloff', cat: 'stylize' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`w-full text-left px-3 py-2 rounded text-[11px] font-medium transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-[#20222b] hover:text-white'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Center Live Preview Canvas */}
          <div className="flex-1 bg-[#101216] p-4 flex items-center justify-center overflow-hidden">
            <div className="relative border border-[#2e3240] rounded shadow-lg overflow-hidden max-h-full max-w-full">
              <canvas ref={previewCanvasRef} className="block max-h-[380px] max-w-full object-contain" />
            </div>
          </div>

          {/* Right Parameters Inspector */}
          <div className="w-64 bg-[#15171e] border-l border-[#252834] p-4 flex flex-col gap-4 overflow-y-auto">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
              Parameters
            </span>

            {/* Radius Slider */}
            {(selectedFilter === 'gaussian-blur' || selectedFilter === 'unsharp-mask' || selectedFilter === 'high-pass') && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Radius:</span>
                  <span className="font-mono text-gray-200">{radius} px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Amount Slider */}
            {(selectedFilter === 'unsharp-mask' || selectedFilter === 'add-noise' || selectedFilter === 'spherize' || selectedFilter === 'twirl' || selectedFilter === 'vignette') && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Amount:</span>
                  <span className="font-mono text-gray-200">{amount}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Pixel Size */}
            {selectedFilter === 'pixelate' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Cell Size:</span>
                  <span className="font-mono text-gray-200">{size} px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="64"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};
