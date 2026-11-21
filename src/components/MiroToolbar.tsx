import { settingsService } from '../services/settings';
import { shortcutLabel } from '../services/preferences';
import React, { useState } from 'react';
import {
  MousePointer,
  GitBranch,
  Image as ImageIcon,
  Palette,
  LayoutGrid,
  FileText,
  HelpCircle,
  Sparkles,
  AlignLeft,
  CircleDot,
  Layers,
} from 'lucide-react';
import { LayoutDirection, NodeStyle, ThemeName } from '../types/mindmap';
import { THEME_PALETTES } from '../utils/layout';

interface MiroToolbarProps {
  currentLayout: LayoutDirection;
  onSelectLayout: (layout: LayoutDirection) => void;
  currentNodeStyle: NodeStyle;
  onSelectNodeStyle: (style: NodeStyle) => void;
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  onAddChildNode: () => void;
  onOpenImageInsert: () => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
  selectedNodeId: string | null;
}

export const MiroToolbar: React.FC<MiroToolbarProps> = ({
  currentLayout,
  onSelectLayout,
  currentNodeStyle,
  onSelectNodeStyle,
  currentTheme,
  onSelectTheme,
  onAddChildNode,
  onOpenImageInsert,
  onOpenTemplates,
  onOpenShortcuts,
  selectedNodeId,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<'layout' | 'style' | 'theme' | null>(null);

  const toggleFlyout = (flyout: 'layout' | 'style' | 'theme') => {
    setActiveFlyout(activeFlyout === flyout ? null : flyout);
  };

  return (
    <aside className="canvas-toolbar absolute left-4 top-24 z-20 flex flex-col items-center">
      {/* Miro Dock Bar */}
      <div className="bg-white/95 backdrop-blur rounded-xl border border-slate-200/80 shadow-lg p-1.5 flex flex-col gap-1.5 items-center select-none text-slate-700">
        {/* Pointer / Select */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors"
          title="Select a node · drag the background to pan"
          onClick={() => setActiveFlyout(null)}
        >
          <MousePointer className="w-4 h-4 fill-blue-600/30" />
        </button>

        {/* Add Branch / Child */}
        <button
          onClick={onAddChildNode}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors relative group"
          title={`Add child branch (${shortcutLabel(settingsService.preferences.shortcuts.addChild)})`}
        >
          <GitBranch className="w-4 h-4 text-purple-600" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
            Add child branch
          </span>
        </button>

        {/* Add Image */}
        <button
          onClick={onOpenImageInsert}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors relative group"
          title="Add Image to Node"
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
            Insert Image (I)
          </span>
        </button>

        <div className="w-6 h-px bg-slate-200 my-0.5" />

        {/* Node Style Flyout Trigger */}
        <div className="relative">
          <button
            onClick={() => toggleFlyout('style')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              activeFlyout === 'style' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Node Style (Underline / Bubble / Card)"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {activeFlyout === 'style' && (
            <div className="absolute left-full ml-3 top-0 bg-white rounded-xl border border-slate-200 shadow-xl p-2 w-48 z-30 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
                Branch Style
              </span>
              <button
                onClick={() => {
                  onSelectNodeStyle('underline');
                  setActiveFlyout(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentNodeStyle === 'underline' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-4 h-0.5 bg-current rounded" />
                <span>Underline</span>
              </button>
              <button
                onClick={() => {
                  onSelectNodeStyle('bubble');
                  setActiveFlyout(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentNodeStyle === 'bubble' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-4 h-3 rounded-full border border-current" />
                <span>Bubble Capsule</span>
              </button>
              <button
                onClick={() => {
                  onSelectNodeStyle('card');
                  setActiveFlyout(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentNodeStyle === 'card' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-4 h-3.5 rounded border border-current" />
                <span>Card Box</span>
              </button>
            </div>
          )}
        </div>

        {/* Layout Direction Flyout */}
        <div className="relative">
          <button
            onClick={() => toggleFlyout('layout')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              activeFlyout === 'layout' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Tree Layout (Radial / Right / Left)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {activeFlyout === 'layout' && (
            <div className="absolute left-full ml-3 top-0 bg-white rounded-xl border border-slate-200 shadow-xl p-2 w-44 z-30 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
                Layout Direction
              </span>
              <button
                onClick={() => {
                  onSelectLayout('radial');
                  setActiveFlyout(null);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentLayout === 'radial' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>Radial (Bi-directional)</span>
              </button>
              <button
                onClick={() => {
                  onSelectLayout('right');
                  setActiveFlyout(null);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentLayout === 'right' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>Right Tree</span>
              </button>
              <button
                onClick={() => {
                  onSelectLayout('left');
                  setActiveFlyout(null);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentLayout === 'left' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>Left Tree</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Palette Flyout */}
        <div className="relative">
          <button
            onClick={() => toggleFlyout('theme')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              activeFlyout === 'theme' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Theme & Colors"
          >
            <Palette className="w-4 h-4 text-emerald-600" />
          </button>

          {activeFlyout === 'theme' && (
            <div className="absolute left-full ml-3 top-0 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 w-52 z-30 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
                Color Palette
              </span>
              {(['miro-vibrant', 'ocean', 'sunset', 'forest', 'monochrome'] as ThemeName[]).map((theme) => {
                const colors = THEME_PALETTES[theme] || [];
                return (
                  <button
                    key={theme}
                    onClick={() => {
                      onSelectTheme(theme);
                      setActiveFlyout(null);
                    }}
                    className={`flex flex-col gap-1 p-2 rounded-lg text-left transition-colors border ${
                      currentTheme === theme ? 'bg-slate-50 border-blue-500' : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-800 capitalize">
                      {theme.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {colors.slice(0, 5).map((c, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-6 h-px bg-slate-200 my-0.5" />

        {/* Templates */}
        <button
          onClick={onOpenTemplates}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors relative group"
          title="Template Library"
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
            Templates
          </span>
        </button>

        {/* Shortcuts / Help */}
        <button
          onClick={onOpenShortcuts}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors relative group"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
            Shortcuts (?)
          </span>
        </button>
      </div>
    </aside>
  );
};

