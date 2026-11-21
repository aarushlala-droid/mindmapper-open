import type { MindMapNode, NodeStyle } from '../types/mindmap';
import { settingsService } from '../services/settings';
let context: CanvasRenderingContext2D | null = null;
export function wrapText(text:string,maxWidth:number,measure:(text:string)=>number):string[] {
  const lines:string[]=[];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) { lines.push('');continue; }
    let line='';
    for (const token of paragraph.match(/\s+|\S+/g)||[]) {
      if (measure(line+token)<=maxWidth) {line+=token;continue;}
      if(line.trim()){lines.push(line.trimEnd());line='';}
      if(/^\s+$/.test(token)) continue;
      for(const char of Array.from(token)) {
        if(line&&measure(line+char)>maxWidth){lines.push(line);line='';}
        line+=char;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines.length?lines:[''];
}
export function measureNode(node:MindMapNode,isRoot:boolean,globalStyle:NodeStyle) {
  const style=node.nodeStyle||globalStyle;
  const fontSize=isRoot?18:node.fontSize==='xl'?20:node.fontSize==='lg'?16:node.fontSize==='sm'?12:14;
  const lineHeight=Math.ceil(fontSize*1.45);
  const fontFamily=settingsService.preferences.fontFamily;
  const fontWeight=isRoot||node.isBold?700:500;
  const font=`${node.isItalic?'italic':'normal'} ${fontWeight} ${fontSize}px ${fontFamily}`;
  if(!context&&typeof document!=='undefined')context=document.createElement('canvas').getContext('2d');
  if(context)context.font=font;
  const measure=(text:string)=>context?context.measureText(text).width:Array.from(text).length*fontSize*.56;
  const text=node.text||'Untitled';
  const border=style==='underline'&&!isRoot?0:isRoot?4:2;
  const paddingX=isRoot?18:style==='underline'?9:14;
  const paddingY=isRoot?13:style==='underline'?8:11;
  const natural=Math.max(...text.split('\n').map(measure),isRoot?170:64);
  const imageWidth=node.image?Math.min(Math.max(node.image.width||180,60),420):0;
  const contentWidth=Math.ceil(Math.max(Math.min(natural,isRoot?340:290),imageWidth));
  const lines=wrapText(text,contentWidth,measure);
  const textHeight=Math.max(1,lines.length)*lineHeight;
  const imageHeight=node.image?Math.min(Math.max(node.image.height||120,32),400):0;
  const imageGap=node.image?9:0;
  return {width:contentWidth+paddingX*2+border,height:textHeight+paddingY*2+imageHeight+imageGap+border,contentWidth,textHeight,lines,font,fontSize,lineHeight,fontFamily,fontWeight,paddingX,paddingY,border,imageWidth,imageHeight,imageGap};
}
