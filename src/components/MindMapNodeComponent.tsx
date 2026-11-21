import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { MindMapNode, NodeLayoutPosition, NodeStyle } from '../types/mindmap';
import { NodeContextMenu } from './NodeContextMenu';
import { measureNode } from '../utils/text';
import { settingsService } from '../services/settings';
import { commandForEvent } from '../services/preferences';
interface Props {
  node:MindMapNode;position:NodeLayoutPosition;isRoot:boolean;isSelected:boolean;globalNodeStyle:NodeStyle;theme:string;
  onSelect:()=>void;onStartDragNode?:(id:string,x:number,y:number)=>void;
  onUpdateText:(text:string,recordHistory?:boolean)=>void;onUpdateNode:(updates:Partial<MindMapNode>)=>void;
  onAddChild:()=>void;onAddSibling:()=>void;onDelete:()=>void;onOpenImageInsert:()=>void;onToggleCollapse:()=>void;childCount:number;
  editToken?:string;onMeasure:(id:string,size:{width:number;height:number})=>void;onKeepCaretVisible:(y:number)=>void;zoom:number;
}
export function MindMapNodeComponent(p:Props) {
  const {node,position,isRoot,isSelected}=p;
  const [editing,setEditing]=useState(false);const [text,setText]=useState(node.text);
  const textarea=useRef<HTMLTextAreaElement>(null);const content=useRef<HTMLDivElement>(null);
  const original=useRef(node.text);const changed=useRef(false);const cancelBlur=useRef(false);
  const metrics=measureNode({...node,text:editing?text:node.text},isRoot,p.globalNodeStyle);
  const effective=node.nodeStyle||p.globalNodeStyle;const underline=effective==='underline'&&!isRoot;
  const startEdit=()=>{original.current=node.text;changed.current=false;cancelBlur.current=false;setText(node.text);setEditing(true);p.onSelect();};
  const beginRef=useRef(startEdit);beginRef.current=startEdit;
  useEffect(()=>{if(p.editToken)beginRef.current();},[p.editToken]);
  useEffect(()=>{if(!editing)setText(node.text);},[node.text,editing]);
  useEffect(()=>{if(editing){textarea.current?.focus({preventScroll:true});textarea.current?.select();}},[editing]);
  // Read actual line wrapping on every input, including pasted paragraphs and long words.
  // Both the textarea and its node grow; siblings use the measured size in tree layout.
  useLayoutEffect(()=>{
    const measure=()=>{
      let textHeight=metrics.textHeight;
      if(editing&&textarea.current){
        const el=textarea.current;el.style.height='0px';textHeight=Math.max(metrics.lineHeight,el.scrollHeight);el.style.height=`${textHeight}px`;el.scrollTop=0;
        p.onKeepCaretVisible(0);
      }else if(content.current){textHeight=Math.max(metrics.lineHeight,content.current.scrollHeight);}
      p.onMeasure(node.id,{width:metrics.width,height:Math.ceil(textHeight+metrics.paddingY*2+metrics.imageHeight+metrics.imageGap+metrics.border)});
    };
    measure();
    const observer=new ResizeObserver(measure);
    const target=editing?textarea.current:content.current;if(target)observer.observe(target);
    let active=true;void document.fonts.ready.then(()=>{if(active)measure();});
    return()=>{active=false;observer.disconnect();};
  },[text,node.text,editing,position.width,metrics.font,metrics.textHeight,metrics.lineHeight,metrics.width,metrics.paddingY,metrics.imageHeight,metrics.imageGap,metrics.border]);
  const finish=()=>{if(cancelBlur.current){cancelBlur.current=false;return;}setEditing(false);};
  const change=(value:string)=>{setText(value);p.onUpdateText(value,!changed.current);changed.current=true;};
  const key=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    e.stopPropagation();if(e.nativeEvent.isComposing)return;
    if(e.key==='Escape'){e.preventDefault();cancelBlur.current=true;setText(original.current);if(changed.current)p.onUpdateText(original.current,false);setEditing(false);return;}
    const action=commandForEvent(e.nativeEvent,settingsService.preferences);
    if(e.key==='Enter'&&e.shiftKey&&!action)return;
    const canRun=e.key==='Enter'||e.key==='Tab'||e.metaKey||e.ctrlKey||e.altKey;
    if(canRun&&(action==='addChild'||action==='addSibling')){e.preventDefault();setEditing(false);if(action==='addChild')p.onAddChild();else p.onAddSibling();}
    else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();finish();}
  };
  const textStyle={fontFamily:metrics.fontFamily,fontSize:metrics.fontSize,fontWeight:metrics.fontWeight,fontStyle:node.isItalic?'italic':'normal',lineHeight:`${metrics.lineHeight}px`} as const;
  return <div data-mindmap-node={node.id} role="button" aria-label={`${node.text||'Untitled idea'}. Double-click to edit.`} aria-pressed={isSelected} tabIndex={isSelected||isRoot?0:-1} onFocus={p.onSelect}
    style={{position:'absolute',left:position.x,top:position.y,width:position.width,height:position.height}}
    className={`group select-none ${isSelected?'z-30':'z-10'} ${editing?'cursor-text':'cursor-grab active:cursor-grabbing'}`}
    onMouseDown={e=>{if(!editing&&e.button===0&&!(e.target as HTMLElement).closest('button,textarea,input'))p.onStartDragNode?.(node.id,e.clientX,e.clientY);}}
    onTouchStart={e=>{if(!editing&&e.touches.length===1&&!(e.target as HTMLElement).closest('button,textarea,input'))p.onStartDragNode?.(node.id,e.touches[0].clientX,e.touches[0].clientY);}}
    onClick={e=>{e.stopPropagation();p.onSelect();}} onDoubleClick={e=>{if((e.target as HTMLElement).closest('button,textarea'))return;e.stopPropagation();startEdit();}}>
    {isSelected&&!editing&&<NodeContextMenu node={node} isRoot={isRoot} onAddChild={p.onAddChild} onAddSibling={p.onAddSibling} onOpenImageInsert={p.onOpenImageInsert} onDelete={p.onDelete} onUpdateNode={p.onUpdateNode} theme={p.theme}/>}
    <div className={`relative w-full h-full ${isRoot?'bg-white border-2 rounded-xl shadow-sm':underline?'':'bg-white border rounded-xl shadow-sm'} ${isSelected?'ring-2 ring-blue-500/70 ring-offset-2':''}`} style={{padding:`${metrics.paddingY}px ${metrics.paddingX}px`,borderColor:underline?undefined:node.color||position.branchColor||'#b7c2da'}}>
      {underline&&<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full pointer-events-none" style={{backgroundColor:position.branchColor}}/>}
      {node.image?.url&&<div className="relative overflow-hidden rounded-md" style={{height:metrics.imageHeight,marginBottom:metrics.imageGap}}><img src={node.image.url} alt={node.image.alt||'Idea attachment'} style={{width:'100%',height:'100%',objectFit:'cover'}} referrerPolicy="no-referrer"/>{isSelected&&<button title="Remove image" className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white" onClick={e=>{e.stopPropagation();p.onUpdateNode({image:undefined});}}><X size={12}/></button>}</div>}
      {editing?<textarea ref={textarea} aria-label="Idea text" maxLength={30000} className="node-text node-textarea text-slate-900" style={{...textStyle,height:metrics.textHeight}} rows={1} value={text} onChange={e=>change(e.target.value)} onBlur={finish} onKeyDown={key} onClick={e=>e.stopPropagation()} spellCheck={settingsService.preferences.spelling} autoCorrect={settingsService.preferences.spelling?'on':'off'} autoCapitalize="sentences" autoComplete="on"/>
      :<div ref={content} className="node-text text-slate-900" style={textStyle}>{node.text||'Untitled'}</div>}
      <button onClick={e=>{e.stopPropagation();p.onAddChild();}} className={`absolute w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shadow-sm ${position.side==='right'?'-right-2.5':'-left-2.5'} top-1/2 -translate-y-1/2`} title="Add child branch"><Plus size={12}/></button>
      {p.childCount>0&&!isRoot&&<button onClick={e=>{e.stopPropagation();p.onToggleCollapse();}} className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-[10px] font-semibold ${position.side==='right'?'-right-7':'-left-7'} ${node.isCollapsed?'w-5 h-5 bg-amber-500 text-white ring-2 ring-white':'w-4 h-4 bg-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`} title={node.isCollapsed?`Expand ${p.childCount} branches`:'Collapse branch'}>{node.isCollapsed?`+${p.childCount}`:<Minus size={10}/>}</button>}
    </div>
  </div>;
}
