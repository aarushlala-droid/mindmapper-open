import { settingsService } from '../services/settings';
import { shortcutLabel } from '../services/preferences';
import React from 'react';
import { Minus, Plus, Maximize, MapPin, Map as MapIcon } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToView: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToView,
  showMinimap,
  onToggleMinimap,
}) => {
  const percentage = Math.round(zoom * 100);

  return (
    <div className="zoom-controls absolute right-4 bottom-4 z-20 flex items-center bg-white/95 backdrop-blur rounded-xl border border-slate-200/90 shadow-lg p-1 text-slate-700 select-none">
      {/* Toggle Minimap */}
      <button
        onClick={onToggleMinimap}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          showMinimap ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'
        }`}
        title="Toggle Minimap"
      >
        <MapIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        title="Zoom out"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Percentage Indicator */}
      <button
        onClick={onResetZoom}
        className="px-2 py-1 text-xs font-semibold tabular-nums text-slate-800 hover:bg-slate-100 rounded-md transition-colors min-w-[52px] text-center"
        title="Click to reset to 100%"
      >
        {percentage}%
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        title="Zoom in"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Fit to View */}
      <button
        onClick={onFitToView}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        title={`Fit map to screen (${shortcutLabel(settingsService.preferences.shortcuts.fit)})`}
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
};

