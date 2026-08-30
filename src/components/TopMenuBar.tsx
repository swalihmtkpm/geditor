/**
 * Top Menu Bar Component for G-Pro Photo Editor
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Save,
  Download,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  Search,
  Sliders,
  Layers,
  Sparkles,
  Command,
  SunMoon,
  Printer,
  FilePlus,
  RotateCw,
  Crop,
  Grid,
} from 'lucide-react';
import { GProDocument, ToolType } from '../types';

interface TopMenuBarProps {
  document: GProDocument | null;
  onNew?: () => void;
  onNewDocument?: () => void;
  onOpen?: () => void;
  onOpenImage?: () => void;
  onOpenProject?: () => void;
  onSave?: () => void;
  onSaveProject?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onFitCanvas?: () => void;
  onActualPixels?: () => void;
  beforeAfterMode?: 'off' | 'split' | 'side-by-side';
  onToggleBeforeAfter?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleCommandPalette?: () => void;
  onOpenFilterGallery?: () => void;
  onToggleFilterModal?: () => void;
  onOpenRawDevelopment?: () => void;
  onToggleRawModal?: () => void;
  onOpenImageSize?: () => void;
  onToggleImageSizeModal?: () => void;
  onOpenCanvasSize?: () => void;
  onToggleCanvasSizeModal?: () => void;
  onOpenBatchProcessing?: () => void;
  onOpenBatch?: () => void;
  onOpenCollageMode?: () => void;
  onOpenCollage?: () => void;
  onOpenSettings?: () => void;
  onToggleSettingsModal?: () => void;
  onOpenShortcuts?: () => void;
  onToggleShortcutsModal?: () => void;
  onAddLayer?: (type: any) => void;
  onDuplicateLayer?: () => void;
  onDeleteLayer?: () => void;
  onMergeLayers?: () => void;
  onFlattenImage?: () => void;
  onSelectAll?: () => void;
  onDeselect?: () => void;
  onInvertSelection?: () => void;
  onRotateCanvas?: (deg: number) => void;
  onFlipCanvas?: (dir: 'horizontal' | 'vertical') => void;
  activeTool?: ToolType;
  setActiveTool?: (tool: ToolType) => void;
  onGoHome?: () => void;
  onToggleHome?: () => void;
  showRulers?: boolean;
  setShowRulers?: (show: boolean | ((prev: boolean) => boolean)) => void;
  showGuides?: boolean;
  setShowGuides?: (show: boolean | ((prev: boolean) => boolean)) => void;
  showGrid?: boolean;
  setShowGrid?: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  document: doc,
  onNew,
  onNewDocument = onNew,
  onOpen,
  onOpenImage = onOpen,
  onOpenProject,
  onSave,
  onSaveProject = onSave,
  onExport,
  onPrint,
  onUndo,
  onRedo,
  canUndo = doc ? doc.historyIndex > 0 : false,
  canRedo = doc ? doc.historyIndex < doc.history.length - 1 : false,
  zoom = doc?.zoom ?? 1,
  onZoomChange,
  onFitCanvas,
  onActualPixels,
  beforeAfterMode = 'off',
  onToggleBeforeAfter,
  onOpenCommandPalette,
  onToggleCommandPalette = onOpenCommandPalette,
  onOpenFilterGallery,
  onToggleFilterModal = onOpenFilterGallery,
  onOpenRawDevelopment,
  onToggleRawModal = onOpenRawDevelopment,
  onOpenImageSize,
  onToggleImageSizeModal = onOpenImageSize,
  onOpenCanvasSize,
  onToggleCanvasSizeModal = onOpenCanvasSize,
  onOpenBatchProcessing,
  onOpenBatch = onOpenBatchProcessing,
  onOpenCollageMode,
  onOpenCollage = onOpenCollageMode,
  onOpenSettings,
  onToggleSettingsModal = onOpenSettings,
  onOpenShortcuts,
  onToggleShortcutsModal = onOpenShortcuts,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMergeLayers,
  onFlattenImage,
  onSelectAll,
  onDeselect,
  onInvertSelection,
  onRotateCanvas,
  onFlipCanvas,
  onGoHome,
  onToggleHome = onGoHome,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenuAndRun = (action?: () => void) => {
    if (action) action();
    setOpenMenu(null);
  };

  return (
    <header
      id="gpro-top-menubar"
      ref={menuBarRef}
      className="h-10 bg-[#16181f] border-b border-[#252834] flex items-center justify-between px-2 text-xs text-[#c2c6d4] select-none z-50 shrink-0"
    >
      {/* Left: Brand Logo & Menus */}
      <div className="flex items-center gap-1">
        {/* G-Pro App Badge */}
        <button
          id="btn-app-logo"
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-2 py-1 mr-1 rounded font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
          title="Back to Home / Welcome Screen"
        >
          <div className="w-3.5 h-3.5 rounded bg-white text-blue-700 flex items-center justify-center text-[9px] font-black">
            G
          </div>
          <span className="tracking-wider text-[11px] font-extrabold">G-PRO</span>
        </button>

        {/* Menu Items */}
        <div className="flex items-center">
          {/* File Menu */}
          <div className="relative">
            <button
              id="menu-file-btn"
              onClick={() => handleMenuClick('file')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'file' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              File
            </button>
            {openMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-file-new"
                  onClick={() => closeMenuAndRun(onNewDocument)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>New Project...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+N</span>
                </button>
                <button
                  id="menu-file-open-img"
                  onClick={() => closeMenuAndRun(onOpenImage)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Open Image...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+O</span>
                </button>
                <button
                  id="menu-file-open-proj"
                  onClick={() => closeMenuAndRun(onOpenProject)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Open G-Pro Project (.gpro)...</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-file-raw"
                  onClick={() => closeMenuAndRun(onOpenRawDevelopment)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Camera RAW Darkroom...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Shift+R</span>
                </button>
                <button
                  id="menu-file-batch"
                  onClick={() => closeMenuAndRun(onOpenBatchProcessing)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  <span>Batch Process Images...</span>
                </button>
                <button
                  id="menu-file-collage"
                  onClick={() => closeMenuAndRun(onOpenCollageMode)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  <span>Collage Designer Studio...</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-file-save"
                  onClick={() => closeMenuAndRun(onSaveProject)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Save Project (.gpro)</span>
                  <span className="text-[10px] text-gray-400">Ctrl+S</span>
                </button>
                <button
                  id="menu-file-export"
                  onClick={() => closeMenuAndRun(onExport)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Export Image As...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Shift+E</span>
                </button>
                <button
                  id="menu-file-print"
                  onClick={() => closeMenuAndRun(onPrint)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Print Setup...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              id="menu-edit-btn"
              onClick={() => handleMenuClick('edit')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'edit' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              Edit
            </button>
            {openMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-edit-undo"
                  disabled={!canUndo}
                  onClick={() => closeMenuAndRun(onUndo)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white disabled:opacity-40 flex justify-between items-center"
                >
                  <span>Undo</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Z</span>
                </button>
                <button
                  id="menu-edit-redo"
                  disabled={!canRedo}
                  onClick={() => closeMenuAndRun(onRedo)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white disabled:opacity-40 flex justify-between items-center"
                >
                  <span>Redo</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Shift+Z</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-edit-shortcuts"
                  onClick={() => closeMenuAndRun(onOpenShortcuts)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Keyboard Shortcuts</span>
                  <span className="text-[10px] text-gray-400">Ctrl+/</span>
                </button>
                <button
                  id="menu-edit-preferences"
                  onClick={() => closeMenuAndRun(onOpenSettings)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Preferences...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+K</span>
                </button>
              </div>
            )}
          </div>

          {/* Image Menu */}
          <div className="relative">
            <button
              id="menu-image-btn"
              onClick={() => handleMenuClick('image')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'image' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              Image
            </button>
            {openMenu === 'image' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-img-size"
                  onClick={() => closeMenuAndRun(onOpenImageSize)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Image Size...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Alt+I</span>
                </button>
                <button
                  id="menu-canvas-size"
                  onClick={() => closeMenuAndRun(onOpenCanvasSize)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Canvas Size...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Alt+C</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-img-rot90cw"
                  onClick={() => closeMenuAndRun(() => onRotateCanvas(90))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Rotate 90° Clockwise
                </button>
                <button
                  id="menu-img-rot90ccw"
                  onClick={() => closeMenuAndRun(() => onRotateCanvas(-90))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Rotate 90° Counter-Clockwise
                </button>
                <button
                  id="menu-img-rot180"
                  onClick={() => closeMenuAndRun(() => onRotateCanvas(180))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Rotate 180°
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-img-fliph"
                  onClick={() => closeMenuAndRun(() => onFlipCanvas('horizontal'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Flip Canvas Horizontal
                </button>
                <button
                  id="menu-img-flipv"
                  onClick={() => closeMenuAndRun(() => onFlipCanvas('vertical'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Flip Canvas Vertical
                </button>
              </div>
            )}
          </div>

          {/* Layer Menu */}
          <div className="relative">
            <button
              id="menu-layer-btn"
              onClick={() => handleMenuClick('layer')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'layer' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              Layer
            </button>
            {openMenu === 'layer' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-layer-new-pixel"
                  onClick={() => closeMenuAndRun(() => onAddLayer('pixel'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  New Pixel Layer
                </button>
                <button
                  id="menu-layer-new-text"
                  onClick={() => closeMenuAndRun(() => onAddLayer('text'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  New Text Layer
                </button>
                <button
                  id="menu-layer-new-shape"
                  onClick={() => closeMenuAndRun(() => onAddLayer('shape'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  New Vector Shape Layer
                </button>
                <button
                  id="menu-layer-new-adj"
                  onClick={() => closeMenuAndRun(() => onAddLayer('adjustment'))}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  New Adjustment Layer...
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-layer-dup"
                  onClick={() => closeMenuAndRun(onDuplicateLayer)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Duplicate Layer</span>
                  <span className="text-[10px] text-gray-400">Ctrl+J</span>
                </button>
                <button
                  id="menu-layer-del"
                  onClick={() => closeMenuAndRun(onDeleteLayer)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Delete Layer</span>
                  <span className="text-[10px] text-gray-400">Del</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-layer-merge"
                  onClick={() => closeMenuAndRun(onMergeLayers)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Merge Down</span>
                  <span className="text-[10px] text-gray-400">Ctrl+E</span>
                </button>
                <button
                  id="menu-layer-flatten"
                  onClick={() => closeMenuAndRun(onFlattenImage)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Flatten Image
                </button>
              </div>
            )}
          </div>

          {/* Select Menu */}
          <div className="relative">
            <button
              id="menu-select-btn"
              onClick={() => handleMenuClick('select')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'select' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              Select
            </button>
            {openMenu === 'select' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-sel-all"
                  onClick={() => closeMenuAndRun(onSelectAll)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Select All</span>
                  <span className="text-[10px] text-gray-400">Ctrl+A</span>
                </button>
                <button
                  id="menu-sel-deselect"
                  onClick={() => closeMenuAndRun(onDeselect)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Deselect</span>
                  <span className="text-[10px] text-gray-400">Ctrl+D</span>
                </button>
                <button
                  id="menu-sel-invert"
                  onClick={() => closeMenuAndRun(onInvertSelection)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Invert Selection</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Shift+I</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter Menu */}
          <div className="relative">
            <button
              id="menu-filter-btn"
              onClick={() => handleMenuClick('filter')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'filter' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              Filter
            </button>
            {openMenu === 'filter' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-filter-gallery"
                  onClick={() => closeMenuAndRun(onOpenFilterGallery)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center font-medium"
                >
                  <span>Filter Gallery & FX...</span>
                  <span className="text-[10px] text-gray-400">Ctrl+F</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-filter-blur-gauss"
                  onClick={() => closeMenuAndRun(onOpenFilterGallery)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Gaussian Blur...
                </button>
                <button
                  id="menu-filter-sharpen-unsharp"
                  onClick={() => closeMenuAndRun(onOpenFilterGallery)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Unsharp Mask & Sharpen...
                </button>
                <button
                  id="menu-filter-noise"
                  onClick={() => closeMenuAndRun(onOpenFilterGallery)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Add Noise / Grain...
                </button>
                <button
                  id="menu-filter-distort"
                  onClick={() => closeMenuAndRun(onOpenFilterGallery)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Distortion (Twirl, Spherize, Ripple)...
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              id="menu-view-btn"
              onClick={() => handleMenuClick('view')}
              className={`px-2.5 py-1 rounded transition-colors ${
                openMenu === 'view' ? 'bg-[#252834] text-white' : 'hover:bg-[#20222a] hover:text-white'
              }`}
            >
              View
            </button>
            {openMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1a1c24] border border-[#2e3240] rounded shadow-2xl py-1 z-50">
                <button
                  id="menu-view-fit"
                  onClick={() => closeMenuAndRun(onFitCanvas)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Fit on Screen</span>
                  <span className="text-[10px] text-gray-400">Ctrl+0</span>
                </button>
                <button
                  id="menu-view-100"
                  onClick={() => closeMenuAndRun(onActualPixels)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>100% Actual Pixels</span>
                  <span className="text-[10px] text-gray-400">Ctrl+1</span>
                </button>
                <div className="my-1 border-t border-[#2e3240]" />
                <button
                  id="menu-view-split"
                  onClick={() => closeMenuAndRun(onToggleBeforeAfter)}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
                >
                  <span>Before / After View</span>
                  <span className="text-[10px] text-gray-400">Y</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Active Document Name & Dimensions */}
      {doc ? (
        <div className="hidden md:flex items-center gap-2 text-[11px] font-medium text-gray-300">
          <span className="text-white font-semibold">{doc.name}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">
            {doc.width} × {doc.height} px
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-blue-400">{doc.colorMode} ({doc.bitDepth}-bit)</span>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2 text-[11px] font-medium text-gray-500">
          <span>G-Pro Studio Workspace</span>
        </div>
      )}

      {/* Right: Quick Action Buttons & Global Command Search */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <button
          id="quick-btn-undo"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 hover:bg-[#222530] disabled:opacity-30 rounded text-gray-300 hover:text-white transition-colors"
        >
          <Undo2 size={14} />
        </button>
        <button
          id="quick-btn-redo"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 hover:bg-[#222530] disabled:opacity-30 rounded text-gray-300 hover:text-white transition-colors"
        >
          <Redo2 size={14} />
        </button>

        <div className="w-[1px] h-4 bg-[#2e3240] mx-0.5" />

        {/* Zoom Controls */}
        <button
          id="quick-btn-zoomin"
          onClick={() => onZoomChange?.(Math.min(32, zoom * 1.25))}
          title="Zoom In"
          className="p-1.5 hover:bg-[#222530] rounded text-gray-300 hover:text-white"
        >
          <ZoomIn size={14} />
        </button>
        <span className="text-[11px] font-mono text-gray-400 w-11 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          id="quick-btn-zoomout"
          onClick={() => onZoomChange?.(Math.max(0.05, zoom / 1.25))}
          title="Zoom Out"
          className="p-1.5 hover:bg-[#222530] rounded text-gray-300 hover:text-white"
        >
          <ZoomOut size={14} />
        </button>

        <div className="w-[1px] h-4 bg-[#2e3240] mx-0.5" />

        {/* Before / After comparison */}
        <button
          id="quick-btn-beforeafter"
          onClick={onToggleBeforeAfter}
          title="Toggle Before / After Split View (Y)"
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
            beforeAfterMode !== 'off'
              ? 'bg-blue-600 text-white'
              : 'bg-[#20222a] hover:bg-[#2a2d3a] text-gray-300'
          }`}
        >
          <Columns size={13} />
          <span className="hidden sm:inline">Before/After</span>
        </button>

        {/* Global Command Search */}
        <button
          id="quick-btn-command-palette"
          onClick={onOpenCommandPalette}
          title="Global Command Palette (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-1 bg-[#20222a] hover:bg-[#2a2d3a] text-gray-300 hover:text-white rounded text-[11px] transition-colors"
        >
          <Search size={13} />
          <span className="hidden lg:inline text-gray-400">Search</span>
          <kbd className="hidden lg:inline text-[9px] bg-[#16181f] px-1 py-0.5 rounded border border-[#2e3240] text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Export Button */}
        <button
          id="quick-btn-export"
          onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-[11px] transition-colors cursor-pointer shadow-sm"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
