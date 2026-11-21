import { folderService } from '../services/folders';
import { folderPath } from '../services/folder-model';
import { FolderNavigation, type FolderEditorState } from './FolderNavigation';
import { FolderEditor } from './FolderEditor';
import { settingsService } from '../services/settings';
import React, { useEffect, useState } from 'react';
import { FolderInput, Plus, Search, ArrowUpRight, Copy, Trash2, Download, Upload, GitBranch, LockKeyhole, Clock3 } from 'lucide-react';
import { MindMap } from '../types/mindmap';
import { storageService } from '../services/storage';
import { Dialog } from './Dialog';
interface Props { isOpen: boolean; onClose: () => void; currentMapId: string; onSelectMap: (id: string) => void; onMapCreatedOrUpdated: () => void; }
function MiniMap({ map }: { map: MindMap }) {
  const root = map.nodes[map.rootId];
  const kids = root.childrenIds.slice(0, 6).map(id => map.nodes[id]).filter(Boolean);
  return <svg viewBox="0 0 300 128" aria-hidden="true"><rect x="120" y="49" width="62" height="30" rx="7" fill="white" stroke="#99a8cd"/><text x="151" y="67" textAnchor="middle" fontSize="7" fill="#36415a">{root.text.slice(0, 17)}</text>{kids.map((n, i) => { const left = i % 2 === 0; const y = 22 + Math.floor(i / 2) * 42; const x = left ? 28 : 218; const c = n.color || '#7661d6'; return <g key={n.id}><path d={`M${left ? 120 : 182} 64 C${left ? 97 : 205} 64 ${left ? 97 : 205} ${y} ${left ? 86 : 218} ${y}`} stroke={c} strokeWidth="2" fill="none"/><path d={`M${x} ${y}h58`} stroke={c} strokeWidth="2"/><text x={x} y={y-5} fontSize="6" fill="#475569">{n.text.slice(0, 19)}</text></g>; })}</svg>;
}
export function downloadWorkspaceBackup() {
  const url = URL.createObjectURL(new Blob([storageService.exportAllToJson()], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `mindmapper-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function MapManagerModal(p: Props) {
  const [query, setQuery] = useState(''); const [title, setTitle] = useState(''); const [creating, setCreating] = useState(false); const [type, setType] = useState<'blank'|'ww2'|'product'>('blank');
  const [selectedFolder,setSelectedFolder]=useState('all');
  const [folderEditor,setFolderEditor]=useState<FolderEditorState|null>(null);
  const [tick, setTick] = useState(0); const [feedback, setFeedback] = useState('');
  useEffect(() => storageService.subscribe(() => setTick(t => t + 1)), []);
  useEffect(()=>folderService.subscribe(()=>setTick(t=>t+1)),[]);
  useEffect(()=>{if(p.isOpen)void folderService.refresh();},[p.isOpen]);
  if (!p.isOpen) return null;
  const allMaps=storageService.getAllMaps();
  const folders=folderService.folders;
  const maps = allMaps.filter(m => (selectedFolder==='all'||(selectedFolder==='unfiled'?(!m.folderId||!folders.some(f=>f.id===m.folderId)):m.folderId===selectedFolder))&&m.title.toLowerCase().includes(query.toLowerCase()));
  const create = (e: React.FormEvent) => { e.preventDefault(); const map = storageService.createMap(type, title.trim() || undefined); if(selectedFolder!=='all'&&selectedFolder!=='unfiled')storageService.saveMap({...map,folderId:selectedFolder}); p.onSelectMap(map.id); setCreating(false); setTitle(''); p.onClose(); };
  const refresh = () => { setTick(t => t + 1); p.onMapCreatedOrUpdated(); };
  return <Dialog wide title="A little space to think." description="All your ideas, right where you left them." onClose={p.onClose}>
    <div className="library-shell"><FolderNavigation folders={folders} maps={allMaps} selected={selectedFolder} onSelect={setSelectedFolder} onEdit={setFolderEditor}/>
    <div className="library-body">
      {folderService.status&&<p className="inline-feedback" role="status">{folderService.status}<button className="text-button" onClick={()=>void folderService.refresh()}>Retry</button></p>}
      <div className="folder-breadcrumb">{selectedFolder==='all'?'All maps':selectedFolder==='unfiled'?'Unfiled':folderPath(folders,selectedFolder)}</div>
      <div className="library-tools"><label className="search-field"><Search size={16}/><input spellCheck={settingsService.preferences.spelling} autoCorrect={settingsService.preferences.spelling?'on':'off'} autoCapitalize="sentences" aria-label="Search maps" placeholder="Search your maps" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="primary-button" onClick={() => setCreating(!creating)}><Plus size={17}/>New map</button></div>
      {creating && <form className="create-map-form" onSubmit={create}><label>Map name<input spellCheck={settingsService.preferences.spelling} autoCorrect={settingsService.preferences.spelling?'on':'off'} autoCapitalize="sentences" autoFocus value={title} maxLength={500} onChange={e=>setTitle(e.target.value)} placeholder="What are you thinking about?"/></label><label>Start with<select value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="blank">A blank map</option><option value="ww2">WW2 analysis</option><option value="product">Product strategy</option></select></label><button className="primary-button" type="submit">Create & open<ArrowUpRight size={15}/></button><button className="text-button" type="button" onClick={()=>setCreating(false)}>Cancel</button></form>}
      <div className="library-section-label"><span>{selectedFolder==='all'?'YOUR MAPS':'MAPS IN THIS FOLDER'}</span><span>{maps.length} {maps.length === 1 ? 'map' : 'maps'}</span></div>
      <div className="map-grid">
        {maps.map(map => <article className={`map-card ${map.id===p.currentMapId ? 'current' : ''}`} key={map.id}>
          <button className="map-open" onClick={() => { p.onSelectMap(map.id); p.onClose(); }}><div className="map-preview"><MiniMap map={map}/>{map.id===p.currentMapId && <span className="current-badge">Open now</span>}</div><div className="map-card-title">{map.title}</div></button>
          <div className="map-card-footer"><span>{Object.keys(map.nodes).length} ideas <i>·</i> {new Date(map.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><div><button className="icon-button" aria-label={`Move ${map.title} to folder`} title="Move to folder" onClick={()=>setFolderEditor({mode:'moveMap',id:map.id})}><FolderInput size={14}/></button><button className="icon-button" aria-label={`Duplicate ${map.title}`} title="Duplicate map" onClick={()=>{storageService.duplicateMap(map.id);refresh();}}><Copy size={14}/></button><button className="icon-button danger" disabled={storageService.getAllMaps().length<=1} aria-label={`Move ${map.title} to trash`} title="Move to trash · recover from History" onClick={()=>{storageService.deleteMap(map.id); if(map.id===p.currentMapId) p.onSelectMap(storageService.getAllMaps()[0].id);refresh();}}><Trash2 size={14}/></button></div></div>
        </article>)}
      </div>
      {!maps.length && <div className="empty-state"><Search size={24}/><h3>{query?`No maps match “${query}”`:'No maps here yet'}</h3><p>Create a map here, or move one from All maps.</p></div>}
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
    </div>
    </div>
    <footer className="library-footer"><span><LockKeyhole size={14}/>Private workspace</span><div><button className="text-button" onClick={downloadWorkspaceBackup}><Download size={15}/>Backup all maps</button><label className="text-button import-label"><Upload size={15}/>Import JSON<input spellCheck={settingsService.preferences.spelling} autoCorrect={settingsService.preferences.spelling?'on':'off'} autoCapitalize="sentences" aria-label="Import map or workspace JSON" type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0]; if (!file) return; const ok=storageService.importFromJson(await file.text()); setFeedback(ok?'Imported. Existing maps are preserved; cloud saving is in progress.':'That file is not a valid Mindmapper map or workspace backup.'); e.target.value='';refresh();}}/></label></div></footer>
    {folderEditor&&<FolderEditor action={folderEditor} onDone={id=>{if(id)setSelectedFolder(id);setFolderEditor(null);refresh();}} onClose={()=>setFolderEditor(null)}/>}
  </Dialog>;
}
