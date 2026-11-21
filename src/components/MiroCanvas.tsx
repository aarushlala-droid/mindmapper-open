import { routeMapLinks } from '../utils/connections';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MindMap,
  MindMapNode,
  CanvasViewport,
  NodeLayoutPosition,
  BranchPathData,
  NodeImage,
} from '../types/mindmap';
import { computeMindMapLayout } from '../utils/layout';
import { MindMapNodeComponent } from './MindMapNodeComponent';
import { CanvasContextMenu, type ContextAction } from './CanvasContextMenu';
import { Plus, Copy, Pencil, Image, Trash2, FoldVertical, Bold, Maximize, Settings, Search, Undo2, Redo2, WandSparkles, Link2, LocateFixed } from 'lucide-react';
import { commandForEvent, shortcutLabel, type Preferences } from '../services/preferences';

interface MiroCanvasProps {
  dialogOpen?: boolean;
  cleanupVersion:number; onCleanUp:()=>void; onOpenLinks:(id?:string)=>void;
  preferences: Preferences;
  nodeAction: { id: string; action: 'edit'|'contextMenu'; token: string } | null;
  onRequestEdit: (id:string)=>void;
  onDuplicateNode: (id:string)=>void;
  onOpenSettings: ()=>void;
  onToggleOutline: ()=>void;
  onUndo: ()=>void; onRedo: ()=>void; canUndo:boolean; canRedo:boolean;
  mindMap: MindMap;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodeText: (id: string, text: string, recordHistory?:boolean) => void;
  onUpdateNode: (id: string, updates: Partial<MindMapNode>) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onOpenImageInsertForNode: (nodeId: string) => void;
  viewport: CanvasViewport;
  onViewportChange: (viewport: CanvasViewport) => void;
  onFitToViewCallback?: (fitFn: () => void) => void;
}

