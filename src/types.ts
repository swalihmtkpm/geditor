/**
 * G-PRO Professional Photo Editor - Type Definitions
 * 100% Non-AI Digital Darkroom & Graphic Suite
 */

export type ToolType =
  | 'move'
  | 'marquee-rect'
  | 'marquee-ellipse'
  | 'lasso-free'
  | 'lasso-poly'
  | 'lasso-magnetic'
  | 'magic-wand'
  | 'quick-select'
  | 'crop'
  | 'perspective-crop'
  | 'slice'
  | 'eyedropper'
  | 'color-sampler'
  | 'spot-healing'
  | 'healing-brush'
  | 'clone-stamp'
  | 'pattern-stamp'
  | 'eraser'
  | 'bg-eraser'
  | 'magic-eraser'
  | 'blur-tool'
  | 'sharpen-tool'
  | 'smudge-tool'
  | 'dodge'
  | 'burn'
  | 'sponge'
  | 'brush'
  | 'pencil'
  | 'mixer-brush'
  | 'gradient'
  | 'paint-bucket'
  | 'pen'
  | 'path-select'
  | 'shape-rect'
  | 'shape-rounded-rect'
  | 'shape-ellipse'
  | 'shape-polygon'
  | 'shape-star'
  | 'shape-line'
  | 'shape-arrow'
  | 'text'
  | 'hand'
  | 'zoom';

export type BlendMode =
  | 'normal'
  | 'dissolve'
  | 'darken'
  | 'multiply'
  | 'color-burn'
  | 'linear-burn'
  | 'darker-color'
  | 'lighten'
  | 'screen'
  | 'color-dodge'
  | 'linear-dodge'
  | 'lighter-color'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'vivid-light'
  | 'linear-light'
  | 'pin-light'
  | 'hard-mix'
  | 'difference'
  | 'exclusion'
  | 'subtract'
  | 'divide'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type LayerType = 'pixel' | 'adjustment' | 'text' | 'shape' | 'group' | 'fill';

export interface Point {
  x: number;
  y: number;
}

export type ColorPoint = Point;

export interface CurvePoint {
  x: number; // 0 to 255
  y: number; // 0 to 255
}

export interface CurvesAdjustment {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface LevelsChannel {
  blackPoint: number; // 0 - 255
  gamma: number;      // 0.1 - 9.99 (1.0 = neutral)
  whitePoint: number; // 0 - 255
  outputBlack: number;// 0 - 255
  outputWhite: number;// 0 - 255
}

export interface LevelsAdjustment {
  rgb: LevelsChannel;
  red: LevelsChannel;
  green: LevelsChannel;
  blue: LevelsChannel;
}

export interface HSLBand {
  hue: number;        // -180 to 180
  saturation: number; // -100 to 100
  lightness: number;  // -100 to 100
}

export interface HSLAdjustment {
  red: HSLBand;
  orange: HSLBand;
  yellow: HSLBand;
  green: HSLBand;
  aqua: HSLBand;
  blue: HSLBand;
  purple: HSLBand;
  magenta: HSLBand;
}

export interface SelectiveColorBand {
  cyan: number;    // -100 to 100
  magenta: number; // -100 to 100
  yellow: number;  // -100 to 100
  black: number;   // -100 to 100
}

export interface SelectiveColorAdjustment {
  reds: SelectiveColorBand;
  yellows: SelectiveColorBand;
  greens: SelectiveColorBand;
  cyans: SelectiveColorBand;
  blues: SelectiveColorBand;
  magentas: SelectiveColorBand;
  whites: SelectiveColorBand;
  neutrals: SelectiveColorBand;
  blacks: SelectiveColorBand;
  relative: boolean;
}

export interface ColorBalanceAdjustment {
  shadows: { cyanRed: number; magentaGreen: number; yellowBlue: number };
  midtones: { cyanRed: number; magentaGreen: number; yellowBlue: number };
  highlights: { cyanRed: number; magentaGreen: number; yellowBlue: number };
  preserveLuminosity: boolean;
}

export interface BlackAndWhiteAdjustment {
  reds: number;
  oranges: number;
  yellows: number;
  greens: number;
  cyans: number;
  blues: number;
  purples: number;
  magentas: number;
  tintColor?: string;
  tintAmount: number;
}

export interface ColorWheelGrade {
  hue: number;        // 0 to 360
  saturation: number; // 0 to 100
  luminance: number;  // -100 to 100
}

export interface ColorGradingAdjustment {
  shadows: ColorWheelGrade;
  midtones: ColorWheelGrade;
  highlights: ColorWheelGrade;
  global: ColorWheelGrade;
  blending: number; // 0 to 100
  balance: number;  // -100 to 100
}

export interface BasicAdjustments {
  // Light
  exposure: number;   // -5 to +5 EV
  brightness: number; // -100 to +100
  contrast: number;   // -100 to +100
  highlights: number; // -100 to +100
  shadows: number;    // -100 to +100
  whites: number;     // -100 to +100
  blacks: number;     // -100 to +100

