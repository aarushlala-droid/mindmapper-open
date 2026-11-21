import { cleanUpMap, addMapLink } from './utils/connections';
import { LinksModal } from './components/LinksModal';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MindMap,
  MindMapNode,
  CanvasViewport,
  LayoutDirection,
  NodeStyle,
  ThemeName,
  NodeImage,
} from './types/mindmap';
import { storageService } from './services/storage';
import { settingsService } from './services/settings';
import { commandForEvent, shortcutLabel } from './services/preferences';
import { SettingsModal } from './components/SettingsModal';
import { computeMindMapLayout, THEME_PALETTES } from './utils/layout';
import { MiroTopBar } from './components/MiroTopBar';
import { MiroToolbar } from './components/MiroToolbar';
import { MiroCanvas } from './components/MiroCanvas';
import { ZoomControls } from './components/ZoomControls';
import { Minimap } from './components/Minimap';
import { ExportModal } from './components/ExportModal';
import { MapManagerModal } from './components/MapManagerModal';
import { ImageInsertModal } from './components/ImageInsertModal';
import { TemplateLibraryModal } from './components/TemplateLibraryModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { RecoveryModal } from './components/RecoveryModal';
import { OutlinePanel } from './components/OutlinePanel';
import { downloadWorkspaceBackup } from './components/MapManagerModal';
import { Check, CloudOff, LocateFixed, GitBranch, LockKeyhole } from 'lucide-react';

