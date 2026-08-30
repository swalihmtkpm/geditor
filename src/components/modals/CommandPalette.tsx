/**
 * Global Command Palette (Ctrl+K) for G-Pro
 */

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Layers, Sliders, ArrowRight } from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden text-xs flex flex-col animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#252834] bg-[#14161d]">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tools (e.g. Curves, Blur, Export, New Layer)..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-500 font-medium"
            autoFocus
          />
          <kbd className="text-[10px] bg-[#20222b] px-1.5 py-0.5 rounded border border-[#2e3240] text-gray-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-[#20222b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-blue-700 text-blue-200' : 'bg-[#20222b] text-gray-400'
                    }`}>
                      {item.category}
                    </span>
                    <span className="font-medium text-[12px]">{item.name}</span>
                  </div>
                  {item.shortcut && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
