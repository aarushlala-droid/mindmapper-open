import { routeMapLinks } from './connections';
import { measureNode } from './text';
import {
  MindMap,
  MindMapNode,
  NodeLayoutPosition,
  BranchPathData,
  NodeStyle,
} from '../types/mindmap';
import { createMiroBezierPath, getBranchStrokeWidth, createUnderlinePath } from './bezier';

export const THEME_PALETTES: Record<string, string[]> = {
  'miro-vibrant': [
    '#EC4899', // Magenta / Pink (Miro classic)
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EAB308', // Amber / Gold
    '#F97316', // Orange
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F43F5E', // Rose
  ],
  ocean: [
    '#0284C7', // Sky Blue
    '#0D9488', // Teal
    '#2563EB', // Royal Blue
    '#0891B2', // Cyan
    '#4F46E5', // Indigo
    '#059669', // Emerald
  ],
  sunset: [
    '#E11D48', // Rose
    '#EA580C', // Orange
    '#D97706', // Amber
    '#DB2777', // Pink
    '#9333EA', // Violet
  ],
  forest: [
    '#15803D', // Green
    '#0F766E', // Teal
    '#4D7C0F', // Lime
    '#047857', // Emerald
    '#B45309', // Earth Amber
  ],
  monochrome: [
    '#334155', // Slate
    '#475569',
    '#1E293B',
    '#0F172A',
    '#64748B',
  ],
};

const DEFAULT_VERTICAL_GAP = 32;
const DEFAULT_HORIZONTAL_GAP = 88;

/**
 * Estimates node width and height based on text content, font size, and attached image.
 */
export function estimateNodeDimensions(
  node: MindMapNode,
  isRoot: boolean,
  globalStyle: NodeStyle
): { width: number; height: number } {
  const { width, height } = measureNode(node, isRoot, globalStyle);
  return { width, height };
}

interface SubtreeMetrics {
  totalHeight: number;
  nodeWidth: number;
  nodeHeight: number;
}

/**
 * Computes complete 2D layout for the mind map.
 */