export const MiroCanvas: React.FC<MiroCanvasProps> = ({
  mindMap,
  dialogOpen, cleanupVersion, onCleanUp, onOpenLinks, preferences, nodeAction, onRequestEdit, onDuplicateNode, onOpenSettings, onToggleOutline, onUndo, onRedo, canUndo, canRedo,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeText,
  onUpdateNode,
  onAddChildNode,
  onAddSiblingNode,
  onDeleteNode,
  onToggleCollapse,
  onOpenImageInsertForNode,
  viewport,
  onViewportChange,
  onFitToViewCallback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Panning & dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Node dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initOffsetX: number;
    initOffsetY: number;
  } | null>(null);

  // Touch tracking for 2-finger pan & pinch zoom
  const touchStateRef = useRef<{
    initialDist: number;
    initialMidpoint: { x: number; y: number };
    startViewport: CanvasViewport;
  } | null>(null);

  const [measured, setMeasured] = useState<Record<string,{width:number;height:number}>>({});
  const [contextMenu,setContextMenu]=useState<{x:number;y:number;id:string|null}|null>(null);
  const measureNode = useCallback((id:string,size:{width:number;height:number})=>setMeasured(prev => prev[id]?.width===size.width&&prev[id]?.height===size.height?prev:{...prev,[id]:size}),[]);
  useEffect(()=>{setContextMenu(null);},[mindMap.id]);
  const { nodePositions, branches, bounds } = computeMindMapLayout(mindMap,measured);
  useEffect(()=>{
    if(nodeAction?.action!=='contextMenu')return;
    const pos=nodePositions.get(nodeAction.id);const rect=containerRef.current?.getBoundingClientRect();
    if(pos&&rect)setContextMenu({id:nodeAction.id,x:rect.left+(pos.x+pos.width/2)*viewport.zoom+viewport.x,y:rect.top+(pos.y+pos.height/2)*viewport.zoom+viewport.y});
  },[nodeAction]);
  useEffect(()=>{if(dialogOpen)setContextMenu(null);},[dialogOpen]);
  const viewportRef=useRef(viewport);viewportRef.current=viewport;
  const caretFrame=useRef<number|null>(null);
  const keepCaretVisible=(_clientY:number)=>{
    if(caretFrame.current!==null)cancelAnimationFrame(caretFrame.current);
    caretFrame.current=requestAnimationFrame(()=>{
      caretFrame.current=null;
      const editor=document.activeElement as HTMLTextAreaElement;
      if(editor?.tagName!=='TEXTAREA'||editor.getAttribute('aria-label')!=='Idea text')return;
      const rect=containerRef.current?.getBoundingClientRect();if(!rect)return;
      const box=editor.getBoundingClientRect();const current=viewportRef.current;
      // Read after tree layout settles, so a resize never repeatedly pans against an old position.
      const caretY=editor.selectionStart===editor.value.length?box.bottom:box.top+Number.parseFloat(getComputedStyle(editor).lineHeight)*current.zoom;
      const bottom=rect.bottom-90;const top=rect.top+130;
      const dy=caretY>bottom?bottom-caretY:caretY<top?top-caretY:0;
      const dx=box.right>rect.right-24?rect.right-24-box.right:box.left<rect.left+85?rect.left+85-box.left:0;
      if(Math.abs(dx)>1||Math.abs(dy)>1)onViewportChange({...current,x:current.x+dx,y:current.y+dy});
    });
  };
  useEffect(()=>()=>{if(caretFrame.current!==null)cancelAnimationFrame(caretFrame.current);},[]);

  // Fit mind map nicely to view
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;

    const mapW = bounds.width;
    const mapH = bounds.height;

    const scaleX = (containerW - 140) / mapW;
    const scaleY = (containerH - 140) / mapH;
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.08), 1.2);

    const centerX = bounds.minX + bounds.width / 2;
    const centerY = bounds.minY + bounds.height / 2;

    const newX = containerW / 2 - centerX * targetZoom;
    const newY = containerH / 2 - centerY * targetZoom;

    onViewportChange({ x: newX, y: newY, zoom: targetZoom });
  }, [bounds, onViewportChange]);

  useEffect(() => {
    if (onFitToViewCallback) {
      onFitToViewCallback(fitToView);
    }
  }, [fitToView, onFitToViewCallback]);

  const latestFit=useRef(fitToView);latestFit.current=fitToView;
  const cleanupSeen=useRef(cleanupVersion);
  useEffect(()=>{
    if(cleanupSeen.current===cleanupVersion)return;
    cleanupSeen.current=cleanupVersion;
    const frame=requestAnimationFrame(()=>latestFit.current());
    return()=>cancelAnimationFrame(frame);
  },[cleanupVersion]);

  // Initial fit on first mount
  const hasFittedRef = useRef(false);
  useEffect(() => {
    if (!hasFittedRef.current && containerRef.current) {
      hasFittedRef.current = true;
      fitToView();
    }
  }, [fitToView]);

  // Panning has a configurable hold key; editing commands live in the workspace.
  useEffect(() => {
    let panCode='';
    const down=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if(dialogOpen||target.closest('button,input,textarea,select,a,[role=dialog],[role=menu]')||target.isContentEditable)return;
      if(commandForEvent(e,preferences)==='pan'){e.preventDefault();panCode=e.code;setSpacePressed(true);}
    };
    const up=(e:KeyboardEvent)=>{if(e.code===panCode){setSpacePressed(false);panCode='';}};
    const blur=()=>{setSpacePressed(false);panCode='';};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
  },[dialogOpen,preferences]);

  // Trackpad two-finger pan AND pinch zoom handler
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {
      // Pinch to zoom (trackpad pinch gesture or ctrl+wheel)
      const zoomFactor = -e.deltaY * 0.01;
      const newZoom = Math.min(Math.max(viewport.zoom * Math.exp(zoomFactor), 0.15), 3.0);
      const zoomRatio = newZoom / viewport.zoom;

      const newX = mouseX - (mouseX - viewport.x) * zoomRatio;
      const newY = mouseY - (mouseY - viewport.y) * zoomRatio;
      onViewportChange({ x: newX, y: newY, zoom: newZoom });
    } else {
      // Two-finger move around to pan!
      onViewportChange({
        ...viewport,
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY,
      });
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  });

  // Node drag initiation
  const handleStartDragNode = (nodeId: string, clientX: number, clientY: number) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return;

    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      clientX,
      clientY,
      initOffsetX: node.offsetX || 0,
      initOffsetY: node.offsetY || 0,
    };
    onSelectNode(nodeId);
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingNodeId || e.button === 2) return;

    // Pan on middle click, spacebar, or clicking background
    const isBgClick = !(e.target as HTMLElement).closest('[data-mindmap-node]');

    if (e.button === 1 || spacePressed || (e.button === 0 && isBgClick)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Moving dragged node
    if (draggingNodeId && dragStartRef.current) {
      const deltaX = (e.clientX - dragStartRef.current.clientX) / viewport.zoom;
      const deltaY = (e.clientY - dragStartRef.current.clientY) / viewport.zoom;

      onUpdateNode(draggingNodeId, {
        offsetX: Math.round(dragStartRef.current.initOffsetX + deltaX),
        offsetY: Math.round(dragStartRef.current.initOffsetY + deltaY),
      });
      return;
    }

    // 2. Moving canvas pan
    if (isPanning) {
      onViewportChange({
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      dragStartRef.current = null;
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Touch handlers: Two-finger pan & pinch zoom, plus single-finger node drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Initiate 2-finger pan & pinch zoom
      if (draggingNodeId) {
        setDraggingNodeId(null);
        dragStartRef.current = null;
      }

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const mid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      touchStateRef.current = {
        initialDist: dist,
        initialMidpoint: mid,
        startViewport: { ...viewport },
      };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const isBg = !(e.target as HTMLElement).closest('[data-mindmap-node]');
      if (isBg) {
        setIsPanning(true);
        setPanStart({ x: t.clientX - viewport.x, y: t.clientY - viewport.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 1. Two-finger Pan & Pinch Zoom
    if (e.touches.length === 2 && touchStateRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const { initialDist, initialMidpoint, startViewport } = touchStateRef.current;

      // Pinch zoom scale
      const scale = currentDist / Math.max(initialDist, 10);
      const newZoom = Math.min(Math.max(startViewport.zoom * scale, 0.15), 3.0);

      // World point under initial midpoint
      const worldMidX = (initialMidpoint.x - startViewport.x) / startViewport.zoom;
      const worldMidY = (initialMidpoint.y - startViewport.y) / startViewport.zoom;

      // Pan offset based on midpoint movement
      const newX = currentMid.x - worldMidX * newZoom;
      const newY = currentMid.y - worldMidY * newZoom;

      onViewportChange({ x: newX, y: newY, zoom: newZoom });
      return;
    }

    // 2. Dragging node with single touch
    if (e.touches.length === 1 && draggingNodeId && dragStartRef.current) {
      const t = e.touches[0];
      const deltaX = (t.clientX - dragStartRef.current.clientX) / viewport.zoom;
      const deltaY = (t.clientY - dragStartRef.current.clientY) / viewport.zoom;

      onUpdateNode(draggingNodeId, {
        offsetX: Math.round(dragStartRef.current.initOffsetX + deltaX),
        offsetY: Math.round(dragStartRef.current.initOffsetY + deltaY),
      });
      return;
    }

    // 3. Single finger pan on background
    if (e.touches.length === 1 && isPanning) {
      const t = e.touches[0];
      onViewportChange({
        ...viewport,
        x: t.clientX - panStart.x,
        y: t.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStateRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsPanning(false);
      setDraggingNodeId(null);
      dragStartRef.current = null;
    }
  };

  // Drag and drop image file onto canvas or node
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (selectedNodeId) {
        onUpdateNode(selectedNodeId, {
          image: { url: dataUrl, width: 200, height: 130 },
        });
      } else {
        onUpdateNode(mindMap.rootId, { image: { url: dataUrl, width: 200, height: 130 } });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      aria-label={`Mind map canvas. Select an idea, use ${shortcutLabel(preferences.shortcuts.addChild)} to add a child, or double-click to edit.`}
      ref={containerRef}
      onContextMenu={e=>{
        if((e.target as HTMLElement).closest('textarea,input,[contenteditable=true]'))return;
        e.preventDefault();e.stopPropagation();
        const id=(e.target as HTMLElement).closest('[data-mindmap-node]')?.getAttribute('data-mindmap-node')||null;
        onSelectNode(id);setContextMenu({x:e.clientX,y:e.clientY,id});
      }}
      onMouseDown={e=>{setContextMenu(null);handleMouseDown(e);}}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={e => { if (!(e.target as HTMLElement).closest('[data-mindmap-node]')) onSelectNode(null); }}
      className={`relative w-full h-full overflow-hidden bg-slate-50 select-none canvas-grid-dots touch-none ${
        spacePressed
          ? 'cursor-grab'
          : isPanning
          ? 'cursor-grabbing'
          : draggingNodeId
          ? 'cursor-grabbing'
          : 'cursor-default'
      }`}
    >
      {/* Canvas World Container */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
        className="pointer-events-none"
      >
        {/* SVG Layer: Organic Bézier Curves */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none z-0"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <filter id="shadow-branch" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
            </filter>
          </defs>

          {routeMapLinks(mindMap.links||[],nodePositions).map(link=><g key={link.id}><path data-cross-link={link.id} d={link.pathString} fill="none" stroke={link.color} strokeWidth={1.8} strokeDasharray="7 5" opacity={0.8}/>{link.label&&<text x={link.labelX} y={link.labelY-7} textAnchor="middle" fontSize={12} fill={link.color} style={{paintOrder:'stroke',stroke:'#f7f8fa',strokeWidth:5}}>{link.label}</text>}</g>)}
          {branches.map((b) => (
            <g key={`${b.fromNodeId}->${b.toNodeId}`}>
              {/* Organic branch curve */}
              <path
                d={b.pathString}
                fill="none"
                stroke={b.color}
                strokeWidth={b.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-150"
              />

              {/* Node underline if applicable */}
              {b.underlinePath && (
                <path
                  d={b.underlinePath}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={b.strokeWidth}
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </svg>

        {/* HTML Layer: Interactive Nodes */}
        <div className="absolute inset-0 pointer-events-auto z-10">
          {Array.from(nodePositions.entries()).map(([nodeId, pos]) => {
            const node = mindMap.nodes[nodeId];
            if (!node) return null;

            const isRoot = nodeId === mindMap.rootId;
            const isSelected = selectedNodeId === nodeId;
            const validKids = (node.childrenIds || [])
              .map((id) => mindMap.nodes[id])
              .filter(Boolean);

            return (
              <MindMapNodeComponent
                key={nodeId}
                node={node}
                position={pos}
                isRoot={isRoot}
                isSelected={isSelected}
                globalNodeStyle={mindMap.nodeStyle}
                theme={mindMap.theme}
                childCount={validKids.length}
                onSelect={() => onSelectNode(nodeId)}
                onStartDragNode={handleStartDragNode}
                onUpdateText={(text,recordHistory) => onUpdateNodeText(nodeId, text,recordHistory)}
                editToken={nodeAction?.action==='edit'&&nodeAction.id===nodeId?nodeAction.token:undefined}
                onMeasure={measureNode}
                onKeepCaretVisible={keepCaretVisible}
                zoom={viewport.zoom}
                onUpdateNode={(updates) => onUpdateNode(nodeId, updates)}
                onAddChild={() => onAddChildNode(nodeId)}
                onAddSibling={() => onAddSiblingNode(nodeId)}
                onDelete={() => onDeleteNode(nodeId)}
                onToggleCollapse={() => onToggleCollapse(nodeId)}
                onOpenImageInsert={() => onOpenImageInsertForNode(nodeId)}
              />
            );
          })}
        </div>
      </div>

      {contextMenu&&<CanvasContextMenu x={contextMenu.x} y={contextMenu.y} onClose={()=>setContextMenu(null)} actions={(():ContextAction[]=>{
        const id=contextMenu.id;const node=id?mindMap.nodes[id]:null;
        const shortcut=(key:keyof Preferences['shortcuts'])=>shortcutLabel(preferences.shortcuts[key]);
        if(node&&id)return [
          {label:'Edit text',icon:Pencil,run:()=>onRequestEdit(id),shortcut:shortcut('edit')},
          {label:'Link this idea…',icon:Link2,run:()=>onOpenLinks(id)},
          {label:node.branchOrigin==='baseline'?'Start branches from centre':'Start branches from bottom',icon:LocateFixed,run:()=>onUpdateNode(id,{branchOrigin:node.branchOrigin==='baseline'?'centre':'baseline'})},
          {label:'Add child branch',icon:Plus,run:()=>onAddChildNode(id),shortcut:shortcut('addChild')},
          {label:'Add sibling branch',icon:Plus,run:()=>onAddSiblingNode(id),disabled:id===mindMap.rootId,shortcut:shortcut('addSibling')},
          {label:id===mindMap.rootId?'Duplicate map':'Duplicate branch',icon:Copy,run:()=>onDuplicateNode(id),separator:true},
          {label:'Add or change image',icon:Image,run:()=>onOpenImageInsertForNode(id)},
          {label:node.isBold?'Remove bold':'Make bold',icon:Bold,run:()=>onUpdateNode(id,{isBold:!node.isBold})},
          {label:node.isCollapsed?'Expand branch':'Collapse branch',icon:FoldVertical,run:()=>onToggleCollapse(id),disabled:id===mindMap.rootId||!node.childrenIds.length,shortcut:shortcut('collapse')},
          {label:'Delete branch',icon:Trash2,run:()=>onDeleteNode(id),disabled:id===mindMap.rootId,danger:true,separator:true,shortcut:shortcut('delete')},
        ];
        return [
          {label:'Add branch to centre',icon:Plus,run:()=>onAddChildNode(mindMap.rootId),shortcut:shortcut('addChild')},
          {label:'Clean up map',icon:WandSparkles,run:onCleanUp},
          {label:'Link ideas',icon:Link2,run:()=>onOpenLinks()},
          {label:'Fit map to screen',icon:Maximize,run:fitToView,shortcut:shortcut('fit')},
          {label:'Search ideas',icon:Search,run:onToggleOutline,shortcut:shortcut('search')},
          {label:'Undo',icon:Undo2,run:onUndo,disabled:!canUndo,separator:true,shortcut:shortcut('undo')},
          {label:'Redo',icon:Redo2,run:onRedo,disabled:!canRedo,shortcut:shortcut('redo')},
          {label:'Settings',icon:Settings,run:onOpenSettings,separator:true,shortcut:shortcut('settings')},
        ];
      })()}/>}
    </div>
  );
};

