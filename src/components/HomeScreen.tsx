/**
 * G-Pro Home & Welcome Screen
 */

import React from 'react';
import {
  FilePlus,
  FolderOpen,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Layers,
  Sliders,
  Grid,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { GProDocument } from '../types';
import { createSampleProject } from '../engine/projectStorage';

interface HomeScreenProps {
  onNewDocument: () => void;
  onOpenImage: () => void;
  onOpenProject: () => void;
  onLoadSample: (type: 'portrait' | 'landscape' | 'poster') => void;
  recentDocuments: { id: string; name: string; date: string }[];
  onOpenRecent: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewDocument,
  onOpenImage,
  onOpenProject,
  onLoadSample,
  recentDocuments,
  onOpenRecent,
}) => {
  return (
    <div id="gpro-home-screen" className="flex-1 bg-[#121318] text-white flex flex-col overflow-y-auto select-none">
      {/* Top Banner */}
      <div className="border-b border-[#252834] bg-[#161820] px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg">
              G
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">G-PRO PHOTO EDITOR</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-400 border border-blue-800">
              Native Precision Engine
            </span>
          </div>
          <p className="text-gray-400 text-xs max-w-xl leading-relaxed">
            Advanced non-AI professional photo editing & digital darkroom studio. Full layer compositing, Curves, 3-way color grading, Camera RAW development, and spline vector tools.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            id="home-btn-new"
            onClick={onNewDocument}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <FilePlus size={16} />
            <span>New Document</span>
          </button>
          <button
            id="home-btn-open"
            onClick={onOpenImage}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#20222b] hover:bg-[#282c38] text-gray-200 hover:text-white rounded-lg font-semibold text-xs border border-[#2e3240] transition-all cursor-pointer"
          >
            <FolderOpen size={16} />
            <span>Open Image...</span>
          </button>
          <button
            id="home-btn-open-proj"
            onClick={onOpenProject}
            className="flex items-center gap-2 px-3 py-2.5 bg-[#20222b] hover:bg-[#282c38] text-gray-300 hover:text-white rounded-lg font-medium text-xs border border-[#2e3240] transition-all"
            title="Open .gpro Project File"
          >
            <span>.gpro</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="px-8 py-8 flex flex-col gap-8 max-w-6xl">
        {/* Sample Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                Sample Workspaces & Professional Templates
              </h2>
              <p className="text-[11px] text-gray-500">
                Explore fully configured layered documents with non-destructive adjustments, vectors, and grades.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Cinematic Landscape */}
            <div
              id="card-sample-landscape"
              onClick={() => onLoadSample('landscape')}
              className="group bg-[#181a24] hover:bg-[#1f2230] border border-[#282c3c] hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-md flex flex-col gap-3"
            >
              <div className="h-32 rounded-lg bg-gradient-to-tr from-purple-900 via-indigo-900 to-amber-600 flex items-center justify-center relative overflow-hidden border border-[#33384c]">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <span className="text-white font-bold text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                  Landscape RAW
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs group-hover:text-blue-400 transition-colors">
                  Cinematic Mountain Dusk
                </h3>
                <p className="text-gray-400 text-[11px] mt-1 leading-normal">
                  Features non-destructive Tone Curves, 3-Way Color Grading, and dynamic sky gradient recovery.
                </p>
              </div>
            </div>

            {/* 2. Studio Portrait Retouch */}
            <div
              id="card-sample-portrait"
              onClick={() => onLoadSample('portrait')}
              className="group bg-[#181a24] hover:bg-[#1f2230] border border-[#282c3c] hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-md flex flex-col gap-3"
            >
              <div className="h-32 rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center relative overflow-hidden border border-[#33384c]">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <span className="text-white font-bold text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                  Portrait Studio
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs group-hover:text-blue-400 transition-colors">
                  Studio Portrait & Lighting
                </h3>
                <p className="text-gray-400 text-[11px] mt-1 leading-normal">
                  Configured for frequency separation, spot healing, and dodge & burn luminance sculpting.
                </p>
              </div>
            </div>

            {/* 3. Graphic Design Poster */}
            <div
              id="card-sample-poster"
              onClick={() => onLoadSample('poster')}
              className="group bg-[#181a24] hover:bg-[#1f2230] border border-[#282c3c] hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-md flex flex-col gap-3"
            >
              <div className="h-32 rounded-lg bg-gradient-to-tr from-blue-950 via-slate-900 to-purple-950 flex items-center justify-center relative overflow-hidden border border-[#33384c]">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <span className="text-white font-bold text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                  Graphic Design
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs group-hover:text-blue-400 transition-colors">
                  Creative Horizons Editorial
                </h3>
                <p className="text-gray-400 text-[11px] mt-1 leading-normal">
                  Vector shape geometry, typography hierarchy, screen blend modes, and stroke effects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Capabilities Grid */}
        <div className="pt-4 border-t border-[#252834]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
            Professional Engine Highlights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#161820] p-3 rounded-lg border border-[#252834] flex flex-col gap-1.5">
              <Sliders size={16} className="text-amber-400" />
              <span className="font-semibold text-gray-200">Non-Destructive Stack</span>
              <span className="text-[11px] text-gray-400">Curves, Levels, 8-Band HSL, Color Balance, and Monochrome layers.</span>
            </div>
            <div className="bg-[#161820] p-3 rounded-lg border border-[#252834] flex flex-col gap-1.5">
              <Camera size={16} className="text-sky-400" />
              <span className="font-semibold text-gray-200">Camera RAW Darkroom</span>
              <span className="text-[11px] text-gray-400">Kelvin white balance, highlights recovery, and lens distortion fixes.</span>
            </div>
            <div className="bg-[#161820] p-3 rounded-lg border border-[#252834] flex flex-col gap-1.5">
              <Layers size={16} className="text-purple-400" />
              <span className="font-semibold text-gray-200">27 Blend Modes</span>
              <span className="text-[11px] text-gray-400">Full Porter-Duff compositing with masks and clipping layers.</span>
            </div>
            <div className="bg-[#161820] p-3 rounded-lg border border-[#252834] flex flex-col gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="font-semibold text-gray-200">100% Local & Private</span>
              <span className="text-[11px] text-gray-400">Zero cloud AI processing. Pure client-side mathematical algorithms.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
