/**
 * Professional Left Toolbar Component for G-Pro
 */

import React, { useState } from 'react';
import {
  Move,
  Square,
  Circle,
  Lasso,
  Wand2,
  Crop,
  Pipette,
  Sparkle,
  Stamp,
  Brush,
  Pencil,
  Eraser,
  Sun,
  Flame,
  Droplet,
  PaintBucket,
  PenTool,
  MousePointer,
  Type,
  Hand,
  ZoomIn,
  RefreshCw,
  Shapes,
  Star,
  Minus,
  ArrowRight,
  Triangle,
} from 'lucide-react';
import { ToolType } from '../types';

interface LeftToolbarProps {
  activeTool: ToolType;
  setActiveTool?: (tool: ToolType) => void;
  onSelectTool?: (tool: ToolType) => void;
  foregroundColor: string;
  backgroundColor: string;
  setForegroundColor?: (color: string) => void;
  onForegroundColorChange?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onOpenColorPicker?: () => void;
  brushSettings?: any;
  onBrushSettingsChange?: (settings: any) => void;
}

interface ToolGroup {
  id: string;
  defaultTool: ToolType;
  tools: { id: ToolType; name: string; shortcut: string; icon: any }[];
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  setActiveTool,
  onSelectTool = setActiveTool,
  foregroundColor,
  backgroundColor,
  setForegroundColor,
  onForegroundColorChange = setForegroundColor,
  setBackgroundColor,
  onBackgroundColorChange = setBackgroundColor,
  onOpenColorPicker,
}) => {
  const selectTool = onSelectTool || setActiveTool;
  const updateFgColor = onForegroundColorChange || setForegroundColor;
  const updateBgColor = onBackgroundColorChange || setBackgroundColor;
  const [flyoutOpen, setFlyoutOpen] = useState<string | null>(null);

  const toolGroups: ToolGroup[] = [
    {
      id: 'move',
      defaultTool: 'move',
      tools: [{ id: 'move', name: 'Move & Transform Tool', shortcut: 'V', icon: Move }],
    },
    {
      id: 'marquee',
      defaultTool: 'marquee-rect',
      tools: [
        { id: 'marquee-rect', name: 'Rectangular Marquee', shortcut: 'M', icon: Square },
        { id: 'marquee-ellipse', name: 'Elliptical Marquee', shortcut: 'Shift+M', icon: Circle },
      ],
    },
    {
      id: 'lasso',
      defaultTool: 'lasso-free',
      tools: [
        { id: 'lasso-free', name: 'Lasso Tool', shortcut: 'L', icon: Lasso },
        { id: 'lasso-poly', name: 'Polygonal Lasso', shortcut: 'Shift+L', icon: Triangle },
      ],
    },
    {
      id: 'wand',
      defaultTool: 'magic-wand',
      tools: [
        { id: 'magic-wand', name: 'Magic Wand Selection', shortcut: 'W', icon: Wand2 },
        { id: 'quick-select', name: 'Quick Selection', shortcut: 'Shift+W', icon: Wand2 },
      ],
    },
    {
      id: 'crop',
      defaultTool: 'crop',
      tools: [
        { id: 'crop', name: 'Crop Tool', shortcut: 'C', icon: Crop },
        { id: 'perspective-crop', name: 'Perspective Crop', shortcut: 'Shift+C', icon: Crop },
      ],
    },
    {
      id: 'eyedropper',
      defaultTool: 'eyedropper',
      tools: [
        { id: 'eyedropper', name: 'Eyedropper Tool', shortcut: 'I', icon: Pipette },
      ],
    },
    {
      id: 'healing',
      defaultTool: 'spot-healing',
      tools: [
        { id: 'spot-healing', name: 'Spot Healing Brush', shortcut: 'J', icon: Sparkle },
        { id: 'healing-brush', name: 'Healing Brush Tool', shortcut: 'Shift+J', icon: Sparkle },
      ],
    },
    {
      id: 'clone',
      defaultTool: 'clone-stamp',
      tools: [
        { id: 'clone-stamp', name: 'Clone Stamp Tool', shortcut: 'S', icon: Stamp },
      ],
    },
    {
      id: 'brush',
      defaultTool: 'brush',
      tools: [
        { id: 'brush', name: 'Paint Brush Tool', shortcut: 'B', icon: Brush },
        { id: 'pencil', name: 'Pencil Tool', shortcut: 'Shift+B', icon: Pencil },
      ],
    },
    {
      id: 'eraser',
      defaultTool: 'eraser',
      tools: [
        { id: 'eraser', name: 'Eraser Tool', shortcut: 'E', icon: Eraser },
        { id: 'magic-eraser', name: 'Magic Eraser Tool', shortcut: 'Shift+E', icon: Eraser },
      ],
    },
    {
      id: 'retouch',
      defaultTool: 'dodge',
      tools: [
        { id: 'dodge', name: 'Dodge (Lighten) Tool', shortcut: 'O', icon: Sun },
        { id: 'burn', name: 'Burn (Darken) Tool', shortcut: 'Shift+O', icon: Flame },
        { id: 'sponge', name: 'Sponge (Saturation) Tool', shortcut: 'Alt+O', icon: Droplet },
      ],
    },
    {
      id: 'fill',
      defaultTool: 'paint-bucket',
      tools: [
        { id: 'paint-bucket', name: 'Paint Bucket Tool', shortcut: 'G', icon: PaintBucket },
        { id: 'gradient', name: 'Gradient Tool', shortcut: 'Shift+G', icon: PaintBucket },
      ],
    },
    {
      id: 'pen',
      defaultTool: 'pen',
      tools: [
        { id: 'pen', name: 'Pen / Vector Tool', shortcut: 'P', icon: PenTool },
        { id: 'path-select', name: 'Path Selection', shortcut: 'A', icon: MousePointer },
      ],
    },
    {
      id: 'text',
      defaultTool: 'text',
      tools: [
        { id: 'text', name: 'Horizontal Type Tool', shortcut: 'T', icon: Type },
      ],
    },
    {
      id: 'shape',
      defaultTool: 'shape-rect',
      tools: [
        { id: 'shape-rect', name: 'Rectangle Shape', shortcut: 'U', icon: Square },
        { id: 'shape-rounded-rect', name: 'Rounded Rectangle', shortcut: 'Shift+U', icon: Square },
        { id: 'shape-ellipse', name: 'Ellipse Shape', shortcut: 'Shift+U', icon: Circle },
        { id: 'shape-star', name: 'Star Shape', shortcut: 'Shift+U', icon: Star },
        { id: 'shape-line', name: 'Line Tool', shortcut: 'Shift+U', icon: Minus },
        { id: 'shape-arrow', name: 'Arrow Shape', shortcut: 'Shift+U', icon: ArrowRight },
      ],
    },
    {
      id: 'hand',
      defaultTool: 'hand',
      tools: [
        { id: 'hand', name: 'Hand Tool (Pan Canvas)', shortcut: 'H', icon: Hand },
        { id: 'zoom', name: 'Zoom Tool', shortcut: 'Z', icon: ZoomIn },
      ],
    },
  ];

  const handleSwapColors = () => {
    const temp = foregroundColor;
    updateFgColor(backgroundColor);
    updateBgColor(temp);
  };

  const handleResetColors = () => {
    updateFgColor('#ffffff');
    updateBgColor('#000000');
  };

  return (
    <aside
      id="gpro-left-toolbar"
      className="w-12 bg-[#161820] border-r border-[#252834] flex flex-col items-center py-2 gap-0.5 select-none shrink-0 z-40"
    >
      {/* Tool Groups */}
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-1 w-full items-center">
        {toolGroups.map((group) => {
          const isGroupActive = group.tools.some((t) => t.id === activeTool);
          const currentTool =
            group.tools.find((t) => t.id === activeTool) || group.tools[0];
          const Icon = currentTool?.icon || Move;

          return (
            <div key={group.id} className="relative group/tool w-full flex justify-center">
              <button
                id={`tool-${currentTool?.id || group.defaultTool}`}
                onClick={() => selectTool?.(currentTool?.id || group.defaultTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (group.tools.length > 1) {
                    setFlyoutOpen(flyoutOpen === group.id ? null : group.id);
                  }
                }}
                className={`relative w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer ${
                  isGroupActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-[#232632] hover:text-gray-100'
                }`}
                title={`${currentTool?.name || 'Tool'} (${currentTool?.shortcut || ''})${
                  group.tools.length > 1 ? ' - Right click for more' : ''
                }`}
              >
                <Icon size={16} />
                {group.tools.length > 1 && (
                  <span className="absolute bottom-0.5 right-0.5 w-1 h-1 border-r border-b border-gray-400" />
                )}
              </button>

              {/* Flyout Sub-menu */}
              {flyoutOpen === group.id && (
                <div
                  className="absolute left-full top-0 ml-1.5 bg-[#1b1e27] border border-[#2e3240] rounded shadow-2xl py-1 z-50 min-w-[170px]"
                  onMouseLeave={() => setFlyoutOpen(null)}
                >
                  {group.tools.map((subTool) => {
                    const SubIcon = subTool.icon;
                    const isSubActive = activeTool === subTool.id;
                    return (
                      <button
                        key={subTool.id}
                        id={`subtool-${subTool.id}`}
                        onClick={() => {
                          selectTool?.(subTool.id);
                          setFlyoutOpen(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                          isSubActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-[#252834]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SubIcon size={14} />
                          <span className="text-[11px]">{subTool.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{subTool.shortcut}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Color Swatch Controls */}
      <div className="pt-2 border-t border-[#252834] w-full flex flex-col items-center gap-1.5">
        {/* Swatch Overlapping Boxes */}
        <div className="relative w-8 h-8">
          {/* Background Color */}
          <button
            id="color-bg-chip"
            onClick={onOpenColorPicker}
            style={{ backgroundColor }}
            className="absolute bottom-0 right-0 w-5 h-5 rounded-sm border-2 border-[#161820] shadow-sm hover:scale-105 transition-transform"
            title={`Background Color: ${backgroundColor}`}
          />
          {/* Foreground Color */}
          <button
            id="color-fg-chip"
            onClick={onOpenColorPicker}
            style={{ backgroundColor: foregroundColor }}
            className="absolute top-0 left-0 w-5 h-5 rounded-sm border-2 border-[#2e3240] shadow-md hover:scale-105 transition-transform z-10"
            title={`Foreground Color: ${foregroundColor}`}
          />
        </div>

        {/* Swap & Default Buttons */}
        <div className="flex items-center gap-1">
          <button
            id="btn-color-reset"
            onClick={handleResetColors}
            className="w-3.5 h-3.5 flex items-center justify-center rounded text-[9px] text-gray-400 hover:text-white hover:bg-[#252834]"
            title="Default Colors (D)"
          >
            <div className="w-2 h-2 border border-gray-400 bg-white" />
          </button>
          <button
            id="btn-color-swap"
            onClick={handleSwapColors}
            className="w-3.5 h-3.5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#252834]"
            title="Switch Colors (X)"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>
    </aside>
  );
};