  // Color
  temperature: number; // -100 (cool) to +100 (warm)
  tint: number;        // -100 (green) to +100 (magenta)
  saturation: number;  // -100 to +100
  vibrance: number;    // -100 to +100
  hue: number;         // -180 to +180

  // Detail
  texture: number;         // -100 to +100
  clarity: number;         // -100 to +100
  dehaze: number;          // -100 to +100
  sharpness: number;       // 0 to +100
  noiseReduction: number;  // 0 to +100

  // Creative Effects
  vignette: number;        // -100 (dark) to +100 (white)
  grain: number;           // 0 to 100
  fade: number;            // 0 to 100
  bloom: number;           // 0 to 100
  chromaticAberration: number; // 0 to 50
  lutId?: string;
  lutIntensity?: number;   // 0 to 100
}

export interface LayerEffects {
  dropShadow?: {
    enabled: boolean;
    color: string;
    opacity: number;
    angle: number;
    distance: number;
    spread: number;
    size: number;
  };
  innerShadow?: {
    enabled: boolean;
    color: string;
    opacity: number;
    angle: number;
    distance: number;
    size: number;
  };
  outerGlow?: {
    enabled: boolean;
    color: string;
    opacity: number;
    size: number;
  };
  innerGlow?: {
    enabled: boolean;
    color: string;
    opacity: number;
    size: number;
  };
  stroke?: {
    enabled: boolean;
    color: string;
    size: number;
    position: 'outside' | 'inside' | 'center';
    opacity: number;
  };
  colorOverlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
    blendMode: BlendMode;
  };
  bevelEmboss?: {
    enabled: boolean;
    style: 'inner-bevel' | 'outer-bevel' | 'emboss';
    depth: number;
    size: number;
    angle: number;
  };
}

export interface LayerMask {
  enabled: boolean;
  inverted: boolean;
  density: number; // 0 - 100
  feather: number; // 0 - 50 px
  canvas: HTMLCanvasElement; // Grayscale mask buffer
}

export interface VectorPathNode {
  x: number;
  y: number;
  handleIn?: Point;
  handleOut?: Point;
}

export interface VectorPath {
  nodes: VectorPathNode[];
  closed: boolean;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  fillOpacity: number; // 0 to 1
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;

  // Pixel Layer
  canvas?: HTMLCanvasElement;

  // Mask & Clipping
  mask?: LayerMask;
  isClippingMask?: boolean; // Clips to layer below

  // Adjustment Layer specific
  adjustmentType?:
    | 'basic'
    | 'curves'
    | 'levels'
    | 'hsl'
    | 'selective-color'
    | 'color-balance'
    | 'black-and-white'
    | 'color-grading'
    | 'gradient-map'
    | 'photo-filter'
    | 'threshold'
    | 'posterize'
    | 'invert';
  basicAdjustments?: BasicAdjustments;
  curves?: CurvesAdjustment;
  levels?: LevelsAdjustment;
  hsl?: HSLAdjustment;
  selectiveColor?: SelectiveColorAdjustment;
  colorBalance?: ColorBalanceAdjustment;
  blackAndWhite?: BlackAndWhiteAdjustment;
  colorGrading?: ColorGradingAdjustment;
  thresholdValue?: number;
  posterizeLevels?: number;
  photoFilterColor?: string;
  photoFilterDensity?: number;

