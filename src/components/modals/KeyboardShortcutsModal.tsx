/**
 * Keyboard Shortcuts Reference Modal for G-Pro
 */

import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const SHORTCUT_GROUPS = [
    {
      category: 'Tools',
      shortcuts: [
        { key: 'V', desc: 'Move & Transform Tool' },
        { key: 'M', desc: 'Rectangular Marquee' },
        { key: 'L', desc: 'Lasso Selection' },
        { key: 'W', desc: 'Magic Wand Selection' },
        { key: 'C', desc: 'Crop Tool' },
        { key: 'I', desc: 'Eyedropper Color Picker' },
        { key: 'J', desc: 'Spot Healing Brush' },
        { key: 'S', desc: 'Clone Stamp' },
        { key: 'B', desc: 'Paint Brush Tool' },
        { key: 'E', desc: 'Eraser Tool' },
        { key: 'G', desc: 'Gradient & Paint Bucket' },
        { key: 'O', desc: 'Dodge / Burn / Sponge' },
        { key: 'P', desc: 'Pen Tool' },
        { key: 'T', desc: 'Type / Text Tool' },
        { key: 'U', desc: 'Vector Shape Tool' },
        { key: 'H / Space', desc: 'Hand (Pan Canvas)' },
        { key: 'Z', desc: 'Zoom Tool' },
        { key: 'X', desc: 'Swap Foreground/Background Colors' },
        { key: 'D', desc: 'Default Colors (Black/White)' },
      ],
    },
    {
      category: 'File & Edit',
      shortcuts: [
        { key: 'Ctrl + N', desc: 'New Document' },
        { key: 'Ctrl + O', desc: 'Open Image' },
        { key: 'Ctrl + S', desc: 'Save Project (.gpro)' },
        { key: 'Ctrl + Shift + E', desc: 'Export Image' },
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Shift + Z', desc: 'Redo' },
        { key: 'Ctrl + K', desc: 'Global Command Palette' },
        { key: 'Ctrl + A', desc: 'Select All' },
        { key: 'Ctrl + D', desc: 'Deselect' },
        { key: 'Ctrl + Shift + I', desc: 'Invert Selection' },
        { key: 'Ctrl + J', desc: 'Duplicate Active Layer' },
        { key: 'Ctrl + E', desc: 'Merge Layer Down' },
        { key: 'Ctrl + 0', desc: 'Fit Canvas on Screen' },
        { key: 'Ctrl + 1', desc: '100% Actual Pixels' },
        { key: 'Y', desc: 'Toggle Before/After Comparison' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden text-xs flex flex-col">
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts & Hotkeys</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                {group.category}
              </span>
              <div className="flex flex-col gap-1 bg-[#14161d] p-2 rounded border border-[#252834]">
                {group.shortcuts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-1 text-gray-300 border-b border-[#1f222c] last:border-0">
                    <span>{s.desc}</span>
                    <kbd className="bg-[#20222b] border border-[#2e3240] px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
