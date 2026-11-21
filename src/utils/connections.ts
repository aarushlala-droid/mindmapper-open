import type { MindMap, MindMapLink, NodeLayoutPosition } from '../types/mindmap';
export function cleanUpMap(map:MindMap):MindMap {
  const nodes=Object.fromEntries(Object.entries(map.nodes).map(([id,node])=>{
    const {offsetX,offsetY,...rest}=node;
    return [id,rest];
  }));
  return {...map,nodes};
}
export function addMapLink(map:MindMap,fromNodeId:string,toNodeId:string,label=''):MindMap {
  if(fromNodeId===toNodeId||!map.nodes[fromNodeId]||!map.nodes[toNodeId])return map;
  const exists=map.links?.some(l=>(l.fromNodeId===fromNodeId&&l.toNodeId===toNodeId)||(l.fromNodeId===toNodeId&&l.toNodeId===fromNodeId));
  if(exists)return map;
  return {...map,links:[...(map.links||[]),{id:crypto.randomUUID(),fromNodeId,toNodeId,...(label.trim()?{label:label.trim()}:{} )}]};
}
export function routeMapLinks(links:MindMapLink[],positions:Map<string,NodeLayoutPosition>){
  const all=[...positions.values()];
  const top=Math.min(0,...all.map(p=>p.y));
  const left=Math.min(0,...all.map(p=>p.x));
  const right=Math.max(0,...all.map(p=>p.x+p.width));
  return links.flatMap((link,index)=>{
    const from=positions.get(link.fromNodeId),to=positions.get(link.toNodeId);if(!from||!to)return [];
    const margin=48+(index%12)*18;
    const sameSide=from.side===to.side;
    let startX:number,startY:number,endX:number,endY:number,pathString:string,labelX:number,labelY:number;
    if(sameSide){
      const isLeft=from.side==='left';const lane=isLeft?left-margin:right+margin;
      startX=from.x+(isLeft?0:from.width);startY=from.y+from.height/2;
      endX=to.x+(isLeft?0:to.width);endY=to.y+to.height/2;
      pathString=`M ${startX} ${startY} C ${lane} ${startY}, ${lane} ${endY}, ${endX} ${endY}`;
      labelX=lane;labelY=(startY+endY)/2;
    }else{
      const lane=top-margin;startX=from.x+from.width/2;startY=from.y;endX=to.x+to.width/2;endY=to.y;
      pathString=`M ${startX} ${startY} C ${startX} ${lane}, ${endX} ${lane}, ${endX} ${endY}`;
      labelX=(startX+endX)/2;labelY=lane;
    }
    return [{...link,pathString,startX,startY,endX,endY,labelX,labelY,color:link.color||'#64748B'}];
  });
}
