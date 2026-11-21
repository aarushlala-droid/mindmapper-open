import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
export type ContextAction = { label:string; icon:LucideIcon; run:()=>void; shortcut?:string; danger?:boolean; disabled?:boolean; separator?:boolean };
export function CanvasContextMenu({x,y,actions,onClose}:{x:number;y:number;actions:ContextAction[];onClose:()=>void}) {
  const ref=useRef<HTMLDivElement>(null);const close=useRef(onClose);close.current=onClose;
  const [point,setPoint]=useState({x,y});
  useLayoutEffect(()=>{const rect=ref.current!.getBoundingClientRect();setPoint({x:Math.max(8,Math.min(x,window.innerWidth-rect.width-8)),y:Math.max(8,Math.min(y,window.innerHeight-rect.height-8))});ref.current!.querySelector<HTMLElement>('button:not([disabled])')?.focus();},[x,y]);
  useEffect(()=>{
    const before=document.activeElement as HTMLElement;
    const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))close.current();};
    const dismiss=()=>close.current();document.addEventListener('pointerdown',outside);window.addEventListener('resize',dismiss);document.addEventListener('wheel',dismiss,{passive:true});
    return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',dismiss);document.removeEventListener('wheel',dismiss);if(before?.isConnected)before.focus();};
  },[]);
  return createPortal(<div ref={ref} className="canvas-context-menu surface" role="menu" aria-label="Canvas actions" style={{left:point.x,top:point.y}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onContextMenu={e=>{e.preventDefault();e.stopPropagation();}} onKeyDown={e=>{e.stopPropagation();const items=Array.from(ref.current!.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));const i=items.indexOf(document.activeElement as HTMLButtonElement);if(e.key==='Escape'||e.key==='Tab'){e.preventDefault();onClose();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[index]?.focus();}}}>{actions.map((a,i)=><div key={a.label}>{a.separator&&i>0&&<div className="context-separator"/>}<button role="menuitem" disabled={a.disabled} className={a.danger?'danger':''} onClick={()=>{onClose();a.run();}}><a.icon size={15}/><span>{a.label}</span>{a.shortcut&&<kbd>{a.shortcut}</kbd>}</button></div>)}</div>,document.body);
}
