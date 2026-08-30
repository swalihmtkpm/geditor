/**
 * Camera RAW Digital Darkroom Studio Modal for G-Pro
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Sun, Sliders, Sparkles, Check, Aperture } from 'lucide-react';
import { GProDocument, Layer } from '../../types';
import {
  RawDevelopmentSettings,
  defaultRawSettings,
  developRawImage,
} from '../../engine/rawEngine';

interface RawDevelopmentModalProps {
  document: GProDocument;
  onClose: () => void;
  onApplyRaw: (developedLayer: Layer) => void;
}

export const RawDevelopmentModal: React.FC<RawDevelopmentModalProps> = ({
  document: doc,
  onClose,
  onApplyRaw,
}) => {
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId) || doc.layers[0];
  const [settings, setSettings] = useState<RawDevelopmentSettings>(defaultRawSettings);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const updateSetting = (key: keyof RawDevelopmentSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!activeLayer || !activeLayer.canvas || !previewCanvasRef.current) return;

    // Fast preview downsample
    const sampleW = Math.min(activeLayer.canvas.width, 600);
    const sampleH = Math.min(activeLayer.canvas.height, 400);

    const temp = document.createElement('canvas');
    temp.width = sampleW;
    temp.height = sampleH;
    const tCtx = temp.getContext('2d')!;
    tCtx.drawImage(activeLayer.canvas, 0, 0, sampleW, sampleH);

    const developed = developRawImage(temp, settings);

    const pCanvas = previewCanvasRef.current;
    pCanvas.width = sampleW;
    pCanvas.height = sampleH;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.drawImage(developed, 0, 0);
  }, [activeLayer, settings]);

  const handleDevelop = () => {
    if (!activeLayer || !activeLayer.canvas) return;

    const developedFull = developRawImage(activeLayer.canvas, settings);

    const updatedLayer: Layer = {
      ...activeLayer,
      canvas: developedFull,
    };

    onApplyRaw(updatedLayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Aperture size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Camera RAW Digital Darkroom</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Live Preview Canvas */}
          <div className="flex-1 bg-[#101216] p-4 flex items-center justify-center overflow-hidden">
            <div className="border border-[#2e3240] rounded shadow-lg overflow-hidden max-h-full max-w-full">
              <canvas ref={previewCanvasRef} className="block max-h-[440px] max-w-full object-contain" />
            </div>
          </div>

          {/* Development Controls Inspector */}
          <div className="w-80 bg-[#15171e] border-l border-[#252834] p-4 flex flex-col gap-4 overflow-y-auto">
            {/* White Balance Section */}
            <div>
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                White Balance
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Kelvin</label>
                  <input
                    type="range"
                    min="2000"
                    max="12000"
                    step="50"
                    value={settings.kelvinTemp}
                    onChange={(e) => updateSetting('kelvinTemp', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.kelvinTemp}K
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Tint</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.tint}
                    onChange={(e) => updateSetting('tint', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.tint}
                  </span>
                </div>
              </div>
            </div>

            {/* Exposure & Tone */}
            <div className="pt-2 border-t border-[#252834]">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Tone Recovery
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Exposure</label>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={settings.exposure}
                    onChange={(e) => updateSetting('exposure', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.exposure > 0 ? `+${settings.exposure.toFixed(1)}` : settings.exposure.toFixed(1)} EV
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Highlights</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.highlights}
                    onChange={(e) => updateSetting('highlights', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.highlights}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Shadows</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.shadows}
                    onChange={(e) => updateSetting('shadows', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.shadows}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Clarity</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.clarity}
                    onChange={(e) => updateSetting('clarity', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.clarity}
                  </span>
                </div>
              </div>
            </div>

            {/* Lens Corrections */}
            <div className="pt-2 border-t border-[#252834]">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Optics & Geometry
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Distortion</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.lensDistortion}
                    onChange={(e) => updateSetting('lensDistortion', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.lensDistortion}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Vignette Fix</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.vignetteCorrection}
                    onChange={(e) => updateSetting('vignetteCorrection', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-12 text-right">
                    {settings.vignetteCorrection}
                  </span>
                </div>
              </div>
            </div>
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
            onClick={handleDevelop}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors"
          >
            Develop Image
          </button>
        </div>
      </div>
    </div>
  );
};
