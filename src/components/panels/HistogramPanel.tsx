/**
 * Real-Time Histogram & EXIF Metadata Panel for G-Pro
 */

import React, { useRef, useEffect, useState } from 'react';
import { Activity, AlertTriangle, Info } from 'lucide-react';
import { GProDocument } from '../../types';
import { computeHistogram, HistogramData } from '../../engine/histogram';

interface HistogramPanelProps {
  document: GProDocument | null;
}

export const HistogramPanel: React.FC<HistogramPanelProps> = ({ document: doc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channelMode, setChannelMode] = useState<'rgb' | 'lum' | 'r' | 'g' | 'b'>('rgb');
  const [stats, setStats] = useState<{ shadowClip: number; highlightClip: number; meanLum: number }>({
    shadowClip: 0,
    highlightClip: 0,
    meanLum: 128,
  });

  if (!doc) {
    return (
      <div className="flex flex-col h-full bg-[#181a22] text-xs p-4 items-center justify-center text-gray-500">
        No active document
      </div>
    );
  }

  useEffect(() => {
    // Grab main canvas element from DOM
    const mainCanvas = window.document.getElementById('gpro-main-canvas') as HTMLCanvasElement;
    const histCanvas = canvasRef.current;
    if (!mainCanvas || !histCanvas) return;

    const data: HistogramData = computeHistogram(mainCanvas);
    setStats({
      shadowClip: data.shadowClipping,
      highlightClip: data.highlightClipping,
      meanLum: data.meanLum,
    });

    const ctx = histCanvas.getContext('2d')!;
    const w = histCanvas.width;
    const h = histCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = '#252834';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = (w / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
      ctx.stroke();
    }

    const drawChannel = (arr: Uint32Array, color: string, composite: GlobalCompositeOperation = 'source-over') => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalCompositeOperation = composite;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const count = arr[i];
        const barH = (count / data.maxCount) * h;
        const y = h - barH;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    if (channelMode === 'rgb') {
      drawChannel(data.r, 'rgba(239, 68, 68, 0.5)', 'screen');
      drawChannel(data.g, 'rgba(34, 197, 94, 0.5)', 'screen');
      drawChannel(data.b, 'rgba(59, 130, 246, 0.5)', 'screen');
    } else if (channelMode === 'lum') {
      drawChannel(data.lum, 'rgba(255, 255, 255, 0.7)');
    } else if (channelMode === 'r') {
      drawChannel(data.r, '#ef4444');
    } else if (channelMode === 'g') {
      drawChannel(data.g, '#22c55e');
    } else if (channelMode === 'b') {
      drawChannel(data.b, '#3b82f6');
    }
  }, [doc, channelMode]);

  return (
    <div id="gpro-histogram-panel" className="flex flex-col h-full bg-[#181a22] text-xs p-3 overflow-y-auto gap-3 select-none">
      {/* Header & Channel Selector */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
          Histogram
        </span>
        <div className="flex items-center bg-[#14161d] p-0.5 rounded border border-[#252834]">
          {(['rgb', 'lum', 'r', 'g', 'b'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setChannelMode(m)}
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                channelMode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Histogram Canvas */}
      <div className="w-full h-28 bg-[#12141a] rounded border border-[#252834] overflow-hidden p-1 flex items-center justify-center">
        <canvas ref={canvasRef} width={256} height={100} className="w-full h-full block" />
      </div>

      {/* Clipping Analysis */}
      <div className="flex items-center justify-between text-[11px] bg-[#14161d] p-2 rounded border border-[#252834]">
        <div className="flex items-center gap-1.5 text-blue-400">
          <AlertTriangle size={12} />
          <span>Shadows: {stats.shadowClip.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <AlertTriangle size={12} />
          <span>Highlights: {stats.highlightClip.toFixed(1)}%</span>
        </div>
      </div>

      {/* EXIF Metadata Summary */}
      {doc.metadata && (
        <div className="pt-2 border-t border-[#252834] flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block mb-1">
            Camera & Lens EXIF
          </span>
          <div className="flex flex-col gap-1 text-[11px] bg-[#14161d] p-2 rounded border border-[#252834] font-mono text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">Camera:</span>
              <span>{doc.metadata.camera || 'Digital RAW'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lens:</span>
              <span>{doc.metadata.lens || 'Prime Lens'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Settings:</span>
              <span>
                ISO {doc.metadata.iso} • {doc.metadata.aperture} • {doc.metadata.shutterSpeed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Resolution:</span>
              <span>{doc.metadata.dimensions} ({doc.metadata.megapixels})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