  // Text Layer
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;

  // Shape Layer
  shapeType?: 'rect' | 'rounded-rect' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'line' | 'arrow' | 'custom-path';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDash?: number[];
  cornerRadius?: number;
  polygonSides?: number;
  starPoints?: number;
  starInnerRadius?: number;
  customPath?: VectorPath;

  // Group Layer
  childrenIds?: string[];
  collapsed?: boolean;

  // Layer Effects
  effects?: LayerEffects;
}

export interface SelectionState {
  active: boolean;
  path?: Point[]; // Marching ants boundary
  maskCanvas?: HTMLCanvasElement; // 1-bit or 8-bit selection mask
  feather: number;
  mode: 'replace' | 'add' | 'subtract' | 'intersect';
}

export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
}

export interface HistoryItem {
  id: string;
  description: string;
  timestamp: number;
  thumbnailUrl?: string;
  documentState: string; // Serialized Document state
}

export type HistoryStep = HistoryItem;

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  thumbnailUrl?: string;
  documentState: string;
}

export interface ExifMetadata {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  dateTime?: string;
  colorProfile?: string;
  orientation?: number;
  dimensions?: string;
  megapixels?: string;
}

export interface GProDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  colorMode: 'RGB' | 'Grayscale' | 'CMYK-Preview';
  bitDepth: 8 | 16;
  colorProfile: 'sRGB' | 'Display P3' | 'Adobe RGB';
  layers: Layer[];
  activeLayerId: string;
  history: HistoryItem[];
  historyIndex: number;
  snapshots: Snapshot[];
  guides: Guide[];
  zoom: number;
  pan: Point;
  canvasRotation: number;
  selection: SelectionState;
  metadata?: ExifMetadata;
  isModified: boolean;
  createdAt: number;
}

export interface BrushSettings {
  size: number;
  hardness: number; // 0 (soft) to 100 (hard)
  opacity: number;  // 0 to 100
  flow: number;     // 0 to 100
  spacing: number;  // 1 to 100
  angle: number;    // 0 to 360
  roundness: number;// 1 to 100
  scatter: number;  // 0 to 100
  jitter: number;   // 0 to 100
  pressureSensitivity: boolean;
  category: 'basic' | 'soft' | 'hard' | 'pencil' | 'ink' | 'marker' | 'airbrush' | 'chalk' | 'texture' | 'painting';
}

export type WorkspaceType = 'photography' | 'retouching' | 'graphic-design' | 'color-grading' | 'minimal' | 'custom';

export interface UserPreferences {
  theme: 'dark' | 'midnight' | 'slate' | 'neutral';
  uiScale: number;
  gpuAcceleration: boolean;
  showRulers: boolean;
  showGuides: boolean;
  showGrid: boolean;
  snapToGuides: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  autoSaveIntervalMinutes: number;
  defaultExportFormat: 'jpg' | 'png' | 'webp';
  defaultExportQuality: number;
  preserveMetadata: boolean;
}

export interface LutDefinition {
  id: string;
  name: string;
  category: 'Cinematic' | 'Vintage' | 'Monochrome' | 'Warm' | 'Cool' | 'Creative';
  dataUrl?: string; // 3D cube or 2D LUT representation
}

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  adjustments: Partial<BasicAdjustments>;
  curves?: CurvesAdjustment;
  hsl?: HSLAdjustment;
  colorGrading?: ColorGradingAdjustment;
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  imageDataUrl?: string;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
}

export interface ExportSettings {
  format: 'jpg' | 'png' | 'webp' | 'bmp' | 'svg' | 'gpro';
  quality: number; // 0 to 100
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  dpi: number;
  preserveMetadata: boolean;
  watermark: WatermarkSettings;
}
