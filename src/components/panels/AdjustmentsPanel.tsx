/**
 * Professional Adjustments Studio Panel for G-Pro
 * Curves, Levels, Basic Light/Tone, 8-Band HSL, Color Grading Wheels, B&W Mixer
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Sliders,
  Sparkles,
  Palette,
  Eye,
  RotateCcw,
  PlusCircle,
  Circle,
} from 'lucide-react';
import {
  GProDocument,
  BasicAdjustments,
  CurvesAdjustment,
  LevelsAdjustment,
  LevelsChannel,
  HSLAdjustment,
  ColorGradingAdjustment,
  BlackAndWhiteAdjustment,
  CurvePoint,
  Layer,
} from '../../types';

interface AdjustmentsPanelProps {
  document: GProDocument | null;
  onUpdateDocument: (doc: GProDocument, recordHistory?: boolean, desc?: string) => void;
  onAddAdjustmentLayer?: (type: string, data: any) => void;
}

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  document: doc,
  onUpdateDocument,
  onAddAdjustmentLayer,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'curves' | 'levels' | 'hsl' | 'grading' | 'bw'>('basic');
  const activeLayer = doc?.layers?.find((l) => l.id === doc.activeLayerId);

  // Local state for interactive editing if active layer has adjustments or create new
  const [basic, setBasic] = useState<BasicAdjustments>(
    activeLayer?.basicAdjustments || {
      exposure: 0,
      brightness: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      saturation: 0,
      clarity: 0,
      texture: 0,
      dehaze: 0,
      sharpness: 0,
      noiseReduction: 0,
    }
  );

  const [curvesChannel, setCurvesChannel] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb');
  const [curves, setCurves] = useState<CurvesAdjustment>(
    activeLayer?.curves || {
      rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    }
  );

  const [levelsChannel, setLevelsChannel] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb');
  const [levels, setLevels] = useState<LevelsAdjustment>(
    activeLayer?.levels || {
      rgb: { blackPoint: 0, gamma: 1.0, whitePoint: 255, outputBlack: 0, outputWhite: 255 },
      red: { blackPoint: 0, gamma: 1.0, whitePoint: 255, outputBlack: 0, outputWhite: 255 },
      green: { blackPoint: 0, gamma: 1.0, whitePoint: 255, outputBlack: 0, outputWhite: 255 },
      blue: { blackPoint: 0, gamma: 1.0, whitePoint: 255, outputBlack: 0, outputWhite: 255 },
    }
  );

  const [hslMode, setHslMode] = useState<'hue' | 'saturation' | 'luminance'>('saturation');
  const [hsl, setHsl] = useState<HSLAdjustment>(
    activeLayer?.hsl || {
      reds: { hue: 0, saturation: 0, luminance: 0 },
      oranges: { hue: 0, saturation: 0, luminance: 0 },
      yellows: { hue: 0, saturation: 0, luminance: 0 },
      greens: { hue: 0, saturation: 0, luminance: 0 },
      aquas: { hue: 0, saturation: 0, luminance: 0 },
      blues: { hue: 0, saturation: 0, luminance: 0 },
      purples: { hue: 0, saturation: 0, luminance: 0 },
      magentas: { hue: 0, saturation: 0, luminance: 0 },
    }
  );

  const [colorGrading, setColorGrading] = useState<ColorGradingAdjustment>(
    activeLayer?.colorGrading || {
      shadows: { hue: 0, saturation: 0, luminance: 0 },
      midtones: { hue: 0, saturation: 0, luminance: 0 },
      highlights: { hue: 0, saturation: 0, luminance: 0 },
      global: { hue: 0, saturation: 0, luminance: 0 },
      blending: 50,
      balance: 0,
    }
  );

  const [bw, setBw] = useState<BlackAndWhiteAdjustment>(
    activeLayer?.blackAndWhite || {
      reds: 40,
      yellows: 60,
      greens: 40,
      cyans: 60,
      blues: 20,
      magentas: 80,
    }
  );

  // Sync state if active layer changes
  useEffect(() => {
    if (activeLayer) {
      if (activeLayer.basicAdjustments) setBasic(activeLayer.basicAdjustments);
      if (activeLayer.curves) setCurves(activeLayer.curves);
      if (activeLayer.levels) setLevels(activeLayer.levels);
      if (activeLayer.hsl) setHsl(activeLayer.hsl);
      if (activeLayer.colorGrading) setColorGrading(activeLayer.colorGrading);
      if (activeLayer.blackAndWhite) setBw(activeLayer.blackAndWhite);
    }
  }, [activeLayer]);

  // Apply changes to active layer or as a new adjustment
  const handleBasicChange = (key: keyof BasicAdjustments, value: number) => {
    const updated = { ...basic, [key]: value };
    setBasic(updated);

    if (activeLayer) {
      const updatedLayers = doc.layers.map((l) =>
        l.id === activeLayer.id ? { ...l, basicAdjustments: updated } : l
      );
      onUpdateDocument({ ...doc, layers: updatedLayers });
    }
  };

  const handleLevelsChange = (key: keyof LevelsChannel, value: number) => {
    const currentChannel = levels[levelsChannel];
    const updatedChannel = { ...currentChannel, [key]: value };
    const updated = { ...levels, [levelsChannel]: updatedChannel };
    setLevels(updated);

    if (activeLayer) {
      const updatedLayers = doc.layers.map((l) =>
        l.id === activeLayer.id ? { ...l, levels: updated } : l
      );
      onUpdateDocument({ ...doc, layers: updatedLayers });
    }
  };

  // Curves Canvas Editor
  const curvesCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = curvesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);

    // Background Grid
    ctx.strokeStyle = '#282b38';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const pos = (size / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pos, 0); ctx.lineTo(pos, size);
      ctx.moveTo(0, pos); ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Diagonal reference line
    ctx.strokeStyle = '#383d4e';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve Line
    const pts = curves[curvesChannel];
    const lineColorMap = {
      rgb: '#ffffff',
      red: '#ef4444',
      green: '#22c55e',
      blue: '#3b82f6',
    };

    ctx.strokeStyle = lineColorMap[curvesChannel];
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < pts.length; i++) {
      const cx = (pts[i].x / 255) * size;
      const cy = size - (pts[i].y / 255) * size;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Curve Control Points
    for (let i = 0; i < pts.length; i++) {
      const cx = (pts[i].x / 255) * size;
      const cy = size - (pts[i].y / 255) * size;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [curves, curvesChannel]);

  const handleCurvesPreset = (preset: 'linear' | 'contrast' | 'lift-shadows' | 'high-key') => {
    let newPts: CurvePoint[] = [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    if (preset === 'contrast') {
      newPts = [{ x: 0, y: 0 }, { x: 64, y: 48 }, { x: 192, y: 208 }, { x: 255, y: 255 }];
    } else if (preset === 'lift-shadows') {
      newPts = [{ x: 0, y: 35 }, { x: 128, y: 135 }, { x: 255, y: 255 }];
    } else if (preset === 'high-key') {
      newPts = [{ x: 0, y: 0 }, { x: 100, y: 140 }, { x: 255, y: 255 }];
    }

    const updated = { ...curves, [curvesChannel]: newPts };
    setCurves(updated);

    if (activeLayer) {
      const updatedLayers = doc.layers.map((l) =>
        l.id === activeLayer.id ? { ...l, curves: updated } : l
      );
      onUpdateDocument({ ...doc, layers: updatedLayers }, true, 'Curves Preset');
    }
  };

  const createAdjustmentLayer = (type: string) => {
    let layerData: any = {};
    if (type === 'basic') layerData = { basicAdjustments: basic };
    if (type === 'curves') layerData = { curves };
    if (type === 'levels') layerData = { levels };
    if (type === 'hsl') layerData = { hsl };
    if (type === 'color-grading') layerData = { colorGrading };
    if (type === 'black-and-white') layerData = { blackAndWhite: bw };

    onAddAdjustmentLayer(type, layerData);
  };

  return (
    <div id="gpro-adjustments-panel" className="flex flex-col h-full bg-[#181a22] text-xs select-none">
      {/* Tab Navigation */}
      <div className="flex items-center bg-[#14161d] border-b border-[#252834] overflow-x-auto px-1 py-1 gap-1">
        <button
          id="tab-adj-basic"
          onClick={() => setActiveTab('basic')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'basic' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          Light & Color
        </button>
        <button
          id="tab-adj-curves"
          onClick={() => setActiveTab('curves')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'curves' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          Curves
        </button>
        <button
          id="tab-adj-levels"
          onClick={() => setActiveTab('levels')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'levels' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          Levels
        </button>
        <button
          id="tab-adj-hsl"
          onClick={() => setActiveTab('hsl')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'hsl' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          HSL
        </button>
        <button
          id="tab-adj-grading"
          onClick={() => setActiveTab('grading')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'grading' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          Grading
        </button>
        <button
          id="tab-adj-bw"
          onClick={() => setActiveTab('bw')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeTab === 'bw' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#20222a]'
          }`}
        >
          B&W
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* 1. BASIC LIGHT & COLOR TAB */}
        {activeTab === 'basic' && (
          <div className="flex flex-col gap-3">
            {/* Tone Section */}
            <div>
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Tone & Exposure
              </span>
              <div className="flex flex-col gap-2">
                {/* Exposure */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Exposure</label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.05"
                    value={basic.exposure}
                    onChange={(e) => handleBasicChange('exposure', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.exposure > 0 ? `+${basic.exposure.toFixed(2)}` : basic.exposure.toFixed(2)} EV
                  </span>
                </div>

                {/* Contrast */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Contrast</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.contrast}
                    onChange={(e) => handleBasicChange('contrast', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.contrast}
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Highlights</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.highlights}
                    onChange={(e) => handleBasicChange('highlights', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.highlights}
                  </span>
                </div>

                {/* Shadows */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Shadows</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.shadows}
                    onChange={(e) => handleBasicChange('shadows', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.shadows}
                  </span>
                </div>

                {/* Whites */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Whites</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.whites}
                    onChange={(e) => handleBasicChange('whites', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.whites}
                  </span>
                </div>

                {/* Blacks */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Blacks</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.blacks}
                    onChange={(e) => handleBasicChange('blacks', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.blacks}
                  </span>
                </div>
              </div>
            </div>

            {/* Color & Presence */}
            <div className="pt-2 border-t border-[#252834]">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Color & Presence
              </span>
              <div className="flex flex-col gap-2">
                {/* Temperature */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Temp</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.temperature}
                    onChange={(e) => handleBasicChange('temperature', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.temperature}
                  </span>
                </div>

                {/* Tint */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Tint</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.tint}
                    onChange={(e) => handleBasicChange('tint', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.tint}
                  </span>
                </div>

                {/* Vibrance */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Vibrance</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.vibrance}
                    onChange={(e) => handleBasicChange('vibrance', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.vibrance}
                  </span>
                </div>

                {/* Saturation */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Saturation</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.saturation}
                    onChange={(e) => handleBasicChange('saturation', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.saturation}
                  </span>
                </div>

                {/* Clarity */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Clarity</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={basic.clarity}
                    onChange={(e) => handleBasicChange('clarity', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-10 text-right">
                    {basic.clarity}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => createAdjustmentLayer('basic')}
              className="mt-2 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}

        {/* 2. CURVES TAB */}
        {activeTab === 'curves' && (
          <div className="flex flex-col gap-3">
            {/* Channel Buttons */}
            <div className="flex items-center justify-between bg-[#15171e] p-1 rounded border border-[#252834]">
              {(['rgb', 'red', 'green', 'blue'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setCurvesChannel(ch)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold uppercase transition-all ${
                    curvesChannel === ch
                      ? ch === 'red'
                        ? 'bg-red-600 text-white'
                        : ch === 'green'
                        ? 'bg-emerald-600 text-white'
                        : ch === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Curves Interactive Canvas */}
            <div className="w-full aspect-square bg-[#12141a] border border-[#2e3240] rounded flex items-center justify-center p-1">
              <canvas
                ref={curvesCanvasRef}
                width={220}
                height={220}
                className="w-full h-full block rounded cursor-crosshair"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => handleCurvesPreset('linear')}
                className="flex-1 py-1 bg-[#20222a] hover:bg-[#2a2d3a] rounded text-[10px] text-gray-300"
              >
                Reset
              </button>
              <button
                onClick={() => handleCurvesPreset('contrast')}
                className="flex-1 py-1 bg-[#20222a] hover:bg-[#2a2d3a] rounded text-[10px] text-gray-300"
              >
                S-Contrast
              </button>
              <button
                onClick={() => handleCurvesPreset('lift-shadows')}
                className="flex-1 py-1 bg-[#20222a] hover:bg-[#2a2d3a] rounded text-[10px] text-gray-300"
              >
                Matte
              </button>
              <button
                onClick={() => handleCurvesPreset('high-key')}
                className="flex-1 py-1 bg-[#20222a] hover:bg-[#2a2d3a] rounded text-[10px] text-gray-300"
              >
                High Key
              </button>
            </div>

            <button
              onClick={() => createAdjustmentLayer('curves')}
              className="mt-1 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}

        {/* 3. LEVELS TAB */}
        {activeTab === 'levels' && (
          <div className="flex flex-col gap-3">
            {/* Channel Buttons */}
            <div className="flex items-center justify-between bg-[#15171e] p-1 rounded border border-[#252834]">
              {(['rgb', 'red', 'green', 'blue'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setLevelsChannel(ch)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold uppercase transition-all ${
                    levelsChannel === ch
                      ? ch === 'red'
                        ? 'bg-red-600 text-white'
                        : ch === 'green'
                        ? 'bg-emerald-600 text-white'
                        : ch === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
              Input Levels ({levelsChannel})
            </span>

            {/* Black Point */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-gray-400 w-20">Shadows</label>
              <input
                type="range"
                min="0"
                max="255"
                value={levels[levelsChannel].blackPoint}
                onChange={(e) => handleLevelsChange('blackPoint', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                {levels[levelsChannel].blackPoint}
              </span>
            </div>

            {/* Midtones Gamma */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-gray-400 w-20">Midtones</label>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={levels[levelsChannel].gamma}
                onChange={(e) => handleLevelsChange('gamma', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                {levels[levelsChannel].gamma.toFixed(2)}
              </span>
            </div>

            {/* White Point */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-gray-400 w-20">Highlights</label>
              <input
                type="range"
                min="0"
                max="255"
                value={levels[levelsChannel].whitePoint}
                onChange={(e) => handleLevelsChange('whitePoint', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                {levels[levelsChannel].whitePoint}
              </span>
            </div>

            <div className="pt-2 border-t border-[#252834]">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Output Levels
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Blacks</label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={levels[levelsChannel].outputBlack}
                    onChange={(e) => handleLevelsChange('outputBlack', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                    {levels[levelsChannel].outputBlack}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-400 w-20">Whites</label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={levels[levelsChannel].outputWhite}
                    onChange={(e) => handleLevelsChange('outputWhite', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                    {levels[levelsChannel].outputWhite}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => createAdjustmentLayer('levels')}
              className="mt-2 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}

        {/* 4. HSL TAB */}
        {activeTab === 'hsl' && (
          <div className="flex flex-col gap-3">
            {/* Mode: Hue, Saturation, Luminance */}
            <div className="flex items-center bg-[#15171e] p-1 rounded border border-[#252834]">
              {(['hue', 'saturation', 'luminance'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setHslMode(m)}
                  className={`flex-1 py-1 rounded text-[11px] font-medium capitalize transition-all ${
                    hslMode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* 8 Color Sliders */}
            {(
              [
                { key: 'reds', label: 'Reds', color: '#ef4444' },
                { key: 'oranges', label: 'Oranges', color: '#f97316' },
                { key: 'yellows', label: 'Yellows', color: '#eab308' },
                { key: 'greens', label: 'Greens', color: '#22c55e' },
                { key: 'aquas', label: 'Aquas', color: '#06b6d4' },
                { key: 'blues', label: 'Blues', color: '#3b82f6' },
                { key: 'purples', label: 'Purples', color: '#a855f7' },
                { key: 'magentas', label: 'Magentas', color: '#ec4899' },
              ] as const
            ).map((c) => {
              const currentVal = (hsl as any)[c.key][hslMode];
              return (
                <div key={c.key} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 w-20">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-gray-300">{c.label}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentVal}
                    onChange={(e) => {
                      const updated = {
                        ...hsl,
                        [c.key]: {
                          ...(hsl as any)[c.key],
                          [hslMode]: parseInt(e.target.value),
                        },
                      };
                      setHsl(updated);
                      if (activeLayer) {
                        const updatedLayers = doc.layers.map((l) =>
                          l.id === activeLayer.id ? { ...l, hsl: updated } : l
                        );
                        onUpdateDocument({ ...doc, layers: updatedLayers });
                      }
                    }}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                    {currentVal}
                  </span>
                </div>
              );
            })}

            <button
              onClick={() => createAdjustmentLayer('hsl')}
              className="mt-2 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}

        {/* 5. COLOR GRADING TAB */}
        {activeTab === 'grading' && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
              3-Way Color Wheels
            </span>

            {/* Shadows */}
            <div className="bg-[#15171e] p-2.5 rounded border border-[#252834] flex flex-col gap-2">
              <span className="text-[11px] font-medium text-sky-400">Shadows</span>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] text-gray-400 w-12">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={colorGrading.shadows.hue}
                  onChange={(e) =>
                    setColorGrading({
                      ...colorGrading,
                      shadows: { ...colorGrading.shadows, hue: parseInt(e.target.value) },
                    })
                  }
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                  {colorGrading.shadows.hue}°
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] text-gray-400 w-12">Amount</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={colorGrading.shadows.saturation}
                  onChange={(e) =>
                    setColorGrading({
                      ...colorGrading,
                      shadows: { ...colorGrading.shadows, saturation: parseInt(e.target.value) },
                    })
                  }
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                  {colorGrading.shadows.saturation}
                </span>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-[#15171e] p-2.5 rounded border border-[#252834] flex flex-col gap-2">
              <span className="text-[11px] font-medium text-amber-400">Highlights</span>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] text-gray-400 w-12">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={colorGrading.highlights.hue}
                  onChange={(e) =>
                    setColorGrading({
                      ...colorGrading,
                      highlights: { ...colorGrading.highlights, hue: parseInt(e.target.value) },
                    })
                  }
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                  {colorGrading.highlights.hue}°
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] text-gray-400 w-12">Amount</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={colorGrading.highlights.saturation}
                  onChange={(e) =>
                    setColorGrading({
                      ...colorGrading,
                      highlights: { ...colorGrading.highlights, saturation: parseInt(e.target.value) },
                    })
                  }
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                  {colorGrading.highlights.saturation}
                </span>
              </div>
            </div>

            <button
              onClick={() => createAdjustmentLayer('color-grading')}
              className="mt-2 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}

        {/* 6. BLACK & WHITE TAB */}
        {activeTab === 'bw' && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
              Monochrome Channel Mixer
            </span>
            {(
              [
                { key: 'reds', label: 'Reds' },
                { key: 'yellows', label: 'Yellows' },
                { key: 'greens', label: 'Greens' },
                { key: 'cyans', label: 'Cyans' },
                { key: 'blues', label: 'Blues' },
                { key: 'magentas', label: 'Magentas' },
              ] as const
            ).map((ch) => (
              <div key={ch.key} className="flex items-center justify-between gap-2">
                <label className="text-[11px] text-gray-400 w-20">{ch.label}</label>
                <input
                  type="range"
                  min="-100"
                  max="200"
                  value={(bw as any)[ch.key]}
                  onChange={(e) => {
                    const updated = { ...bw, [ch.key]: parseInt(e.target.value) };
                    setBw(updated);
                    if (activeLayer) {
                      const updatedLayers = doc.layers.map((l) =>
                        l.id === activeLayer.id ? { ...l, blackAndWhite: updated } : l
                      );
                      onUpdateDocument({ ...doc, layers: updatedLayers });
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
                  {(bw as any)[ch.key]}%
                </span>
              </div>
            ))}

            <button
              onClick={() => createAdjustmentLayer('black-and-white')}
              className="mt-2 w-full py-1.5 bg-[#202431] hover:bg-blue-600 text-gray-200 hover:text-white rounded border border-[#2e3240] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add as Adjustment Layer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
