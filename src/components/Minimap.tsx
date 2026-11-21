import React, { useRef } from 'react';
import { NodeLayoutPosition, BranchPathData, CanvasViewport } from '../types/mindmap';

interface MinimapProps {
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  nodePositions: Map<string, NodeLayoutPosition>;
  branches: BranchPathData[];
  viewport: CanvasViewport;
  containerWidth: number;
  containerHeight: number;
  onPanTo: (x: number, y: number) => void;
  onClose: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  bounds,
  nodePositions,
  branches,
  viewport,
  containerWidth,
  containerHeight,
  onPanTo,
  onClose,
}) => {
  const mapWidth = 200;
  const mapHeight = 140;

  // Scale bounds to fit inside mapWidth x mapHeight
  const scaleX = mapWidth / (bounds.width || 1);
  const scaleY = mapHeight / (bounds.height || 1);
  const scale = Math.min(scaleX, scaleY, 0.2);

  const offsetX = (mapWidth - bounds.width * scale) / 2;
  const offsetY = (mapHeight - bounds.height * scale) / 2;

  // World coordinates to Minimap coordinates
  const worldToMap = (x: number, y: number) => {
    return {
      x: (x - bounds.minX) * scale + offsetX,
      y: (y - bounds.minY) * scale + offsetY,
    };
  };

  // Minimap coordinates to World coordinates
  const mapToWorld = (mx: number, my: number) => {
    return {
      x: (mx - offsetX) / scale + bounds.minX,
      y: (my - offsetY) / scale + bounds.minY,
    };
  };

  // Viewport box on minimap
  // In world coords, visible area is:
  // left: -viewport.x / viewport.zoom
  // top: -viewport.y / viewport.zoom
  // width: containerWidth / viewport.zoom
  // height: containerHeight / viewport.zoom
  const viewWorldX = -viewport.x / viewport.zoom;
  const viewWorldY = -viewport.y / viewport.zoom;
  const viewWorldW = containerWidth / viewport.zoom;
  const viewWorldH = containerHeight / viewport.zoom;

  const viewMapPos = worldToMap(viewWorldX, viewWorldY);
  const viewMapW = viewWorldW * scale;
  const viewMapH = viewWorldH * scale;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const targetWorld = mapToWorld(mx, my);
    // Pan such that targetWorld is centered in viewport
    const newX = -(targetWorld.x * viewport.zoom - containerWidth / 2);
    const newY = -(targetWorld.y * viewport.zoom - containerHeight / 2);
    onPanTo(newX, newY);
  };

  return (
    <div className="canvas-minimap absolute right-4 bottom-18 z-20 bg-white/95 backdrop-blur rounded-xl border border-slate-200/90 shadow-xl overflow-hidden select-none p-2 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-1.5 px-0.5 text-[11px] font-semibold text-slate-500">
        <span>MAP OVERVIEW</span>
        <button
          aria-label="Close minimap"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xs px-1 rounded"
        >
          ×
        </button>
      </div>

      <div
        className="relative bg-slate-50 border border-slate-200 rounded-lg cursor-crosshair overflow-hidden"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        onClick={handleMinimapClick}
      >
        <svg
          width={mapWidth}
          height={mapHeight}
          className="pointer-events-none absolute inset-0"
        >
          {/* Miniature branches */}
          {branches.map((b, i) => {
            const start = worldToMap(b.startX, b.startY);
            const end = worldToMap(b.endX, b.endY);
            const dx = end.x - start.x;
            const cpDelta = Math.max(Math.abs(dx) * 0.45, 3);
            const cp1x = dx >= 0 ? start.x + cpDelta : start.x - cpDelta;
            const cp2x = dx >= 0 ? end.x - cpDelta : end.x + cpDelta;
            const pathD = `M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`;
            return (
              <path
                key={i}
                d={pathD}
                fill="none"
                stroke={b.color}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
            );
          })}

          {/* Miniature nodes */}
          {Array.from(nodePositions.values()).map((pos) => {
            const m = worldToMap(pos.x, pos.y);
            const mw = Math.max(2, pos.width * scale);
            const mh = Math.max(1.5, pos.height * scale);
            return (
              <rect
                key={pos.id}
                x={m.x}
                y={m.y}
                width={mw}
                height={mh}
                fill={pos.branchColor || '#64748b'}
                rx={1}
              />
            );
          })}
        </svg>

        {/* Viewport frame */}
        <div
          className="absolute border border-blue-500 bg-blue-500/15 pointer-events-none rounded-xs transition-all duration-75"
          style={{
            left: `${viewMapPos.x}px`,
            top: `${viewMapPos.y}px`,
            width: `${viewMapW}px`,
            height: `${viewMapH}px`,
          }}
        />
      </div>
    </div>
  );
};