export function computeMindMapLayout(mindMap: MindMap, measured: Record<string, {width:number;height:number}> = {}): {
  nodePositions: Map<string, NodeLayoutPosition>;
  branches: BranchPathData[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const { rootId, nodes, layout, theme, nodeStyle } = mindMap;
  const rootNode = nodes[rootId];

  const nodePositions = new Map<string, NodeLayoutPosition>();
  const branches: BranchPathData[] = [];

  if (!rootNode) {
    return {
      nodePositions,
      branches,
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  const palette = THEME_PALETTES[theme] || THEME_PALETTES['miro-vibrant'];

  // 1. Measure root
  const rootDim = measured[rootId] || estimateNodeDimensions(rootNode, true, nodeStyle);
  const rootX = -rootDim.width / 2 + (rootNode.offsetX || 0);
  const rootY = -rootDim.height / 2 + (rootNode.offsetY || 0);

  nodePositions.set(rootId, {
    id: rootId,
    x: rootX,
    y: rootY,
    width: rootDim.width,
    height: rootDim.height,
    side: 'right',
    depth: 0,
    color: rootNode.color || '#3B82F6',
    branchColor: '#3B82F6',
    inAnchor: { x: rootX + rootDim.width / 2, y: rootY + rootDim.height / 2 },
    outAnchor: { x: rootX + rootDim.width, y: rootY + rootDim.height / 2 },
  });

  // Filter valid children
  const rootChildren = (rootNode.childrenIds || [])
    .map((id) => nodes[id])
    .filter((n): n is MindMapNode => Boolean(n));

  // Partition root children into Left and Right
  const rightChildren: MindMapNode[] = [];
  const leftChildren: MindMapNode[] = [];

  if (layout === 'right') {
    rightChildren.push(...rootChildren);
  } else if (layout === 'left') {
    leftChildren.push(...rootChildren);
  } else {
    // Radial bi-directional: distribute
    rootChildren.forEach((child, index) => {
      if (child.side === 'left') {
        leftChildren.push(child);
      } else if (child.side === 'right') {
        rightChildren.push(child);
      } else {
        // Auto alternate
        if (index % 2 === 0) {
          rightChildren.push(child);
        } else {
          leftChildren.push(child);
        }
      }
    });
  }

  // Recursive subtree height calculation
  function calculateSubtreeMetrics(nodeId: string, currentDepth: number): SubtreeMetrics {
    const node = nodes[nodeId];
    if (!node) return { totalHeight: 0, nodeWidth: 0, nodeHeight: 0 };

    const dim = measured[nodeId] || estimateNodeDimensions(node, false, nodeStyle);

    if (node.isCollapsed || !node.childrenIds || node.childrenIds.length === 0) {
      return {
        totalHeight: dim.height + DEFAULT_VERTICAL_GAP,
        nodeWidth: dim.width,
        nodeHeight: dim.height,
      };
    }

    const validKids = node.childrenIds
      .map((id) => nodes[id])
      .filter((n): n is MindMapNode => Boolean(n));

    if (validKids.length === 0) {
      return {
        totalHeight: dim.height + DEFAULT_VERTICAL_GAP,
        nodeWidth: dim.width,
        nodeHeight: dim.height,
      };
    }

    let childrenHeightSum = 0;
    for (const kid of validKids) {
      const kidMetrics = calculateSubtreeMetrics(kid.id, currentDepth + 1);
      childrenHeightSum += kidMetrics.totalHeight;
    }

    return {
      totalHeight: Math.max(dim.height + DEFAULT_VERTICAL_GAP, childrenHeightSum),
      nodeWidth: dim.width,
      nodeHeight: dim.height,
    };
  }

  // Recursive placement
  function positionSubtree(
    nodeId: string,
    side: 'left' | 'right',
    depth: number,
    branchColor: string,
    startX: number,
    centerY: number
  ) {
    const node = nodes[nodeId];
    if (!node) return;

    const dim = measured[nodeId] || estimateNodeDimensions(node, false, nodeStyle);
    const effectiveColor = node.color || branchColor;

    const posX = (side === 'right' ? startX : startX - dim.width) + (node.offsetX || 0);
    const posY = centerY - dim.height / 2 + (node.offsetY || 0);

    const effectiveNodeStyle = node.nodeStyle || nodeStyle;
    const isUnderline = effectiveNodeStyle === 'underline';

    // Calculate in/out anchors
    let inAnchor: { x: number; y: number };
    let outAnchor: { x: number; y: number };

    if (side === 'right') {
      if (node.branchOrigin === 'baseline') {
        inAnchor = { x: posX, y: posY + dim.height - 2 };
        outAnchor = { x: posX + dim.width, y: posY + dim.height - 2 };
      } else {
        inAnchor = { x: posX, y: posY + dim.height / 2 };
        outAnchor = { x: posX + dim.width, y: posY + dim.height / 2 };
      }
    } else {
      if (node.branchOrigin === 'baseline') {
        inAnchor = { x: posX + dim.width, y: posY + dim.height - 2 };
        outAnchor = { x: posX, y: posY + dim.height - 2 };
      } else {
        inAnchor = { x: posX + dim.width, y: posY + dim.height / 2 };
        outAnchor = { x: posX, y: posY + dim.height / 2 };
      }
    }

    const pos: NodeLayoutPosition = {
      id: nodeId,
      x: posX,
      y: posY,
      width: dim.width,
      height: dim.height,
      side,
      depth,
      color: effectiveColor,
      branchColor: effectiveColor,
      inAnchor,
      outAnchor,
    };
    nodePositions.set(nodeId, pos);

    // If collapsed, don't layout children
    if (node.isCollapsed) return;

    const validKids = (node.childrenIds || [])
      .map((id) => nodes[id])
      .filter((n): n is MindMapNode => Boolean(n));

    if (validKids.length === 0) return;

    // Calculate heights of children
    const kidsMetrics = validKids.map((k) => ({
      node: k,
      metrics: calculateSubtreeMetrics(k.id, depth + 1),
    }));

    const totalChildrenHeight = kidsMetrics.reduce((sum, item) => sum + item.metrics.totalHeight, 0);

    let currentChildTop = (posY + dim.height / 2) - totalChildrenHeight / 2;
    const nextStartX = side === 'right' ? posX + dim.width + DEFAULT_HORIZONTAL_GAP : posX - DEFAULT_HORIZONTAL_GAP;

    for (const { node: kid, metrics } of kidsMetrics) {
      const kidCenterY = currentChildTop + metrics.totalHeight / 2;

      // Position child
      positionSubtree(kid.id, side, depth + 1, effectiveColor, nextStartX, kidCenterY);

      // Create branch connecting from current outAnchor to child inAnchor
      const kidPos = nodePositions.get(kid.id);
      if (kidPos) {
        const pathString = createMiroBezierPath({
          x1: outAnchor.x,
          y1: outAnchor.y,
          x2: kidPos.inAnchor.x,
          y2: kidPos.inAnchor.y,
          side,
          depth: depth + 1,
        });

        const strokeWidth = getBranchStrokeWidth(depth + 1);

        let underlinePath: string | undefined;
        if (isUnderline) {
          underlinePath = createUnderlinePath(posX, posY, dim.width, dim.height, side);
        }

        branches.push({
          fromNodeId: nodeId,
          toNodeId: kid.id,
          pathString,
          color: effectiveColor,
          strokeWidth,
          startX: outAnchor.x,
          startY: outAnchor.y,
          endX: kidPos.inAnchor.x,
          endY: kidPos.inAnchor.y,
          underlinePath,
        });
      }

      currentChildTop += metrics.totalHeight;
    }
  }

  // --- Position RIGHT side branches ---
  if (rightChildren.length > 0) {
    const rightMetrics = rightChildren.map((k) => ({
      node: k,
      metrics: calculateSubtreeMetrics(k.id, 1),
    }));
    const totalRightHeight = rightMetrics.reduce((sum, item) => sum + item.metrics.totalHeight, 0);
    let rightTop = 0 - totalRightHeight / 2;
    const rootRightAnchorX = rootX + rootDim.width;
    const rootRightAnchorY = rootNode.branchOrigin==='baseline'?rootY+rootDim.height-2:rootY+rootDim.height/2;

    rightMetrics.forEach(({ node: child, metrics }, idx) => {
      const childColor = child.color || palette[idx % palette.length];
      const childCenterY = rightTop + metrics.totalHeight / 2;
      const startX = rootRightAnchorX + DEFAULT_HORIZONTAL_GAP;

      positionSubtree(child.id, 'right', 1, childColor, startX, childCenterY);

      const childPos = nodePositions.get(child.id);
      if (childPos) {
        const pathString = createMiroBezierPath({
          x1: rootRightAnchorX,
          y1: rootRightAnchorY,
          x2: childPos.inAnchor.x,
          y2: childPos.inAnchor.y,
          side: 'right',
          depth: 1,
        });

        branches.push({
          fromNodeId: rootId,
          toNodeId: child.id,
          pathString,
          color: childColor,
          strokeWidth: getBranchStrokeWidth(1),
          startX: rootRightAnchorX,
          startY: rootRightAnchorY,
          endX: childPos.inAnchor.x,
          endY: childPos.inAnchor.y,
        });
      }

      rightTop += metrics.totalHeight;
    });
  }

  // --- Position LEFT side branches ---
  if (leftChildren.length > 0) {
    const leftMetrics = leftChildren.map((k) => ({
      node: k,
      metrics: calculateSubtreeMetrics(k.id, 1),
    }));
    const totalLeftHeight = leftMetrics.reduce((sum, item) => sum + item.metrics.totalHeight, 0);
    let leftTop = 0 - totalLeftHeight / 2;
    const rootLeftAnchorX = rootX;
    const rootLeftAnchorY = rootNode.branchOrigin==='baseline'?rootY+rootDim.height-2:rootY+rootDim.height/2;

    leftMetrics.forEach(({ node: child, metrics }, idx) => {
      // Offset palette index for distinct colors across left and right
      const colorIdx = (rightChildren.length + idx) % palette.length;
      const childColor = child.color || palette[colorIdx];
      const childCenterY = leftTop + metrics.totalHeight / 2;
      const startX = rootLeftAnchorX - DEFAULT_HORIZONTAL_GAP;

      positionSubtree(child.id, 'left', 1, childColor, startX, childCenterY);

      const childPos = nodePositions.get(child.id);
      if (childPos) {
        const pathString = createMiroBezierPath({
          x1: rootLeftAnchorX,
          y1: rootLeftAnchorY,
          x2: childPos.inAnchor.x,
          y2: childPos.inAnchor.y,
          side: 'left',
          depth: 1,
        });

        branches.push({
          fromNodeId: rootId,
          toNodeId: child.id,
          pathString,
          color: childColor,
          strokeWidth: getBranchStrokeWidth(1),
          startX: rootLeftAnchorX,
          startY: rootLeftAnchorY,
          endX: childPos.inAnchor.x,
          endY: childPos.inAnchor.y,
        });
      }

      leftTop += metrics.totalHeight;
    });
  }

  // Compute bounding box
  let minX = rootX;
  let minY = rootY;
  let maxX = rootX + rootDim.width;
  let maxY = rootY + rootDim.height;

  for (const pos of nodePositions.values()) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  }

  for(const link of routeMapLinks(mindMap.links||[],nodePositions)){
    minX=Math.min(minX,link.labelX);maxX=Math.max(maxX,link.labelX);
    minY=Math.min(minY,link.labelY);maxY=Math.max(maxY,link.labelY);
  }
  const padding = 100;
  return {
    nodePositions,
    branches,
    bounds: {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    },
  };
}

