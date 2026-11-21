import { useEffect, useState } from 'react';
import { History, RotateCcw, Trash2, ShieldCheck, Download } from 'lucide-react';
import { storageService } from '../services/storage';
import { Dialog } from './Dialog';
import { downloadWorkspaceBackup } from './MapManagerModal';
export function RecoveryModal({ mapId, onClose, onRestored }: {mapId: string; onClose: () => void; onRestored: (id: string) => void}) {
  const [tab, setTab] = useState<'history'|'trash'>('history');
  const [history, setHistory] = useState<{version:number;savedAt:number;deleted:number}[]>([]);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('Loading saved versions…'); const [tick, setTick] = useState(0);
  const load = async () => { try { setHistory(await storageService.getHistory(mapId));setMessage(''); } catch(e){setMessage(e instanceof Error?e.message:'Could not load versions.');} };
  useEffect(()=>{ void load(); },[mapId]);
  return <Dialog title="A safety net for your ideas" description="Restore a saved version or bring a map back from trash." onClose={onClose}>
    <div className="recovery-body"><div className="segmented"><button onClick={()=>setTab('history')} aria-pressed={tab==='history'}><History size={15}/>Version history</button><button onClick={()=>setTab('trash')} aria-pressed={tab==='trash'}><Trash2 size={15}/>Trash</button></div>
    <p className="recovery-note"><ShieldCheck size={16}/>Cloud saves keep a version history. Restoring creates a new save.</p>
    {message && <p role="status" className="inline-feedback">{message}</p>}
    <div className="recovery-list">{tab==='history' ? history.map((v,i)=><div className="recovery-row" key={v.version}><div><strong>{v.deleted?'Moved to trash':`Version ${v.version}`}{i===0&&<span className="current-badge">Latest</span>}</strong><p>{new Date(v.savedAt).toLocaleString()}</p></div><button className="text-button" disabled={busy} onClick={async()=>{setBusy(true);try{const ok=await storageService.restoreVersion(mapId,v.version);if(ok){onRestored(mapId);onClose();}else setMessage(storageService.status.message);}catch(e){setMessage(e instanceof Error?e.message:'Restore failed.');}setBusy(false);}}><RotateCcw size={14}/>Restore</button></div>) : storageService.getTrash().map(map=><div className="recovery-row" key={map.id}><div><strong>{map.title}</strong><p>{Object.keys(map.nodes).length} ideas</p></div><button className="text-button" disabled={busy} onClick={async()=>{setBusy(true);storageService.restoreMap(map.id);const ok=await storageService.flush();setTick(t=>t+1);setBusy(false);if(ok){onRestored(map.id);onClose();}else setMessage(storageService.status.message);}}><RotateCcw size={14}/>Restore map</button></div>)}</div>
    {tab==='history'&&!history.length&&!message&&<div className="empty-state"><History size={24}/><h3>Your history starts with your first cloud save.</h3></div>}
    {tab==='trash'&&!storageService.getTrash().length&&<div className="empty-state"><Trash2 size={24}/><h3>Nothing in trash</h3><p>Maps you delete will be kept here for recovery.</p></div>}
    </div><footer className="library-footer"><span>Showing the 100 most recent versions</span><button className="text-button" onClick={downloadWorkspaceBackup}><Download size={15}/>Download backup</button></footer>
  </Dialog>;
}
