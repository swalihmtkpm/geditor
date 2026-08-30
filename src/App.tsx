/**
 * G-PRO: Professional Non-AI Photo & Graphic Editing Application
 * Main Application Shell & State Management
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GProDocument,
  Layer,
  ToolType,
  BrushSettings,
  ColorPoint,
  HistoryStep,
} from './types';
import { TopMenuBar } from './components/TopMenuBar';
import { DocumentTabs } from './components/DocumentTabs';
import { LeftToolbar } from './components/LeftToolbar';
import { CanvasArea } from './components/CanvasArea';
import { StatusBar } from './components/StatusBar';
import { HomeScreen } from './components/HomeScreen';

// Panels
import { LayersPanel } from './components/panels/LayersPanel';
import { AdjustmentsPanel } from './components/panels/AdjustmentsPanel';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { BrushPanel } from './components/panels/BrushPanel';
import { ColorSwatchesPanel } from './components/panels/ColorSwatchesPanel';
import { HistogramPanel } from './components/panels/HistogramPanel';

// Modals
import { NewDocumentModal } from './components/modals/NewDocumentModal';
import { FilterGalleryModal } from './components/modals/FilterGalleryModal';
import { RawDevelopmentModal } from './components/modals/RawDevelopmentModal';
import { ExportModal } from './components/modals/ExportModal';
import { BatchProcessingModal } from './components/modals/BatchProcessingModal';
import { CollageModeModal } from './components/modals/CollageModeModal';
import { ImageSizeModal } from './components/modals/ImageSizeModal';
import { CanvasSizeModal } from './components/modals/CanvasSizeModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { SettingsModal } from './components/modals/SettingsModal';

// Engines & Storage
import {
  createSampleProject,
  saveProjectToJson,
  loadProjectFromJson,
} from './engine/projectStorage';
import {
  applyAutoLevels,
  applyAutoContrast,
  applyAutoColor,
} from './engine/adjustments';
import {
  invertSelectionMask,
  clearSelectionMask,
} from './engine/selectionEngine';

export function App() {
  // Application State
  const [documents, setDocuments] = useState<GProDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [showHomeScreen, setShowHomeScreen] = useState<boolean>(false);

  // Active Tool & Settings
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [foregroundColor, setForegroundColor] = useState<string>('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    size: 24,
    hardness: 80,
    opacity: 1,
    flow: 1,
    spacing: 10,
    scatter: 0,
  });

  // UI Panels and View toggles
  const [activeRightTab, setActiveRightTab] = useState<'layers' | 'adjustments' | 'properties' | 'history' | 'brush' | 'color' | 'histogram'>('layers');
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

  // Modals state
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCollageModalOpen, setIsCollageModalOpen] = useState(false);
  const [isImageSizeModalOpen, setIsImageSizeModalOpen] = useState(false);
  const [isCanvasSizeModalOpen, setIsCanvasSizeModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initialize with Cinematic Mountain Landscape sample on first boot
  useEffect(() => {
    const initialSample = createSampleProject('landscape');
    setDocuments([initialSample]);
    setActiveDocId(initialSample.id);
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Document Mutation Handler with History Recording
  const handleUpdateDocument = useCallback(
    (updatedDoc: GProDocument, recordHistory: boolean = false, description: string = 'Edit') => {
      let finalDoc = updatedDoc;

      if (recordHistory) {
        const newStep: HistoryStep = {
          id: 'step-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          description,
          timestamp: Date.now(),
          documentState: '', // In-memory reference representation
        };

        // Truncate future steps if branching
        const currentHistory = updatedDoc.history.slice(0, updatedDoc.historyIndex + 1);
        const nextHistory = [...currentHistory, newStep];

        finalDoc = {
          ...updatedDoc,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          isModified: true,
        };
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === finalDoc.id ? finalDoc : d))
      );
    },
    []
  );

  // History Navigation (Undo / Redo / Jump)
  const handleGoToHistoryIndex = useCallback(
    (targetIndex: number) => {
      if (!activeDoc) return;
      if (targetIndex < 0 || targetIndex >= activeDoc.history.length) return;

      const updated = {
        ...activeDoc,
        historyIndex: targetIndex,
      };
      handleUpdateDocument(updated, false);
    },
    [activeDoc, handleUpdateDocument]
  );

  const handleUndo = useCallback(() => {
    if (!activeDoc || activeDoc.historyIndex <= 0) return;
    handleGoToHistoryIndex(activeDoc.historyIndex - 1);
  }, [activeDoc, handleGoToHistoryIndex]);

  const handleRedo = useCallback(() => {
    if (!activeDoc || activeDoc.historyIndex >= activeDoc.history.length - 1) return;
    handleGoToHistoryIndex(activeDoc.historyIndex + 1);
  }, [activeDoc, handleGoToHistoryIndex]);

  // Snapshots
  const handleCreateSnapshot = (name: string) => {
    if (!activeDoc) return;
    const newSnapshot = {
      id: 'snap-' + Date.now(),
      name,
      timestamp: Date.now(),
      documentState: '',
    };
    handleUpdateDocument(
      { ...activeDoc, snapshots: [...activeDoc.snapshots, newSnapshot] },
      true,
      `Create Snapshot: ${name}`
    );
  };

  const handleRestoreSnapshot = (id: string) => {
    if (!activeDoc) return;
    const snap = activeDoc.snapshots.find((s) => s.id === id);
    if (!snap) return;
    handleUpdateDocument({ ...activeDoc }, true, `Restore Snapshot: ${snap.name}`);
  };

  // Document Operations
  const handleCreateNewDocument = (doc: GProDocument) => {
    setDocuments((prev) => [...prev, doc]);
    setActiveDocId(doc.id);
    setShowHomeScreen(false);
  };

  const handleCloseDocument = (id: string) => {
    const remaining = documents.filter((d) => d.id !== id);
    setDocuments(remaining);
    if (activeDocId === id) {
      setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleOpenImageFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);

          const bgLayer: Layer = {
            id: 'layer-bg-' + Date.now(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: 'pixel',
            visible: true,
            locked: false,
            opacity: 1,
            fillOpacity: 1,
            blendMode: 'normal',
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas,
          };

          const newDoc: GProDocument = {
            id: 'doc-' + Date.now(),
            name: file.name,
            width: img.width,
            height: img.height,
            dpi: 300,
            colorMode: 'RGB',
            bitDepth: 8,
            colorProfile: 'sRGB',
            layers: [bgLayer],
            activeLayerId: bgLayer.id,
            history: [
              {
                id: 'hist-init',
                description: `Open Image (${file.name})`,
                timestamp: Date.now(),
                documentState: '',
              },
            ],
            historyIndex: 0,
            snapshots: [],
            guides: [],
            zoom: 0.7,
            pan: { x: 0, y: 0 },
            canvasRotation: 0,
            selection: { active: false, feather: 0, mode: 'replace' },
            isModified: false,
            createdAt: Date.now(),
          };

          handleCreateNewDocument(newDoc);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSaveProject = () => {
    if (!activeDoc) return;
    saveProjectToJson(activeDoc);
    handleUpdateDocument({ ...activeDoc, isModified: false });
  };

  const handleOpenProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gpro,.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      try {
        const loadedDoc = await loadProjectFromJson(file);
        handleCreateNewDocument(loadedDoc);
      } catch (err) {
        console.error('Failed to load project file', err);
      }
    };
    input.click();
  };

  const handleLoadSample = (type: 'portrait' | 'landscape' | 'poster') => {
    const sample = createSampleProject(type);
    handleCreateNewDocument(sample);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      // Global Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Tool Hotkeys
      if (e.key === 'v' || e.key === 'V') setActiveTool('move');
      if (e.key === 'm' || e.key === 'M') setActiveTool('marquee-rect');
      if (e.key === 'l' || e.key === 'L') setActiveTool('lasso');
      if (e.key === 'w' || e.key === 'W') setActiveTool('magic-wand');
      if (e.key === 'c' || e.key === 'C') setActiveTool('crop');
      if (e.key === 'i' || e.key === 'I') setActiveTool('eyedropper');
      if (e.key === 'j' || e.key === 'J') setActiveTool('spot-healing');
      if (e.key === 's' || e.key === 'S') setActiveTool('clone-stamp');
      if (e.key === 'b' || e.key === 'B') setActiveTool('brush');
      if (e.key === 'e' || e.key === 'E') setActiveTool('eraser');
      if (e.key === 'g' || e.key === 'G') setActiveTool('gradient');
      if (e.key === 'o' || e.key === 'O') setActiveTool('dodge');
      if (e.key === 'p' || e.key === 'P') setActiveTool('pen');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'u' || e.key === 'U') setActiveTool('shape-rectangle');
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      if (e.key === 'z' || e.key === 'Z') setActiveTool('zoom');

      // Swap Colors (X) / Default Colors (D)
      if (e.key === 'x' || e.key === 'X') {
        const temp = foregroundColor;
        setForegroundColor(backgroundColor);
        setBackgroundColor(temp);
      }
      if (e.key === 'd' || e.key === 'D') {
        setForegroundColor('#ffffff');
        setBackgroundColor('#000000');
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // File operations
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsNewDocModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenImageFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && e.shiftKey) {
        e.preventDefault();
        setIsExportModalOpen(true);
      }

      // Deselect (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (activeDoc && activeDoc.selection.maskCanvas) {
          clearSelectionMask(activeDoc.selection.maskCanvas);
          handleUpdateDocument(
            { ...activeDoc, selection: { ...activeDoc.selection, active: false } },
            true,
            'Deselect'
          );
        }
      }

      // Select All (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (activeDoc && activeDoc.selection.maskCanvas) {
          const ctx = activeDoc.selection.maskCanvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, activeDoc.width, activeDoc.height);
          handleUpdateDocument(
            {
              ...activeDoc,
              selection: {
                ...activeDoc.selection,
                active: true,
                bounds: { x: 0, y: 0, width: activeDoc.width, height: activeDoc.height },
              },
            },
            true,
            'Select All'
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeDoc,
    handleUndo,
    handleRedo,
    foregroundColor,
    backgroundColor,
    handleUpdateDocument,
  ]);

  // Command palette command list
  const PALETTE_COMMANDS = [
    { id: 'new-doc', name: 'New Document...', category: 'File', shortcut: 'Ctrl+N', action: () => setIsNewDocModalOpen(true) },
    { id: 'open-img', name: 'Open Image...', category: 'File', shortcut: 'Ctrl+O', action: handleOpenImageFile },
    { id: 'save-proj', name: 'Save Project (.gpro)', category: 'File', shortcut: 'Ctrl+S', action: handleSaveProject },
    { id: 'export-img', name: 'Export Image...', category: 'File', shortcut: 'Ctrl+Shift+E', action: () => setIsExportModalOpen(true) },
    { id: 'batch-proc', name: 'Batch Processing Studio...', category: 'File', action: () => setIsBatchModalOpen(true) },
    { id: 'collage-maker', name: 'Collage Designer Studio...', category: 'File', action: () => setIsCollageModalOpen(true) },
    { id: 'undo', name: 'Undo', category: 'Edit', shortcut: 'Ctrl+Z', action: handleUndo },
    { id: 'redo', name: 'Redo', category: 'Edit', shortcut: 'Ctrl+Shift+Z', action: handleRedo },
    { id: 'filter-gallery', name: 'Filter Gallery & Special Effects...', category: 'Filter', action: () => setIsFilterModalOpen(true) },
    { id: 'camera-raw', name: 'Camera RAW Darkroom Studio...', category: 'Filter', action: () => setIsRawModalOpen(true) },
    { id: 'img-size', name: 'Image Size & Resample...', category: 'Image', action: () => setIsImageSizeModalOpen(true) },
    { id: 'canvas-size', name: 'Canvas Size...', category: 'Image', action: () => setIsCanvasSizeModalOpen(true) },
    { id: 'shortcuts', name: 'Keyboard Shortcuts Cheatsheet', category: 'Help', action: () => setIsShortcutsModalOpen(true) },
    { id: 'settings', name: 'Preferences & Workspace Settings', category: 'Help', action: () => setIsSettingsModalOpen(true) },
  ];

  return (
    <div id="gpro-app-root" className="w-screen h-screen flex flex-col bg-[#121318] text-gray-200 overflow-hidden font-sans select-none">
      {/* 1. Global Top Menu Bar */}
      <TopMenuBar
        document={activeDoc}
        onNew={() => setIsNewDocModalOpen(true)}
        onOpen={handleOpenImageFile}
        onSave={handleSaveProject}
        onOpenProject={handleOpenProject}
        onExport={() => setIsExportModalOpen(true)}
        onOpenBatch={() => setIsBatchModalOpen(true)}
        onOpenCollage={() => setIsCollageModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleFilterModal={() => setIsFilterModalOpen(true)}
        onToggleRawModal={() => setIsRawModalOpen(true)}
        onToggleImageSizeModal={() => setIsImageSizeModalOpen(true)}
        onToggleCanvasSizeModal={() => setIsCanvasSizeModalOpen(true)}
        onToggleSettingsModal={() => setIsSettingsModalOpen(true)}
        onToggleShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onToggleCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleHome={() => setShowHomeScreen((prev) => !prev)}
        showRulers={showRulers}
        setShowRulers={setShowRulers}
        showGuides={showGuides}
        setShowGuides={setShowGuides}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />

      {/* 2. Document Tabs Strip */}
      <DocumentTabs
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={(id) => {
          setActiveDocId(id);
          setShowHomeScreen(false);
        }}
        onCloseDoc={handleCloseDocument}
        onNewDoc={() => setIsNewDocModalOpen(true)}
      />

      {/* 3. Main Workspace / Home Screen */}
      {showHomeScreen || !activeDoc ? (
        <HomeScreen
          onNewDocument={() => setIsNewDocModalOpen(true)}
          onOpenImage={handleOpenImageFile}
          onOpenProject={handleOpenProject}
          onLoadSample={handleLoadSample}
          recentDocuments={documents.map((d) => ({
            id: d.id,
            name: d.name,
            date: new Date(d.createdAt).toLocaleDateString(),
          }))}
          onOpenRecent={(id) => {
            setActiveDocId(id);
            setShowHomeScreen(false);
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Main Toolbar */}
          <LeftToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onSelectTool={setActiveTool}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            setForegroundColor={setForegroundColor}
            onForegroundColorChange={setForegroundColor}
            setBackgroundColor={setBackgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            brushSettings={brushSettings}
            onBrushSettingsChange={setBrushSettings}
          />

          {/* Center Interactive Canvas Viewport */}
          <CanvasArea
            document={activeDoc}
            onUpdateDocument={handleUpdateDocument}
            activeTool={activeTool}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            setForegroundColor={setForegroundColor}
            onForegroundColorChange={setForegroundColor}
            brushSettings={brushSettings}
            beforeAfterMode={beforeAfterMode}
            showRulers={showRulers}
            showGuides={showGuides}
            showGrid={showGrid}
            onCursorMove={setCursorCoords}
          />

          {/* Right Docked Panels */}
          <div
            id="gpro-right-dock"
            className="w-72 bg-[#161822] border-l border-[#252834] flex flex-col shrink-0 z-20 shadow-lg"
          >
            {/* Panel Tab Buttons */}
            <div className="flex items-center bg-[#13151c] border-b border-[#252834] overflow-x-auto p-1 gap-1">
              {[
                { id: 'layers', name: 'Layers' },
                { id: 'adjustments', name: 'Adjust' },
                { id: 'properties', name: 'Props' },
                { id: 'history', name: 'History' },
                { id: 'brush', name: 'Brush' },
                { id: 'color', name: 'Color' },
                { id: 'histogram', name: 'Histo' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id as any)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                    activeRightTab === tab.id
                      ? 'bg-[#222634] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Panel Active Body */}
            <div className="flex-1 overflow-hidden">
              {activeRightTab === 'layers' && (
                <LayersPanel
                  document={activeDoc}
                  onUpdateDocument={handleUpdateDocument}
                />
              )}
              {activeRightTab === 'adjustments' && (
                <AdjustmentsPanel
                  document={activeDoc}
                  onUpdateDocument={handleUpdateDocument}
                />
              )}
              {activeRightTab === 'properties' && (
                <PropertiesPanel
                  document={activeDoc}
                  onUpdateDocument={handleUpdateDocument}
                />
              )}
              {activeRightTab === 'history' && (
                <HistoryPanel
                  document={activeDoc}
                  onGoToHistoryIndex={handleGoToHistoryIndex}
                  onCreateSnapshot={handleCreateSnapshot}
                  onRestoreSnapshot={handleRestoreSnapshot}
                  onClearHistory={() => {
                    const currentStep = activeDoc.history[activeDoc.historyIndex];
                    handleUpdateDocument({
                      ...activeDoc,
                      history: [currentStep],
                      historyIndex: 0,
                    });
                  }}
                />
              )}
              {activeRightTab === 'brush' && (
                <BrushPanel
                  settings={brushSettings}
                  onChange={setBrushSettings}
                />
              )}
              {activeRightTab === 'color' && (
                <ColorSwatchesPanel
                  foregroundColor={foregroundColor}
                  backgroundColor={backgroundColor}
                  onForegroundColorChange={setForegroundColor}
                  onBackgroundColorChange={setBackgroundColor}
                />
              )}
              {activeRightTab === 'histogram' && (
                <HistogramPanel document={activeDoc} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Status Bar */}
      {activeDoc && (
        <StatusBar
          document={activeDoc}
          cursorCoords={cursorCoords}
          zoom={activeDoc.zoom}
          onZoomChange={(newZoom) =>
            handleUpdateDocument({ ...activeDoc, zoom: newZoom })
          }
          onFitCanvas={() => {
            const viewport = window.document.getElementById('gpro-canvas-viewport');
            if (!viewport) return;
            const pad = 60;
            const scaleX = (viewport.clientWidth - pad) / activeDoc.width;
            const scaleY = (viewport.clientHeight - pad) / activeDoc.height;
            const fitZoom = Math.min(scaleX, scaleY, 1);
            handleUpdateDocument({ ...activeDoc, zoom: fitZoom, pan: { x: 0, y: 0 } });
          }}
          onActualPixels={() => {
            handleUpdateDocument({ ...activeDoc, zoom: 1, pan: { x: 0, y: 0 } });
          }}
        />
      )}

      {/* Modals & Dialogs */}
      {isNewDocModalOpen && (
        <NewDocumentModal
          onClose={() => setIsNewDocModalOpen(false)}
          onCreateDocument={handleCreateNewDocument}
        />
      )}

      {isFilterModalOpen && activeDoc && (
        <FilterGalleryModal
          document={activeDoc}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilter={(updatedLayer, filterName) => {
            const updatedLayers = activeDoc.layers.map((l) =>
              l.id === updatedLayer.id ? updatedLayer : l
            );
            handleUpdateDocument(
              { ...activeDoc, layers: updatedLayers },
              true,
              `Apply Filter: ${filterName}`
            );
          }}
        />
      )}

      {isRawModalOpen && activeDoc && (
        <RawDevelopmentModal
          document={activeDoc}
          onClose={() => setIsRawModalOpen(false)}
          onApplyRaw={(developedLayer) => {
            const updatedLayers = activeDoc.layers.map((l) =>
              l.id === developedLayer.id ? developedLayer : l
            );
            handleUpdateDocument(
              { ...activeDoc, layers: updatedLayers },
              true,
              'Camera RAW Development'
            );
          }}
        />
      )}

      {isExportModalOpen && activeDoc && (
        <ExportModal
          document={activeDoc}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {isBatchModalOpen && (
        <BatchProcessingModal onClose={() => setIsBatchModalOpen(false)} />
      )}

      {isCollageModalOpen && (
        <CollageModeModal
          onClose={() => setIsCollageModalOpen(false)}
          onCreateCollageDoc={handleCreateNewDocument}
        />
      )}

      {isImageSizeModalOpen && activeDoc && (
        <ImageSizeModal
          document={activeDoc}
          onClose={() => setIsImageSizeModalOpen(false)}
          onResizeImage={(newW, newH) => {
            const resizedLayers = activeDoc.layers.map((layer) => {
              if (!layer.canvas) return layer;
              const rc = document.createElement('canvas');
              rc.width = newW;
              rc.height = newH;
              const ctx = rc.getContext('2d')!;
              ctx.drawImage(layer.canvas, 0, 0, newW, newH);
              return {
                ...layer,
                width: newW,
                height: newH,
                canvas: rc,
              };
            });
            handleUpdateDocument(
              { ...activeDoc, width: newW, height: newH, layers: resizedLayers },
              true,
              `Resize Image to ${newW}x${newH}`
            );
          }}
        />
      )}

      {isCanvasSizeModalOpen && activeDoc && (
        <CanvasSizeModal
          document={activeDoc}
          onClose={() => setIsCanvasSizeModalOpen(false)}
          onResizeCanvas={(newW, newH) => {
            handleUpdateDocument(
              { ...activeDoc, width: newW, height: newH },
              true,
              `Resize Canvas to ${newW}x${newH}`
            );
          }}
        />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={PALETTE_COMMANDS}
      />

      {isShortcutsModalOpen && (
        <KeyboardShortcutsModal onClose={() => setIsShortcutsModalOpen(false)} />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          showRulers={showRulers}
          setShowRulers={setShowRulers}
          showGuides={showGuides}
          setShowGuides={setShowGuides}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
        />
      )}
    </div>
  );
}

export default App;
