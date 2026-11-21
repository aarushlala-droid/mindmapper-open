import { settingsService } from '../services/settings';
import React, { useState, useRef } from 'react';
import { WandSparkles, Settings, ArrowLeft, ChevronDown, Undo2, Redo2, Download, Maximize2, Plus, Search, History, Link2, Check, Cloud, CloudOff, LoaderCircle } from 'lucide-react';
import type { MindMap } from '../types/mindmap';
import type { SyncState } from '../services/storage';
interface Props {
  mindMap: MindMap; onUpdateTitle: (title: string) => void;
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
  onOpenExport: () => void; onOpenMapManager: () => void; onNewMap: () => void;
  onOpenSettings:()=>void; onCleanUp:()=>void; onOpenLinks:()=>void;
  sync: SyncState; onTogglePresentation: () => void; onShare: () => void;
  onOpenRecovery: () => void; onToggleOutline: () => void; outlineOpen: boolean;
}
export function MiroTopBar(p: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(p.mindMap.title);
  const cancelling = useRef(false);
  const commit = () => { setEditing(false); if (!cancelling.current && title.trim() && title.trim() !== p.mindMap.title) p.onUpdateTitle(title.trim()); cancelling.current = false; };
  const StatusIcon = p.sync.state === 'saving' ? LoaderCircle : p.sync.state === 'saved' ? Check : CloudOff;
  return <header className="workspace-header" aria-label="Workspace controls">
    <div className="header-board surface">
      <button className="brand-mark" aria-label="Open my maps" title="My maps" onClick={p.onOpenMapManager}><span>m</span><i /></button>
      <div className="board-identity">
        <button className="workspace-crumb" onClick={p.onOpenMapManager}>Personal workspace <ChevronDown size={11}/></button>
        {editing ? <input spellCheck={settingsService.preferences.spelling} autoCorrect={settingsService.preferences.spelling?'on':'off'} autoCapitalize="sentences" aria-label="Map title" maxLength={500} autoFocus value={title} onChange={e => setTitle(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { cancelling.current = true; setTitle(p.mindMap.title); setEditing(false); } }} /> : <button className="board-title" title="Rename map" onClick={() => { setTitle(p.mindMap.title); setEditing(true); }}>{p.mindMap.title}<ChevronDown size={13}/></button>}
      </div>
      <div className={`sync-label ${p.sync.state}`} role="status" title={p.sync.message}><StatusIcon size={14} className={p.sync.state === 'saving' ? 'spin' : ''}/><span>{p.sync.state === 'saved' ? 'Saved to cloud' : p.sync.state === 'saving' ? 'Saving…' : p.sync.state === 'offline' ? 'Offline' : 'Save needs attention'}</span></div>
      <span className="divider desktop-only" />
      <button className="icon-button desktop-only" aria-label="Undo" title="Undo (⌘Z / Ctrl+Z)" disabled={!p.canUndo} onClick={p.onUndo}><Undo2 size={17}/></button>
      <button className="icon-button desktop-only" aria-label="Redo" title="Redo (⇧⌘Z / Ctrl+Y)" disabled={!p.canRedo} onClick={p.onRedo}><Redo2 size={17}/></button>
    </div>
    <div className="header-actions surface">
      <button className="text-button cleanup-button" aria-label="Clean up map" title="Reset manual positions and space branches evenly. Undo available." onClick={p.onCleanUp}><WandSparkles size={17}/><span>Clean up</span></button>
      <button className="text-button cleanup-button" aria-label="Link ideas" title="Link ideas from different branches" onClick={p.onOpenLinks}><Link2 size={17}/><span>Link ideas</span></button>
      <button className={`icon-button ${p.outlineOpen ? 'is-active' : ''}`} aria-label="Search and outline" aria-pressed={p.outlineOpen} title="Search and outline" onClick={p.onToggleOutline}><Search size={18}/></button>
      <button className="icon-button" aria-label="Version history and trash" title="Version history & trash" onClick={p.onOpenRecovery}><History size={18}/></button>
      <button className="icon-button" aria-label="Settings" title="Settings" onClick={p.onOpenSettings}><Settings size={18}/></button>
      <span className="divider"/>
      <button className="text-button maps-button" onClick={p.onOpenMapManager}>My maps</button>
      <button className="icon-button new-map-button" aria-label="New map" title="New map" onClick={p.onNewMap}><Plus size={18}/></button>
      <button className="icon-button focus-button" aria-label="Focus view" title="Focus view" onClick={p.onTogglePresentation}><Maximize2 size={17}/></button>
      <button className="text-button export-button" onClick={p.onOpenExport}><Download size={16}/><span>Export</span></button>
      <button className="primary-button link-button" onClick={p.onShare} title="Copy private workspace link"><Link2 size={15}/><span>Copy link</span></button>
    </div>
  </header>;
}
