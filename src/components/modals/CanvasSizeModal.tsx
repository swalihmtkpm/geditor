/**
 * Canvas Size Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Grid } from 'lucide-react';
import { GProDocument } from '../../types';

interface CanvasSizeModalProps {
  document: GProDocument;
  onClose: () => void;
  onResizeCanvas: (newWidth: number, newHeight: number, anchor: string) => void;
}

export const CanvasSizeModal: React.FC<CanvasSizeModalProps> = ({
  document: doc,
  onClose,
  onResizeCanvas,
}) => {
  const [width, setWidth] = useState(doc.width);
  const [height, setHeight] = useState(doc.height);
  const [anchor, setAnchor] = useState('center');

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-xs flex flex-col">
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid size={15} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Canvas Size</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={15} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Current Size:</span>
            <span className="font-mono text-gray-300">
              {doc.width} × {doc.height} px
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">New Width:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-right font-mono text-gray-100"
              />
              <span className="text-gray-400">px</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">New Height:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-right font-mono text-gray-100"
              />
              <span className="text-gray-400">px</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => {
              onResizeCanvas(width, height, anchor);
              onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
