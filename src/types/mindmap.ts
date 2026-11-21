export type NodeStyle = 'underline' | 'bubble' | 'card';
export type LayoutDirection = 'radial' | 'right' | 'left' | 'vertical';
export type ThemeName = 'miro-vibrant' | 'ocean' | 'sunset' | 'forest' | 'monochrome';

export interface NodeImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface MindMapNode {
  id: string;
  text: string;
  parentId: string | null;
  childrenIds: string[];
  side?: 'left' | 'right'; // For root level branches in radial layout
  color?: string; // Hex color for the branch and node accents
  nodeStyle?: NodeStyle;
  image?: NodeImage;
  isCollapsed?: boolean;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  isBold?: boolean;
  isItalic?: boolean;
  note?: string;
  branchOrigin?: 'centre' | 'baseline';
  // Optional manual drag offset
  offsetX?: number;
  offsetY?: number;
}

export interface MindMapLink {
  id:string;
  fromNodeId:string;
  toNodeId:string;
  label?:string;
  color?:string;
}

export interface MindMap {
  folderId?:string;
  links?:MindMapLink[];
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindMapNode>;
  layout: LayoutDirection;
  nodeStyle: NodeStyle;
  theme: ThemeName;
  createdAt: number;
  updatedAt: number;
}

export interface NodeLayoutPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right';
  depth: number;
  color: string;
  inAnchor: { x: number; y: number };
  outAnchor: { x: number; y: number };
  branchColor: string;
}

export interface BranchPathData {
  fromNodeId: string;
  toNodeId: string;
  pathString: string;
  color: string;
  strokeWidth: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  underlinePath?: string; // Underline path under text for Miro style
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface ExportSettings {
  format: 'png' | 'pdf' | 'svg' | 'json';
  scale: 1 | 2 | 4; // 1x, 2x (retina), 4x (high-res 300dpi)
  background: 'white' | 'transparent' | 'grid';
  includeTitle: boolean;
  pdfOrientation: 'landscape' | 'portrait';
  pdfFormat: 'a4' | 'fit';
}

