import { settingsService } from '../services/settings';
import { shortcutLabel } from '../services/preferences';
import React, { useState } from 'react';
import {
  Plus,
  GitCommit,
  Image as ImageIcon,
  Trash2,
  Bold,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { MindMapNode } from '../types/mindmap';
import { THEME_PALETTES } from '../utils/layout';

interface NodeContextMenuProps {
  node: MindMapNode;
  isRoot: boolean;
  onAddChild: () => void;
  onAddSibling: () => void;
  onOpenImageInsert: () => void;
  onDelete: () => void;
  onUpdateNode: (updates: Partial<MindMapNode>) => void;
  theme: string;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  isRoot,
  onAddChild,
  onAddSibling,
  onOpenImageInsert,
  onDelete,
  onUpdateNode,
  theme,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colors = THEME_PALETTES[theme] || THEME_PALETTES['miro-vibrant'];

  return (
    <div
      className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-slate-200/90 p-1 flex items-center gap-1 z-40 select-none animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Branch Color Swatch Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors p-0.5"
          title="Change branch color"
        >
          <div
            className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
            style={{ backgroundColor: node.color || '#3B82F6' }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg border border-slate-200 shadow-xl p-2 z-50 flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onUpdateNode({ color: c });
                  setShowColorPicker(false);
                }}
                className="w-5 h-5 rounded-full border border-black/15 hover:scale-125 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200" />

      {/* Bold Toggle */}
      <button
        onClick={() => onUpdateNode({ isBold: !node.isBold })}
        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
          node.isBold ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="Toggle Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Font Size */}
      <button
        onClick={() => {
          const nextSize = node.fontSize === 'lg' ? 'sm' : node.fontSize === 'sm' ? 'base' : 'lg';
          onUpdateNode({ fontSize: nextSize });
        }}
        className="px-1.5 h-6 rounded flex items-center justify-center text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        title="Cycle Font Size"
      >
        <span>{node.fontSize === 'lg' ? '16' : node.fontSize === 'sm' ? '12' : '14'}</span>
      </button>

      <div className="w-px h-4 bg-slate-200" />

      {/* Add Child Node */}
      <button
        onClick={onAddChild}
        className="flex items-center gap-1 px-2 h-6 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
        title={`Add child branch (${shortcutLabel(settingsService.preferences.shortcuts.addChild)})`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Child</span>
      </button>

      {/* Add Sibling Node (if not root) */}
      {!isRoot && (
        <button
          onClick={onAddSibling}
          className="flex items-center gap-1 px-2 h-6 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={`Add sibling branch (${shortcutLabel(settingsService.preferences.shortcuts.addSibling)})`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Sibling</span>
        </button>
      )}

      {/* Add / Change Image */}
      <button
        onClick={onOpenImageInsert}
        className="w-6 h-6 rounded flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
        title="Add or update image"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>

      {/* Delete (if not root) */}
      {!isRoot && (
        <>
          <div className="w-px h-4 bg-slate-200" />
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            title={`Delete branch (${shortcutLabel(settingsService.preferences.shortcuts.delete)})`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