export default function App() {
  const [preferences,setPreferences]=useState(settingsService.preferences);
  const [isSettingsOpen,setIsSettingsOpen]=useState(false);
  const [isLinksOpen,setIsLinksOpen]=useState(false);
  const [cleanupVersion,setCleanupVersion]=useState(0);
  const [nodeAction,setNodeAction]=useState<{id:string;action:'edit'|'contextMenu';token:string}|null>(null);
  useEffect(()=>settingsService.subscribe(()=>setPreferences({...settingsService.preferences})),[]);
  useEffect(()=>{document.documentElement.style.setProperty('--workspace-font',preferences.fontFamily);},[preferences.fontFamily]);
  const requestEdit=(id:string)=>setNodeAction({id,action:'edit',token:crypto.randomUUID()});
  // Current active map ID & MindMap state
  const [currentMapId, setCurrentMapId] = useState<string>(() => storageService.getCurrentMapId());
  const [mindMap, setMindMap] = useState<MindMap>(() => {
    const initialId = storageService.getCurrentMapId();
    return storageService.getMap(initialId) || storageService.getAllMaps()[0];
  });

  // Undo / Redo history
  const [historyPast, setHistoryPast] = useState<MindMap[]>([]);
  const [historyFuture, setHistoryFuture] = useState<MindMap[]>([]);

  // Selection & UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sync, setSync] = useState(storageService.status);
  const [notice, setNotice] = useState(storageService.notice);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  useEffect(() => storageService.subscribe(() => {
    setSync({ ...storageService.status });
    setNotice(storageService.notice);
    const active = storageService.getMap(currentMapId);
    if (active) setMindMap(active);
    else {
      const next = storageService.getAllMaps()[0];
      if (next) { setCurrentMapId(next.id); setMindMap(next); setSelectedNodeId(null); setHistoryPast([]); setHistoryFuture([]); }
    }
  }), [currentMapId]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMapManagerOpen, setIsMapManagerOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [imageModalNodeId, setImageModalNodeId] = useState<string | null>(null);

  // Viewport
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 0.85 });
  const fitToViewRef = useRef<(() => void) | null>(null);

  // Show quick toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Persist the local draft immediately. The service serializes cloud writes.
  const applyMapChange = useCallback((newMap: MindMap, recordHistory = true) => {
    if (recordHistory) {
      setHistoryPast(prev => [...prev.slice(-49), mindMap]);
      setHistoryFuture([]);
    }
    setMindMap(newMap);
    storageService.saveMap(newMap);
  }, [mindMap]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [mindMap, ...prev]);
    setMindMap(previous);
    storageService.saveMap(previous);
  }, [historyPast, mindMap]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, mindMap]);
    setMindMap(next);
    storageService.saveMap(next);
  }, [historyFuture, mindMap]);

  // Switch to another mind map
  const handleSelectMap = (id: string) => {
    const target = storageService.getMap(id);
    if (target) {
      setCurrentMapId(id);
      storageService.setCurrentMapId(id);
      setMindMap(target);
      setSelectedNodeId(null);
      setHistoryPast([]);
      setHistoryFuture([]);
      // Fit to view
      setTimeout(() => {
        fitToViewRef.current?.();
      }, 50);
    }
  };

  // Node editing actions
  const handleUpdateTitle = (title: string) => {
    applyMapChange({ ...mindMap, title });
  };

  const handleUpdateNodeText = (id: string, text: string, recordHistory = true) => {
    const node = mindMap.nodes[id];
    if (!node) return;
    const updatedNodes = {
      ...mindMap.nodes,
      [id]: { ...node, text },
    };
    applyMapChange({ ...mindMap, nodes: updatedNodes }, recordHistory);
  };

  const handleUpdateNode = (id: string, updates: Partial<MindMapNode>) => {
    const node = mindMap.nodes[id];
    if (!node) return;
    const updatedNodes = {
      ...mindMap.nodes,
      [id]: { ...node, ...updates },
    };
    applyMapChange({ ...mindMap, nodes: updatedNodes });
  };

  // Add child node
  const handleAddChildNode = useCallback((parentId: string) => {
    const parent = mindMap.nodes[parentId];
    if (!parent) return;

    const newId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isParentRoot = parentId === mindMap.rootId;

    // Determine side if parent is root
    let childSide: 'left' | 'right' = 'right';
    if (isParentRoot) {
      const rightCount = (parent.childrenIds || [])
        .map((kId) => mindMap.nodes[kId])
        .filter((k) => k?.side === 'right').length;
      const leftCount = (parent.childrenIds || [])
        .map((kId) => mindMap.nodes[kId])
        .filter((k) => k?.side === 'left').length;
      childSide = rightCount <= leftCount ? 'right' : 'left';
    } else {
      childSide = parent.side || 'right';
    }

    const newNode: MindMapNode = {
      id: newId,
      text: 'New Branch',
      parentId,
      side: childSide,
      childrenIds: [],
      color: parent.color,
    };

    const updatedNodes = {
      ...mindMap.nodes,
      [newId]: newNode,
      [parentId]: {
        ...parent,
        isCollapsed: false, // Auto-expand when adding child
        childrenIds: [...(parent.childrenIds || []), newId],
      },
    };

    applyMapChange({ ...mindMap, nodes: updatedNodes });
    setSelectedNodeId(newId);
    requestEdit(newId);
  }, [mindMap, applyMapChange]);

  // Add sibling node
  const handleAddSiblingNode = useCallback((siblingId: string) => {
    const sibling = mindMap.nodes[siblingId];
    if (!sibling || !sibling.parentId) return;

    const parentId = sibling.parentId;
    const parent = mindMap.nodes[parentId];
    if (!parent) return;

    const newId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNode: MindMapNode = {
      id: newId,
      text: 'New Branch',
      parentId,
      side: sibling.side,
      childrenIds: [],
      color: sibling.color,
    };

    // Insert right after current sibling in parent's children list
    const oldChildren = parent.childrenIds || [];
    const sibIdx = oldChildren.indexOf(siblingId);
    const newChildren = [...oldChildren];
    if (sibIdx >= 0) {
      newChildren.splice(sibIdx + 1, 0, newId);
    } else {
      newChildren.push(newId);
    }

    const updatedNodes = {
      ...mindMap.nodes,
      [newId]: newNode,
      [parentId]: {
        ...parent,
        childrenIds: newChildren,
      },
    };

    applyMapChange({ ...mindMap, nodes: updatedNodes });
    setSelectedNodeId(newId);
    requestEdit(newId);
  }, [mindMap, applyMapChange]);

  // Delete node
  const handleDeleteNode = useCallback((id: string) => {
    if (id === mindMap.rootId) return; // Cannot delete root
    const node = mindMap.nodes[id];
    if (!node || !node.parentId) return;

    const parent = mindMap.nodes[node.parentId];
    if (!parent) return;

    // Collect all descendant ids to remove
    const idsToRemove = new Set<string>([id]);
    const collectDescendants = (nId: string) => {
      const n = mindMap.nodes[nId];
      if (n?.childrenIds) {
        n.childrenIds.forEach((childId) => {
          idsToRemove.add(childId);
          collectDescendants(childId);
        });
      }
    };
    collectDescendants(id);

    const updatedNodes: Record<string, MindMapNode> = {};
    for (const [k, v] of Object.entries(mindMap.nodes)) {
      if (!idsToRemove.has(k)) {
        if (k === parent.id) {
          updatedNodes[k] = {
            ...v,
            childrenIds: v.childrenIds.filter((childId) => childId !== id),
          };
        } else {
          updatedNodes[k] = v;
        }
      }
    }

    applyMapChange({ ...mindMap, nodes: updatedNodes, ...(mindMap.links ? {links:mindMap.links.filter(l=>!idsToRemove.has(l.fromNodeId)&&!idsToRemove.has(l.toNodeId))} : {}) });
    setSelectedNodeId(parent.id);
  }, [mindMap, applyMapChange]);

  const handleDuplicateNode=(id:string)=>{
    if(id===mindMap.rootId){const copy=storageService.duplicateMap(mindMap.id);if(copy)handleSelectMap(copy.id);return;}
    const node=mindMap.nodes[id];if(!node?.parentId)return;
    const nodes={...mindMap.nodes};
    const clone=(oldId:string,parentId:string):string=>{const old=nodes[oldId];const newId=crypto.randomUUID();nodes[newId]={...structuredClone(old),id:newId,parentId,childrenIds:[]};nodes[newId].childrenIds=old.childrenIds.map(child=>clone(child,newId));return newId;};
    const copyId=clone(id,node.parentId);const parent=nodes[node.parentId];const children=[...parent.childrenIds];children.splice(children.indexOf(id)+1,0,copyId);nodes[parent.id]={...parent,childrenIds:children,isCollapsed:false};
    applyMapChange({...mindMap,nodes});setSelectedNodeId(copyId);
  };

  const handleCleanUp=()=>{
    applyMapChange(cleanUpMap(mindMap));
    setCleanupVersion(v=>v+1);
    showToast('Layout cleaned up. All text, ideas and links are preserved. Undo is available.');
  };
  const openLinks=(id?:string)=>{if(id)setSelectedNodeId(id);setIsLinksOpen(true);};

  // Toggle collapse
  const handleToggleCollapse = (id: string) => {
    const node = mindMap.nodes[id];
    if (!node) return;
    handleUpdateNode(id, { isCollapsed: !node.isCollapsed });
  };

  // Insert image to node
  const handleInsertImage = (image: NodeImage) => {
    if (!imageModalNodeId) return;
    handleUpdateNode(imageModalNodeId, { image });
    setImageModalNodeId(null);
  };

  // Toolbar actions
  const handleSelectLayout = (layout: LayoutDirection) => {
    applyMapChange({ ...mindMap, layout });
  };

  const handleSelectNodeStyle = (nodeStyle: NodeStyle) => {
    applyMapChange({ ...mindMap, nodeStyle });
  };

  const handleSelectTheme = (theme: ThemeName) => {
    const nodes = { ...mindMap.nodes };
    const recolor = (id: string, color: string) => { nodes[id] = { ...nodes[id], color }; nodes[id].childrenIds.forEach(child => recolor(child, color)); };
    mindMap.nodes[mindMap.rootId].childrenIds.forEach((id, i) => recolor(id, THEME_PALETTES[theme][i % THEME_PALETTES[theme].length]));
    applyMapChange({ ...mindMap, nodes, theme });
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.origin); showToast('Private workspace link copied. Sign in with your account to open it.'); }
    catch { showToast('Could not copy the link. Copy it from your address bar.'); }
  };

  const zoomTo = (zoom: number) => setViewport(prev => {
    const ratio = zoom / prev.zoom;
    return { x: window.innerWidth/2 - (window.innerWidth/2 - prev.x)*ratio, y: window.innerHeight/2 - (window.innerHeight/2 - prev.y)*ratio, zoom };
  });

  // Compute layout bounds for minimap
  const { nodePositions, branches, bounds } = computeMindMapLayout(mindMap);
  const focusNode = (id: string) => {
    let parent = mindMap.nodes[id]?.parentId;
    const nodes = { ...mindMap.nodes };
    let expanded = false;
    while (parent) { if (nodes[parent].isCollapsed) { nodes[parent] = { ...nodes[parent], isCollapsed: false }; expanded = true; } parent = nodes[parent].parentId; }
    const map = expanded ? { ...mindMap, nodes } : mindMap;
    if (expanded) applyMapChange(map);
    setSelectedNodeId(id);
    const pos = computeMindMapLayout(map).nodePositions.get(id);
    if (pos) setViewport({ x: (window.innerWidth - (outlineOpen && window.innerWidth > 600 ? 320 : 0))/2 - (pos.x+pos.width/2), y: window.innerHeight/2 - (pos.y+pos.height/2), zoom: 1 });
  };

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if(target.closest('input,textarea,select,[role=dialog],[role=menu]')||target.isContentEditable||e.isComposing)return;
      if(e.key==='Escape'){setIsPresentationMode(false);setSelectedNodeId(null);return;}
      const action=commandForEvent(e,preferences);if(!action||action==='pan'||e.repeat)return;
      // Keep ordinary Tab navigation when focus is on toolbar buttons.
      if((action==='addChild'||action==='addSibling')&&target.closest('button,a'))return;
      e.preventDefault();
      const id=selectedNodeId||mindMap.rootId;
      if(action==='addChild')handleAddChildNode(id);
      else if(action==='addSibling')handleAddSiblingNode(id);
      else if(action==='edit')requestEdit(id);
      else if(action==='delete'&&selectedNodeId)handleDeleteNode(selectedNodeId);
      else if(action==='collapse'&&id!==mindMap.rootId)handleToggleCollapse(id);
      else if(action==='undo')handleUndo();
      else if(action==='redo')handleRedo();
      else if(action==='fit')fitToViewRef.current?.();
      else if(action==='search')setOutlineOpen(true);
      else if(action==='focus')setIsPresentationMode(v=>!v);
      else if(action==='help')setIsShortcutsOpen(true);
      else if(action==='save')void storageService.flush();
      else if(action==='settings')setIsSettingsOpen(true);
      else if(action==='contextMenu')setNodeAction({id,action:'contextMenu',token:crypto.randomUUID()});
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[preferences,selectedNodeId,mindMap,handleUndo,handleRedo,handleAddChildNode,handleAddSiblingNode,handleDeleteNode]);

  return (
    <div className="workspace w-screen h-dvh overflow-hidden flex flex-col bg-slate-50 relative">
      {/* Top Navigation Bar */}
      {!isPresentationMode && (
        <MiroTopBar
          mindMap={mindMap}
          onUpdateTitle={handleUpdateTitle}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenMapManager={() => setIsMapManagerOpen(true)}
          onNewMap={() => { const created = storageService.createMap(); handleSelectMap(created.id); }}
          sync={sync}
          onOpenRecovery={() => setIsRecoveryOpen(true)}
          onToggleOutline={() => setOutlineOpen(!outlineOpen)}
          outlineOpen={outlineOpen}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onCleanUp={handleCleanUp}
          onOpenLinks={()=>openLinks()}
          onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
          onShare={handleShare}
        />
      )}

      {/* Main Canvas Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {/* Floating Left Toolbar */}
        {!isPresentationMode && (
          <MiroToolbar
            currentLayout={mindMap.layout}
            onSelectLayout={handleSelectLayout}
            currentNodeStyle={mindMap.nodeStyle}
            onSelectNodeStyle={handleSelectNodeStyle}
            currentTheme={mindMap.theme}
            onSelectTheme={handleSelectTheme}
            onAddChildNode={() => handleAddChildNode(selectedNodeId || mindMap.rootId)}
            onOpenImageInsert={() => setImageModalNodeId(selectedNodeId || mindMap.rootId)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            selectedNodeId={selectedNodeId}
          />
        )}

        {/* Miro Canvas */}
        <MiroCanvas
          key={mindMap.id}
          cleanupVersion={cleanupVersion}
          onCleanUp={handleCleanUp}
          onOpenLinks={openLinks}
          mindMap={mindMap}
          dialogOpen={isExportOpen || isMapManagerOpen || isTemplatesOpen || isShortcutsOpen || isRecoveryOpen || isSettingsOpen || isLinksOpen || Boolean(imageModalNodeId)}
          preferences={preferences}
          nodeAction={nodeAction}
          onRequestEdit={requestEdit}
          onDuplicateNode={handleDuplicateNode}
          onOpenSettings={()=>setIsSettingsOpen(true)}
          onToggleOutline={()=>setOutlineOpen(true)}
          onUndo={handleUndo} onRedo={handleRedo} canUndo={historyPast.length>0} canRedo={historyFuture.length>0}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodeText={handleUpdateNodeText}
          onUpdateNode={handleUpdateNode}
          onAddChildNode={handleAddChildNode}
          onAddSiblingNode={handleAddSiblingNode}
          onDeleteNode={handleDeleteNode}
          onToggleCollapse={handleToggleCollapse}
          onOpenImageInsertForNode={setImageModalNodeId}
          viewport={viewport}
          onViewportChange={setViewport}
          onFitToViewCallback={(fn) => {
            fitToViewRef.current = fn;
          }}
        />

        {!isPresentationMode && outlineOpen && <OutlinePanel map={mindMap} selected={selectedNodeId} onSelect={focusNode} onClose={() => setOutlineOpen(false)} onUpdate={handleUpdateNode} onAdd={handleAddChildNode} />}
        {!isPresentationMode && <div className="canvas-caption surface"><span><GitBranch size={14}/>{Object.keys(mindMap.nodes).length} ideas</span><span className="caption-hint">Double-click to edit <i>·</i> {shortcutLabel(preferences.shortcuts.addChild)} to branch</span><button className="icon-button" aria-label="Centre selected idea" title="Centre selected idea" onClick={() => focusNode(selectedNodeId || mindMap.rootId)}><LocateFixed size={16}/></button></div>}
        {/* Bottom Right Controls */}
        <ZoomControls
          zoom={viewport.zoom}
          onZoomIn={() => zoomTo(Math.min(viewport.zoom * 1.2, 3))}
          onZoomOut={() => zoomTo(Math.max(viewport.zoom / 1.2, 0.08))}
          onResetZoom={() => zoomTo(1)}
          onFitToView={() => fitToViewRef.current?.()}
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap(!showMinimap)}
        />

        {/* Interactive Minimap */}
        {showMinimap && (
          <Minimap
            bounds={bounds}
            nodePositions={nodePositions}
            branches={branches}
            viewport={viewport}
            containerWidth={window.innerWidth}
            containerHeight={window.innerHeight - 56}
            onPanTo={(x, y) => setViewport((prev) => ({ ...prev, x, y }))}
            onClose={() => setShowMinimap(false)}
          />
        )}

        {/* Floating Presentation Mode Exit Button */}
        {isPresentationMode && (
          <button
            onClick={() => setIsPresentationMode(false)}
            className="absolute top-4 right-4 z-40 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur transition-all cursor-pointer"
          >
            Exit Focus View (Esc)
          </button>
        )}
      </main>

      {(sync.state === 'error' || sync.state === 'offline' || notice) && <div className="save-alert surface" role="status"><CloudOff size={18}/><span>{notice || sync.message}</span><button className="text-button" onClick={() => { storageService.notice = ''; setNotice(''); void storageService.flush(); }}>Retry save</button><button className="text-button" onClick={downloadWorkspaceBackup}>Download backup</button></div>}
      {isRecoveryOpen && <RecoveryModal mapId={currentMapId} onClose={() => setIsRecoveryOpen(false)} onRestored={handleSelectMap} />}
      {isSettingsOpen && <SettingsModal onClose={()=>setIsSettingsOpen(false)} />}
      {isLinksOpen && <LinksModal map={mindMap} selected={selectedNodeId} onAdd={(from,to,label)=>applyMapChange(addMapLink(mindMap,from,to,label))} onRemove={id=>applyMapChange({...mindMap,links:(mindMap.links||[]).filter(l=>l.id!==id)})} onClose={()=>setIsLinksOpen(false)} />}
      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        mindMap={mindMap}
      />

      <MapManagerModal
        isOpen={isMapManagerOpen}
        onClose={() => setIsMapManagerOpen(false)}
        currentMapId={currentMapId}
        onSelectMap={handleSelectMap}
        onMapCreatedOrUpdated={() => setMindMap(storageService.getMap(currentMapId) || mindMap)}
      />

      <TemplateLibraryModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectMap={handleSelectMap}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ImageInsertModal
        isOpen={Boolean(imageModalNodeId)}
        onClose={() => setImageModalNodeId(null)}
        onInsertImage={handleInsertImage}
        targetNodeTitle={imageModalNodeId ? mindMap.nodes[imageModalNodeId]?.text : undefined}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

