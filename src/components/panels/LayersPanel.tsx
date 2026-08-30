/**
 * Professional Layers Panel Component for G-Pro
 */

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Copy,
  Trash2,
  Folder,
  Layers,
  Sparkles,
  Sliders,
  Type,
  Square,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Scissors,
  Combine,
} from 'lucide-react';
import { GProDocument, Layer, BlendMode } from '../../types';

interface LayersPanelProps {
  document: GProDocument | null;
  onUpdateDocument: (doc: GProDocument, recordHistory?: boolean, desc?: string) => void;
  onAddLayer?: (type: 'pixel' | 'adjustment' | 'text' | 'shape') => void;
  onDuplicateLayer?: () => void;
  onDeleteLayer?: () => void;
  onMergeLayers?: () => void;
  onFlattenImage?: () => void;
}

const BLEND_MODES: { value: BlendMode; label: string; group: string }[] = [
  // Normal
  { value: 'normal', label: 'Normal', group: 'Normal' },
  { value: 'dissolve', label: 'Dissolve', group: 'Normal' },
  // Darken
  { value: 'darken', label: 'Darken', group: 'Darken' },
  { value: 'multiply', label: 'Multiply', group: 'Darken' },
  { value: 'color-burn', label: 'Color Burn', group: 'Darken' },
  { value: 'linear-burn', label: 'Linear Burn', group: 'Darken' },
  { value: 'darker-color', label: 'Darker Color', group: 'Darken' },
  // Lighten
  { value: 'lighten', label: 'Lighten', group: 'Lighten' },
  { value: 'screen', label: 'Screen', group: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge', group: 'Lighten' },
  { value: 'linear-dodge', label: 'Linear Dodge', group: 'Lighten' },
  { value: 'lighter-color', label: 'Lighter Color', group: 'Lighten' },
  // Contrast
  { value: 'overlay', label: 'Overlay', group: 'Contrast' },
  { value: 'soft-light', label: 'Soft Light', group: 'Contrast' },
  { value: 'hard-light', label: 'Hard Light', group: 'Contrast' },
  { value: 'vivid-light', label: 'Vivid Light', group: 'Contrast' },
  { value: 'linear-light', label: 'Linear Light', group: 'Contrast' },
  { value: 'pin-light', label: 'Pin Light', group: 'Contrast' },
  { value: 'hard-mix', label: 'Hard Mix', group: 'Contrast' },
  // Difference
  { value: 'difference', label: 'Difference', group: 'Difference' },
  { value: 'exclusion', label: 'Exclusion', group: 'Difference' },
  { value: 'subtract', label: 'Subtract', group: 'Difference' },
  { value: 'divide', label: 'Divide', group: 'Difference' },
  // Component
  { value: 'hue', label: 'Hue', group: 'Color' },
  { value: 'saturation', label: 'Saturation', group: 'Color' },
  { value: 'color', label: 'Color', group: 'Color' },
  { value: 'luminosity', label: 'Luminosity', group: 'Color' },
];

export const LayersPanel: React.FC<LayersPanelProps> = ({
  document: doc,
  onUpdateDocument,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMergeLayers,
  onFlattenImage,
}) => {
  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-500 p-4">
        No active document
      </div>
    );
  }

  const activeLayer = (doc.layers && doc.layers.length > 0)
    ? (doc.layers.find((l) => l.id === doc.activeLayerId) || doc.layers[0])
    : null;

  const handleInternalAddLayer = (type: 'pixel' | 'adjustment' | 'text' | 'shape') => {
    if (onAddLayer) {
      onAddLayer(type);
      return;
    }
    const newCanvas = document.createElement('canvas');
    newCanvas.width = doc.width;
    newCanvas.height = doc.height;
    const newLayer: Layer = {
      id: 'layer-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${doc.layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      canvas: newCanvas,
      x: 0,
      y: 0,
      width: doc.width,
      height: doc.height,
    };
    onUpdateDocument(
      {
        ...doc,
        layers: [newLayer, ...doc.layers],
        activeLayerId: newLayer.id,
      },
      true,
      `Add ${type} Layer`
    );
  };

  const handleInternalDuplicateLayer = () => {
    if (onDuplicateLayer) {
      onDuplicateLayer();
      return;
    }
    if (!activeLayer) return;
    const dupCanvas = document.createElement('canvas');
    dupCanvas.width = doc.width;
    dupCanvas.height = doc.height;
    if (activeLayer.canvas) {
      dupCanvas.getContext('2d')?.drawImage(activeLayer.canvas, 0, 0);
    }
    const dupLayer: Layer = {
      ...activeLayer,
      id: 'layer-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: `${activeLayer.name} Copy`,
      canvas: dupCanvas,
    };
    const activeIdx = doc.layers.findIndex((l) => l.id === activeLayer.id);
    const newLayers = [...doc.layers];
    newLayers.splice(activeIdx, 0, dupLayer);
    onUpdateDocument(
      { ...doc, layers: newLayers, activeLayerId: dupLayer.id },
      true,
      'Duplicate Layer'
    );
  };

  const handleInternalDeleteLayer = () => {
    if (onDeleteLayer) {
      onDeleteLayer();
      return;
    }
    if (!activeLayer || doc.layers.length <= 1) return;
    const filtered = doc.layers.filter((l) => l.id !== activeLayer.id);
    onUpdateDocument(
      { ...doc, layers: filtered, activeLayerId: filtered[0]?.id || '' },
      true,
      'Delete Layer'
    );
  };

  const handleSelectLayer = (id: string) => {
    onUpdateDocument({ ...doc, activeLayerId: id });
  };

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = doc.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
    onUpdateDocument({ ...doc, layers: updated }, true, 'Toggle Layer Visibility');
  };

  const handleToggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = doc.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l));
    onUpdateDocument({ ...doc, layers: updated }, true, 'Toggle Layer Lock');
  };

  const handleBlendModeChange = (mode: BlendMode) => {
    if (!activeLayer) return;
    const updated = doc.layers.map((l) => (l.id === activeLayer.id ? { ...l, blendMode: mode } : l));
    onUpdateDocument({ ...doc, layers: updated }, true, 'Change Blend Mode');
  };

  const handleOpacityChange = (opacity: number) => {
    if (!activeLayer) return;
    const updated = doc.layers.map((l) => (l.id === activeLayer.id ? { ...l, opacity } : l));
    onUpdateDocument({ ...doc, layers: updated });
  };

  const handleToggleClipping = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = doc.layers.map((l) => (l.id === id ? { ...l, isClippingMask: !l.isClippingMask } : l));
    onUpdateDocument({ ...doc, layers: updated }, true, 'Toggle Clipping Mask');
  };

  const handleAddMask = (id: string) => {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = doc.width;
    maskCanvas.height = doc.height;
    const mCtx = maskCanvas.getContext('2d')!;
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, doc.width, doc.height);

    const updated = doc.layers.map((l) =>
      l.id === id
        ? {
            ...l,
            mask: {
              enabled: true,
              inverted: false,
              density: 100,
              feather: 0,
              canvas: maskCanvas,
            },
          }
        : l
    );
    onUpdateDocument({ ...doc, layers: updated }, true, 'Add Layer Mask');
  };

  // Reorder Layers (Move up/down)
  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const newLayers = [...doc.layers];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= newLayers.length) return;

    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIndex];
    newLayers[targetIndex] = temp;

    onUpdateDocument({ ...doc, layers: newLayers }, true, 'Reorder Layers');
  };

  // Render Layer Type Icon
  const getLayerIcon = (layer: Layer) => {
    if (layer.type === 'adjustment') return <Sliders size={13} className="text-amber-400" />;
    if (layer.type === 'text') return <Type size={13} className="text-sky-400" />;
    if (layer.type === 'shape') return <Square size={13} className="text-emerald-400" />;
    return <Layers size={13} className="text-blue-400" />;
  };

  // Reversed layers for display (Top layer shown at top of panel)
  const displayLayers = [...doc.layers].reverse();

  return (
    <div id="gpro-layers-panel" className="flex flex-col h-full bg-[#181a22] select-none text-xs">
      {/* Blend Mode & Opacity Header */}
      <div className="p-2 border-b border-[#252834] flex flex-col gap-2 bg-[#15171e]">
        {/* Blend Mode Selector */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 font-medium">Mode</label>
          <select
            id="layer-blend-mode-select"
            value={activeLayer?.blendMode || 'normal'}
            onChange={(e) => handleBlendModeChange(e.target.value as BlendMode)}
            className="flex-1 bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-gray-200 text-[11px] focus:outline-none focus:border-blue-500 capitalize"
          >
            {BLEND_MODES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-400 font-medium w-12">Opacity</label>
          <input
            id="layer-opacity-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={activeLayer?.opacity ?? 1}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-[11px] font-mono text-gray-300 w-9 text-right">
            {Math.round((activeLayer?.opacity ?? 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Layer Stack List */}
      <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1">
        {displayLayers.map((layer, displayIndex) => {
          const originalIndex = doc.layers.length - 1 - displayIndex;
          const isActive = layer.id === doc.activeLayerId;

          return (
            <div
              key={layer.id}
              id={`layer-item-${layer.id}`}
              onClick={() => handleSelectLayer(layer.id)}
              className={`group flex items-center justify-between px-2 py-1.5 rounded transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#262a37] border-blue-500/70 text-white shadow-sm'
                  : 'bg-[#1b1e27] border-transparent text-gray-300 hover:bg-[#202431]'
              } ${layer.isClippingMask ? 'ml-3 border-l-2 border-l-cyan-400' : ''}`}
            >
              {/* Left: Visibility Eye & Thumbnail & Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Visibility Eye */}
                <button
                  id={`btn-layer-vis-${layer.id}`}
                  onClick={(e) => handleToggleVisibility(layer.id, e)}
                  className={`p-0.5 rounded hover:bg-[#303545] ${
                    layer.visible ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                {/* Layer Type Icon */}
                <div className="w-5 h-5 rounded bg-[#15171e] flex items-center justify-center shrink-0 border border-[#2e3240]">
                  {getLayerIcon(layer)}
                </div>

                {/* Layer Name & Details */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-[11px] font-medium leading-tight">
                    {layer.name}
                  </span>
                  <span className="text-[9px] text-gray-500 capitalize">
                    {layer.type} • {Math.round(layer.opacity * 100)}%
                  </span>
                </div>

                {/* Mask Indicator */}
                {layer.mask && (
                  <div
                    className="w-4 h-4 rounded-sm border border-gray-500 bg-white"
                    title="Layer Mask Active"
                  />
                )}
              </div>

              {/* Right: Lock & Clipping Mask Controls */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                {/* Clipping Mask Toggle */}
                <button
                  id={`btn-layer-clip-${layer.id}`}
                  onClick={(e) => handleToggleClipping(layer.id, e)}
                  className={`p-1 rounded hover:bg-[#303545] ${
                    layer.isClippingMask ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-300'
                  }`}
                  title="Create / Release Clipping Mask"
                >
                  <CornerDownRight size={12} />
                </button>

                {/* Lock Toggle */}
                <button
                  id={`btn-layer-lock-${layer.id}`}
                  onClick={(e) => handleToggleLock(layer.id, e)}
                  className={`p-1 rounded hover:bg-[#303545] ${
                    layer.locked ? 'text-amber-400' : 'text-gray-600 hover:text-gray-300'
                  }`}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layers Panel Bottom Footer Toolbar */}
      <div className="p-1.5 border-t border-[#252834] bg-[#15171e] flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-1">
          {/* Add Layer Mask */}
          <button
            id="btn-add-layer-mask"
            onClick={() => activeLayer && handleAddMask(activeLayer.id)}
            className="p-1.5 rounded hover:bg-[#252834] hover:text-white transition-colors"
            title="Add Layer Mask"
          >
            <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            </div>
          </button>

          {/* New Adjustment Layer */}
          <button
            id="btn-add-adj-layer"
            onClick={() => handleInternalAddLayer('adjustment')}
            className="p-1.5 rounded hover:bg-[#252834] hover:text-white transition-colors"
            title="Create New Adjustment Layer"
          >
            <Sliders size={14} />
          </button>

          {/* Merge Down */}
          <button
            id="btn-merge-layers"
            onClick={onMergeLayers}
            className="p-1.5 rounded hover:bg-[#252834] hover:text-white transition-colors"
            title="Merge Down (Ctrl+E)"
          >
            <Combine size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Duplicate Layer */}
          <button
            id="btn-duplicate-layer"
            onClick={handleInternalDuplicateLayer}
            className="p-1.5 rounded hover:bg-[#252834] hover:text-white transition-colors"
            title="Duplicate Layer (Ctrl+J)"
          >
            <Copy size={14} />
          </button>

          {/* New Pixel Layer */}
          <button
            id="btn-new-pixel-layer"
            onClick={() => handleInternalAddLayer('pixel')}
            className="p-1.5 rounded hover:bg-[#252834] hover:text-white transition-colors"
            title="Create New Layer"
          >
            <Plus size={15} />
          </button>

          {/* Delete Layer */}
          <button
            id="btn-delete-layer"
            onClick={handleInternalDeleteLayer}
            className="p-1.5 rounded hover:bg-red-900/50 hover:text-red-300 transition-colors"
            title="Delete Layer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
