/**
 * Document Tabs Bar for G-Pro
 */

import React from 'react';
import { X, Plus, Image as ImageIcon, SplitSquareVertical } from 'lucide-react';
import { GProDocument } from '../types';

interface DocumentTabsProps {
  documents: GProDocument[];
  activeDocumentId?: string | null;
  activeDocId?: string | null;
  onSelectDocument?: (id: string) => void;
  onSelectDoc?: (id: string) => void;
  onCloseDocument?: (id: string) => void;
  onCloseDoc?: (id: string) => void;
  onNewDocument?: () => void;
  onNewDoc?: () => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documents = [],
  activeDocumentId,
  activeDocId = activeDocumentId,
  onSelectDocument,
  onSelectDoc = onSelectDocument,
  onCloseDocument,
  onCloseDoc = onCloseDocument,
  onNewDocument,
  onNewDoc = onNewDocument,
}) => {
  const currentActiveId = activeDocId ?? activeDocumentId;

  return (
    <div
      id="gpro-document-tabs"
      className="h-8 bg-[#121318] border-b border-[#252834] flex items-center px-1.5 gap-1 overflow-x-auto select-none shrink-0"
    >
      {documents.filter(Boolean).map((doc) => {
        const isActive = doc.id === currentActiveId;
        return (
          <div
            key={doc.id}
            id={`tab-${doc.id}`}
            onClick={() => onSelectDoc?.(doc.id)}
            className={`group relative flex items-center gap-2 px-3 py-1 text-xs rounded-t border-t-2 transition-all cursor-pointer min-w-[120px] max-w-[200px] ${
              isActive
                ? 'bg-[#1e2029] border-blue-500 text-white font-medium shadow-sm'
                : 'bg-[#15171e] border-transparent text-gray-400 hover:bg-[#1a1c24] hover:text-gray-200'
            }`}
          >
            <ImageIcon size={12} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
            <span className="truncate flex-1 text-[11px]">{doc.name || 'Untitled'}</span>
            {doc.isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" title="Modified" />
            )}
            <button
              id={`tab-close-${doc.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onCloseDoc?.(doc.id);
              }}
              className="p-0.5 rounded-full hover:bg-[#2d3140] text-gray-500 hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
              title="Close Document"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      {/* New Document Button */}
      <button
        id="btn-tab-new"
        onClick={() => onNewDoc?.()}
        className="p-1 hover:bg-[#20222b] text-gray-400 hover:text-white rounded transition-colors"
        title="Create New Document"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
