import type { MindMap } from '../types/mindmap';

// Validate the entire tree before layout recursion or persistent storage.
export function validateMap(value: unknown): value is MindMap {
  if (!value || typeof value !== 'object') return false;
  const m = value as MindMap;
  if(m.folderId!==undefined&&(typeof m.folderId!=='string'||!m.folderId||m.folderId.length>200))return false;
  if (typeof m.id !== 'string' || !m.id || m.id.length > 200 || typeof m.title !== 'string' || m.title.length > 500) return false;
  if (!['radial', 'right', 'left', 'vertical'].includes(m.layout) || !['underline', 'bubble', 'card'].includes(m.nodeStyle) || !['miro-vibrant', 'ocean', 'sunset', 'forest', 'monochrome'].includes(m.theme)) return false;
  if (!Number.isFinite(m.createdAt) || !Number.isFinite(m.updatedAt) || !m.nodes || typeof m.nodes !== 'object' || !Object.hasOwn(m.nodes, m.rootId)) return false;
  const ids = Object.keys(m.nodes);
  if (!ids.length || ids.length > 5000) return false;
  const visited = new Set<string>();
  const pending: [string, string | null, number][] = [[m.rootId, null, 0]];
  while (pending.length) {
    const [id, parentId, depth] = pending.pop()!;
    if (visited.has(id) || !Object.hasOwn(m.nodes, id) || depth > 100) return false;
    visited.add(id);
    const n = m.nodes[id];
    if (!n || n.id !== id || n.parentId !== parentId || typeof n.text !== 'string' || n.text.length > 30000 || !Array.isArray(n.childrenIds)) return false;
    if (n.branchOrigin !== undefined && !['centre','baseline'].includes(n.branchOrigin)) return false;
    if (n.color && !/^#[0-9a-fA-F]{6}$/.test(n.color)) return false;
    if (n.note !== undefined && (typeof n.note !== 'string' || n.note.length > 30000)) return false;
    for (const offset of [n.offsetX, n.offsetY]) if (offset !== undefined && (!Number.isFinite(offset) || Math.abs(offset) > 1000000)) return false;
    if (n.image && (typeof n.image.url !== 'string' || !/^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(n.image.url))) return false;
    for (const child of n.childrenIds) {
      if (typeof child !== 'string') return false;
      pending.push([child, id, depth + 1]);
    }
  }
  if(m.links!==undefined){
    if(!Array.isArray(m.links)||m.links.length>10000)return false;
    const linkIds=new Set<string>();const pairs=new Set<string>();
    for(const link of m.links){
      if(!link||typeof link.id!=='string'||!link.id||link.id.length>200||linkIds.has(link.id))return false;
      if(typeof link.fromNodeId!=='string'||typeof link.toNodeId!=='string'||link.fromNodeId===link.toNodeId||!Object.hasOwn(m.nodes,link.fromNodeId)||!Object.hasOwn(m.nodes,link.toNodeId))return false;
      if(link.label!==undefined&&(typeof link.label!=='string'||link.label.length>500))return false;
      if(link.color!==undefined&&!/^#[0-9a-fA-F]{6}$/.test(link.color))return false;
      const pair=JSON.stringify([link.fromNodeId,link.toNodeId].sort());if(pairs.has(pair))return false;
      linkIds.add(link.id);pairs.add(pair);
    }
  }
  return visited.size === ids.length;
}
