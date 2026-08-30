/**
 * History & Snapshots Panel for G-Pro
 * Displays Undo/Redo stack and Snapshot states
 */

import React, { useState } from 'react';
import {
  History,
  Camera,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { GProDocument, HistoryStep, Snapshot } from '../../types';

interface HistoryPanelProps {
  document: GProDocument | null;
  onGoToHistoryIndex: (index: number) => void;
  onCreateSnapshot: (name: string) => void;
  onRestoreSnapshot: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  document: doc,
  onGoToHistoryIndex,
  onCreateSnapshot,
  onRestoreSnapshot,
  onClearHistory,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [showNewSnapshotInput, setShowNewSnapshotInput] = useState(false);

  if (!doc) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs">
        No active document
      </div>
    );
  }

  const handleAddSnapshot = () => {
    if (!snapshotName.trim()) return;
    onCreateSnapshot(snapshotName.trim());
    setSnapshotName('');
    setShowNewSnapshotInput(false);
  };

  return (
    <div id="gpro-history-panel" className="flex flex-col h-full bg-[#181a22] text-xs select-none">
      {/* Snapshots Section */}
      <div className="p-2 border-b border-[#252834] bg-[#15171e]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-gray-300 font-medium">
            <Camera size={13} className="text-blue-400" />
            <span className="text-[11px]">Snapshots</span>
          </div>
          <button
            id="btn-create-snapshot"
            onClick={() => setShowNewSnapshotInput(!showNewSnapshotInput)}
            className="p-1 hover:bg-[#252834] text-gray-400 hover:text-white rounded transition-colors"
            title="Create New Snapshot"
          >
            <Plus size={13} />
          </button>
        </div>

        {showNewSnapshotInput && (
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSnapshot()}
              placeholder="Snapshot name..."
              className="flex-1 bg-[#20222b] border border-[#2e3240] rounded px-2 py-0.5 text-gray-200 text-[11px]"
              autoFocus
            />
            <button
              onClick={handleAddSnapshot}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px]"
            >
              Add
            </button>
          </div>
        )}

        {/* Snapshot Items */}
        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
          {doc.snapshots.map((snap) => (
            <div
              key={snap.id}
              onClick={() => onRestoreSnapshot(snap.id)}
              className="flex items-center justify-between px-2 py-1 bg-[#1c1e27] hover:bg-[#252937] rounded cursor-pointer transition-colors"
            >
              <span className="text-[11px] text-gray-300 truncate">{snap.name}</span>
              <span className="text-[9px] text-gray-500">
                {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History Steps Stack */}
      <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
        {doc.history.map((step, index) => {
          const isCurrent = index === doc.historyIndex;
          const isPast = index <= doc.historyIndex;

          return (
            <div
              key={step.id}
              id={`history-step-${step.id}`}
              onClick={() => onGoToHistoryIndex(index)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#262a37] text-white border-l-2 border-l-blue-500 font-medium'
                  : isPast
                  ? 'text-gray-300 hover:bg-[#202431]'
                  : 'text-gray-600 hover:bg-[#1b1d25] opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <History size={12} className={isCurrent ? 'text-blue-400' : 'text-gray-500'} />
                <span className="truncate text-[11px]">{step.description}</span>
              </div>
              {isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-1.5 border-t border-[#252834] bg-[#15171e] flex items-center justify-between text-gray-400">
        <span className="text-[10px]">
          {doc.history.length} Action{doc.history.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={onClearHistory}
          className="p-1 rounded hover:bg-red-900/40 hover:text-red-300 transition-colors"
          title="Clear History"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
