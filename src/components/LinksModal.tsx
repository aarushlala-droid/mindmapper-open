import { useState } from 'react';
import { Link2, Unlink } from 'lucide-react';
import type { MindMap, MindMapLink } from '../types/mindmap';
import { Dialog } from './Dialog';
export function LinksModal({map,selected,onAdd,onRemove,onClose}:{map:MindMap;selected:string|null;onAdd:(from:string,to:string,label:string)=>void;onRemove:(id:string)=>void;onClose:()=>void}){
  const [from,setFrom]=useState(selected||map.rootId);const [to,setTo]=useState('');const [label,setLabel]=useState('');const [feedback,setFeedback]=useState('');
  const nodes=Object.values(map.nodes);
  const exists=(map.links||[]).some(l=>(l.fromNodeId===from&&l.toNodeId===to)||(l.fromNodeId===to&&l.toNodeId===from));
  return <Dialog title="Link ideas" description="Connect any two ideas without moving them or changing their branches." onClose={onClose}>
    <div className="settings-body"><form className="link-form" onSubmit={e=>{e.preventDefault();if(!to||to===from||exists)return;onAdd(from,to,label);setTo('');setLabel('');setFeedback('Link added. You can undo it or remove it below.');}}>
      <label className="settings-label">From<select aria-label="Link from idea" value={from} onChange={e=>{setFrom(e.target.value);setTo('');}}>{nodes.map(n=><option key={n.id} value={n.id}>{n.text.slice(0,100)||'Untitled idea'}</option>)}</select></label>
      <label className="settings-label">To<select aria-label="Link to idea" required value={to} onChange={e=>setTo(e.target.value)}><option value="">Choose an idea…</option>{nodes.filter(n=>n.id!==from).map(n=><option key={n.id} value={n.id}>{n.text.slice(0,100)||'Untitled idea'}</option>)}</select></label>
      <label className="settings-label">Label (optional)<input aria-label="Link label" maxLength={500} value={label} onChange={e=>setLabel(e.target.value)} placeholder="For example: supports, contrasts with…"/></label>
      {exists&&<p className="settings-note">These ideas are already linked.</p>}<button className="primary-button" type="submit" disabled={!to||exists}><Link2 size={15}/>Add link</button>
    </form>{feedback&&<p className="inline-feedback" role="status">{feedback}</p>}
    <div className="links-list"><h3>Connections ({map.links?.length||0})</h3>{(map.links||[]).map(l=><div className="recovery-row" key={l.id}><div><strong>{l.label||'Related ideas'}</strong><p>{map.nodes[l.fromNodeId]?.text} ↔ {map.nodes[l.toNodeId]?.text}</p></div><button className="icon-button danger" aria-label={`Remove link ${l.label||'between ideas'}`} title="Remove link (undo available)" onClick={()=>onRemove(l.id)}><Unlink size={16}/></button></div>)}{!map.links?.length&&<p className="settings-note">Extra connections appear as dashed lines. Hidden branches keep their links; expand the branch to see them.</p>}</div></div>
  </Dialog>;
}
