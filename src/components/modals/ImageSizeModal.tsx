/**
 * Image Size & Resampling Modal for G-Pro
 */

import React, { useState } from 'react';
import { X, Maximize2, Link, Unlink } from 'lucide-react';
import { GProDocument } from '../../types';

interface ImageSizeModalProps {
  document: GProDocument;
  onClose: () => void;
  onResizeImage: (newWidth: number, newHeight: number) => void;
}

export const ImageSizeModal: React.FC<ImageSizeModalProps> = ({
  document: doc,
  onClose,
  onResizeImage,
}) => {
  const [width, setWidth] = useState(doc.width);
  const [height, setHeight] = useState(doc.height);
  const [constrainProportions, setConstrainProportions] = useState(true);
  const aspectRatio = doc.width / doc.height;

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (constrainProportions) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (constrainProportions) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181a22] border border-[#2e3240] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-xs flex flex-col">
        <div className="px-4 py-3 border-b border-[#252834] bg-[#14161d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 size={15} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Image Size & Resample</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252834] text-gray-400 hover:text-white">
            <X size={15} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Width:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                className="w-24 bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-right font-mono text-gray-100"
              />
              <span className="text-gray-400">px</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Height:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                className="w-24 bg-[#20222b] border border-[#2e3240] rounded px-2 py-1 text-right font-mono text-gray-100"
              />
              <span className="text-gray-400">px</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#252834] flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={constrainProportions}
                onChange={(e) => setConstrainProportions(e.target.checked)}
              />
              <span>Constrain Proportions</span>
            </label>
            {constrainProportions ? <Link size={14} className="text-blue-400" /> : <Unlink size={14} className="text-gray-500" />}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#252834] bg-[#14161d] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-[#252834] text-gray-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => {
              onResizeImage(width, height);
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
