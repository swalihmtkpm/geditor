/**
 * High-Performance Professional Canvas Engine & Viewport
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  GProDocument,
  ToolType,
  Point,
  BrushSettings,
  Layer,
} from '../types';
import { renderDocument } from '../engine/compositor';
import { strokeBrushLine } from '../engine/brushEngine';
import { applyCloneDab, applySpotHealing, applyDodgeBurnSponge } from '../engine/healingClone';
import {
  createRectSelection,
  createEllipseSelection,
  createPolygonSelection,
  createMagicWandSelection,
} from '../engine/selectionEngine';
import { rgbToHex } from '../utils/color';

interface CanvasAreaProps {
  document: GProDocument;
  activeTool: ToolType;
  brushSettings: BrushSettings;
  foregroundColor: string;
  backgroundColor: string;
  setForegroundColor: (color: string) => void;
  beforeAfterMode: 'off' | 'split' | 'side-by-side';
  showRulers: boolean;
  showGuides: boolean;
  showGrid: boolean;
  onUpdateDocument: (doc: GProDocument, recordHistory?: boolean, desc?: string) => void;
  onCursorMove: (coords: { x: number; y: number } | null) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  document: doc,
  activeTool,
  brushSettings,
  foregroundColor,
  backgroundColor,
  setForegroundColor,
  beforeAfterMode,
  showRulers,
  showGuides,
  showGrid,
  onUpdateDocument,
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [cloneSourcePoint, setCloneSourcePoint] = useState<Point | null>(null);
  const [splitPosition, setSplitPosition] = useState(0.5); // 0..1 for split slider

  // Crop Handles State
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: doc.width,
    h: doc.height,
  });

  // Re-render layer composite to canvas
  const compositeRef = useCallback(() => {
    if (!mainCanvasRef.current) return;
    renderDocument(doc, mainCanvasRef.current);

    // If before/after is enabled, render the initial snapshot
    if (beforeAfterMode !== 'off' && beforeCanvasRef.current && doc.history.length > 0) {
      // Clean background comparison
      const bCtx = beforeCanvasRef.current.getContext('2d')!;
      beforeCanvasRef.current.width = doc.width;
      beforeCanvasRef.current.height = doc.height;
      if (doc.layers.length > 0 && doc.layers[0].canvas) {
        bCtx.drawImage(doc.layers[0].canvas, 0, 0);
      }
    }
  }, [doc, beforeAfterMode]);

  useEffect(() => {
    compositeRef();
  }, [compositeRef]);

  // Spacebar hotkey for temporary pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Convert Viewport Mouse Event to Document Pixel Coordinates
  const getDocCoords = (e: React.MouseEvent<HTMLDivElement>): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2 + doc.pan.x;
    const cy = rect.height / 2 + doc.pan.y;

    const mouseX = e.clientX - rect.left - cx;
    const mouseY = e.clientY - rect.top - cy;

    // Apply inverse zoom and rotation
    const rad = (-doc.canvasRotation * Math.PI) / 180;
    const rotX = mouseX * Math.cos(rad) - mouseY * Math.sin(rad);
    const rotY = mouseX * Math.sin(rad) + mouseY * Math.cos(rad);

    const docX = rotX / doc.zoom + doc.width / 2;
    const docY = rotY / doc.zoom + doc.height / 2;

    return { x: docX, y: docY };
  };

  // Wheel Zoom and Pan
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newZoom = Math.max(0.05, Math.min(32, doc.zoom * zoomFactor));
      onUpdateDocument({ ...doc, zoom: newZoom });
    } else {
      // Pan
      const newPan = {
        x: doc.pan.x - e.deltaX,
        y: doc.pan.y - e.deltaY,
      };
      onUpdateDocument({ ...doc, pan: newPan });
    }
  };

  // Pointer Down
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getDocCoords(e);

    // Pan with Middle Click or Spacebar or Hand tool
    if (e.button === 1 || spacePressed || activeTool === 'hand') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return; // Only left click for drawing/tools

    setIsInteracting(true);
    setDragStartPoint(coords);
    setLastMousePos(coords);

    // Active Layer
    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

    // 1. Eyedropper Tool
    if (activeTool === 'eyedropper' && mainCanvasRef.current) {
      const ctx = mainCanvasRef.current.getContext('2d')!;
      const px = Math.max(0, Math.min(doc.width - 1, Math.round(coords.x)));
      const py = Math.max(0, Math.min(doc.height - 1, Math.round(coords.y)));
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setForegroundColor(hex);
      return;
    }

    // 2. Clone Stamp Source Set (Alt + Click)
    if (activeTool === 'clone-stamp' && e.altKey) {
      setCloneSourcePoint(coords);
      return;
    }

    // 3. Magic Wand Tool
    if (activeTool === 'magic-wand' && mainCanvasRef.current) {
      const maskCanvas = createMagicWandSelection(mainCanvasRef.current, coords.x, coords.y, 32);
      onUpdateDocument({
        ...doc,
        selection: {
          ...doc.selection,
          active: true,
          maskCanvas,
        },
      }, true, 'Magic Wand Selection');
      return;
    }

    // 4. Spot Healing Tool
    if (activeTool === 'spot-healing' && activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      applySpotHealing(ctx, coords, brushSettings.size / 2);
      compositeRef();
      return;
    }

    // 5. Paint Bucket Fill
    if (activeTool === 'paint-bucket' && activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      ctx.fillStyle = foregroundColor;
      ctx.fillRect(0, 0, activeLayer.width, activeLayer.height);
      compositeRef();
      onUpdateDocument({ ...doc }, true, 'Paint Bucket Fill');
      return;
    }

    // 6. Brush / Pencil Initial Dab
    if ((activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser') && activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      ctx.save();
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }
      strokeBrushLine(ctx, coords, coords, foregroundColor, brushSettings);
      ctx.restore();
      compositeRef();
    }

    // 7. Lasso start
    if (activeTool === 'lasso-free' || activeTool === 'lasso-poly') {
      setLassoPoints([coords]);
    }
  };

  // Pointer Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getDocCoords(e);
    onCursorMove(coords);

    // Handle Panning
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      onUpdateDocument({
        ...doc,
        pan: { x: doc.pan.x + dx, y: doc.pan.y + dy },
      });
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isInteracting || !dragStartPoint) return;

    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

    // 1. Brush / Pencil / Eraser Continuous Stroke
    if ((activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser') && activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      ctx.save();
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }
      strokeBrushLine(ctx, lastMousePos, coords, foregroundColor, brushSettings);
      ctx.restore();
      compositeRef();
      setLastMousePos(coords);
    }

    // 2. Clone Stamp Dragging
    else if (activeTool === 'clone-stamp' && cloneSourcePoint && activeLayer && activeLayer.canvas && mainCanvasRef.current) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      const offset = {
        x: cloneSourcePoint.x + (coords.x - dragStartPoint.x),
        y: cloneSourcePoint.y + (coords.y - dragStartPoint.y),
      };
      applyCloneDab(ctx, mainCanvasRef.current, coords, offset, brushSettings);
      compositeRef();
      setLastMousePos(coords);
    }

    // 3. Dodge / Burn / Sponge
    else if ((activeTool === 'dodge' || activeTool === 'burn' || activeTool === 'sponge') && activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      applyDodgeBurnSponge(ctx, coords, brushSettings, activeTool);
      compositeRef();
      setLastMousePos(coords);
    }

    // 4. Lasso points collection
    else if (activeTool === 'lasso-free') {
      setLassoPoints((prev) => [...prev, coords]);
    }

    // 5. Overlay Render (Marquee / Shapes / Crop Preview)
    if (overlayCanvasRef.current) {
      const oCtx = overlayCanvasRef.current.getContext('2d')!;
      overlayCanvasRef.current.width = doc.width;
      overlayCanvasRef.current.height = doc.height;
      oCtx.clearRect(0, 0, doc.width, doc.height);

      const w = coords.x - dragStartPoint.x;
      const h = coords.y - dragStartPoint.y;

      oCtx.strokeStyle = '#38bdf8';
      oCtx.lineWidth = 1.5 / doc.zoom;
      oCtx.setLineDash([4 / doc.zoom, 4 / doc.zoom]);

      if (activeTool === 'marquee-rect') {
        oCtx.strokeRect(dragStartPoint.x, dragStartPoint.y, w, h);
      } else if (activeTool === 'marquee-ellipse') {
        oCtx.beginPath();
        oCtx.ellipse(
          dragStartPoint.x + w / 2,
          dragStartPoint.y + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0, 0, Math.PI * 2
        );
        oCtx.stroke();
      } else if (activeTool === 'crop') {
        oCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        oCtx.fillRect(0, 0, doc.width, doc.height);
        oCtx.clearRect(dragStartPoint.x, dragStartPoint.y, w, h);
        oCtx.strokeRect(dragStartPoint.x, dragStartPoint.y, w, h);
      }
    }
  };

  // Pointer Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isInteracting && dragStartPoint) {
      const endCoords = lastMousePos;
      const w = endCoords.x - dragStartPoint.x;
      const h = endCoords.y - dragStartPoint.y;

      // 1. Finalize Marquee Selection
      if (activeTool === 'marquee-rect' && (Math.abs(w) > 4 || Math.abs(h) > 4)) {
        const maskCanvas = createRectSelection(doc.width, doc.height, dragStartPoint.x, dragStartPoint.y, w, h);
        onUpdateDocument({
          ...doc,
          selection: { ...doc.selection, active: true, maskCanvas },
        }, true, 'Rectangular Marquee');
      } else if (activeTool === 'marquee-ellipse' && (Math.abs(w) > 4 || Math.abs(h) > 4)) {
        const maskCanvas = createEllipseSelection(doc.width, doc.height, dragStartPoint.x, dragStartPoint.y, w, h);
        onUpdateDocument({
          ...doc,
          selection: { ...doc.selection, active: true, maskCanvas },
        }, true, 'Elliptical Marquee');
      }

      // 2. Finalize Lasso Selection
      else if (activeTool === 'lasso-free' && lassoPoints.length > 3) {
        const maskCanvas = createPolygonSelection(doc.width, doc.height, lassoPoints);
        onUpdateDocument({
          ...doc,
          selection: { ...doc.selection, active: true, maskCanvas },
        }, true, 'Lasso Selection');
        setLassoPoints([]);
      }

      // 3. Finalize Shape Creation
      else if (activeTool.startsWith('shape-') && (Math.abs(w) > 8 || Math.abs(h) > 8)) {
        const shapeTypeMap: any = {
          'shape-rect': 'rect',
          'shape-rounded-rect': 'rounded-rect',
          'shape-ellipse': 'ellipse',
          'shape-star': 'star',
          'shape-line': 'line',
          'shape-arrow': 'arrow',
        };

        const newShapeLayer: Layer = {
          id: 'layer-shape-' + Date.now(),
          name: `${activeTool.replace('shape-', '').toUpperCase()} Shape`,
          type: 'shape',
          shapeType: shapeTypeMap[activeTool] || 'rect',
          visible: true,
          locked: false,
          opacity: 1,
          fillOpacity: 1,
          blendMode: 'normal',
          x: Math.min(dragStartPoint.x, endCoords.x),
          y: Math.min(dragStartPoint.y, endCoords.y),
          width: Math.abs(w),
          height: Math.abs(h),
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          fillColor: foregroundColor,
          strokeColor: '#ffffff',
          strokeWidth: 2,
          cornerRadius: 16,
        };

        onUpdateDocument({
          ...doc,
          layers: [...doc.layers, newShapeLayer],
          activeLayerId: newShapeLayer.id,
        }, true, 'Add Vector Shape');
      }

      // 4. Finalize Brush / Retouch History Action
      else if (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'clone-stamp' || activeTool === 'spot-healing') {
        onUpdateDocument({ ...doc }, true, `${activeTool.toUpperCase()} Stroke`);
      }

      // Clear overlay
      if (overlayCanvasRef.current) {
        const oCtx = overlayCanvasRef.current.getContext('2d')!;
        oCtx.clearRect(0, 0, doc.width, doc.height);
      }
    }

    setIsInteracting(false);
    setDragStartPoint(null);
  };

  // Cursor style calculation
  const getCursorStyle = () => {
    if (isPanning || spacePressed) return 'grab';
    if (activeTool === 'hand') return 'grab';
    if (activeTool === 'eyedropper') return 'crosshair';
    if (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'clone-stamp') return 'crosshair';
    if (activeTool.startsWith('marquee-') || activeTool.startsWith('lasso-') || activeTool === 'magic-wand') return 'crosshair';
    if (activeTool === 'text') return 'text';
    return 'default';
  };

  return (
    <main
      id="gpro-canvas-viewport"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        onCursorMove(null);
      }}
      className="relative flex-1 bg-[#101216] overflow-hidden select-none canvas-viewport flex items-center justify-center"
      style={{ cursor: getCursorStyle() }}
    >
      {/* Top & Left Rulers */}
      {showRulers && (
        <>
          {/* Top Ruler */}
          <div className="absolute top-0 left-6 right-0 h-6 bg-[#161820] border-b border-[#252834] z-30 pointer-events-none flex items-center text-[9px] text-gray-500 font-mono px-2 overflow-hidden">
            <span>0</span>
            <span className="ml-[100px]">200</span>
            <span className="ml-[100px]">400</span>
            <span className="ml-[100px]">600</span>
            <span className="ml-[100px]">800</span>
            <span className="ml-[100px]">1000</span>
            <span className="ml-[100px]">1200</span>
            <span className="ml-[100px]">1400</span>
            <span className="ml-[100px]">1600</span>
            <span className="ml-[100px]">1800</span>
          </div>
          {/* Left Ruler */}
          <div className="absolute top-6 left-0 bottom-0 w-6 bg-[#161820] border-r border-[#252834] z-30 pointer-events-none flex flex-col justify-start text-[9px] text-gray-500 font-mono py-2 overflow-hidden">
            <span className="mb-[60px] text-center">0</span>
            <span className="mb-[60px] text-center">200</span>
            <span className="mb-[60px] text-center">400</span>
            <span className="mb-[60px] text-center">600</span>
            <span className="mb-[60px] text-center">800</span>
            <span className="mb-[60px] text-center">1000</span>
          </div>
        </>
      )}

      {/* Canvas Transform Container */}
      <div
        id="canvas-transform-wrapper"
        style={{
          transform: `translate(${doc.pan.x}px, ${doc.pan.y}px) rotate(${doc.canvasRotation}deg) scale(${doc.zoom})`,
          width: doc.width,
          height: doc.height,
        }}
        className="relative shadow-2xl transition-transform duration-75 origin-center"
      >
        {/* Transparency Checkerboard */}
        <div className="absolute inset-0 canvas-checkerboard rounded-[1px] pointer-events-none" />

        {/* Main Composite Canvas */}
        <canvas
          id="gpro-main-canvas"
          ref={mainCanvasRef}
          width={doc.width}
          height={doc.height}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Before / After Split View Overlay */}
        {beforeAfterMode === 'split' && (
          <div
            className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl pointer-events-none"
            style={{ width: `${splitPosition * 100}%` }}
          >
            <canvas
              ref={beforeCanvasRef}
              width={doc.width}
              height={doc.height}
              className="absolute inset-0 w-full h-full block"
            />
          </div>
        )}

        {/* Interactive Tool / Selection Overlay Canvas */}
        <canvas
          id="gpro-overlay-canvas"
          ref={overlayCanvasRef}
          width={doc.width}
          height={doc.height}
          className="absolute inset-0 w-full h-full block pointer-events-none z-20"
        />

        {/* Canvas Guides */}
        {showGuides &&
          doc.guides.map((g) => (
            <div
              key={g.id}
              style={
                g.orientation === 'horizontal'
                  ? { top: `${g.position}px`, left: 0, right: 0, height: `${1 / doc.zoom}px` }
                  : { left: `${g.position}px`, top: 0, bottom: 0, width: `${1 / doc.zoom}px` }
              }
              className="absolute bg-cyan-400 opacity-70 pointer-events-none z-30"
            />
          ))}

        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        )}
      </div>
    </main>
  );
};
