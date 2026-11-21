import { routeMapLinks } from './connections';
import type { jsPDF as JsPDF } from 'jspdf';
import { MindMap, NodeLayoutPosition, BranchPathData, ExportSettings } from '../types/mindmap';
import { computeMindMapLayout } from './layout';
import { measureNode } from './text';
import { settingsService } from '../services/settings';

/**
 * High-resolution canvas renderer for PNG and PDF generation.
 */
export async function renderMindMapToCanvas(
  mindMap: MindMap,
  scale: number = 2,
  background: 'white' | 'transparent' | 'grid' = 'white'
): Promise<HTMLCanvasElement> {
  const { nodePositions, branches, bounds } = computeMindMapLayout(mindMap);

  const canvas = document.createElement('canvas');
  const width = Math.ceil(bounds.width * scale);
  const height = Math.ceil(bounds.height * scale);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Pre-load images if any
  const imageElements: Record<string, HTMLImageElement> = {};
  for (const node of Object.values(mindMap.nodes)) {
    if (node.image?.url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = node.image.url;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one image fails
        });
        imageElements[node.id] = img;
      } catch (e) {
        console.warn('Image load failed for export', e);
      }
    }
  }

  // Draw background
  if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'grid') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid dots
    ctx.fillStyle = '#cbd5e1';
    const dotGap = 24 * scale;
    const dotRadius = 1.2 * scale;
    for (let x = 0; x < width; x += dotGap) {
      for (let y = 0; y < height; y += dotGap) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.save();
  ctx.scale(scale, scale);
  // Translate coordinate origin to bounds minX, minY
  ctx.translate(-bounds.minX, -bounds.minY);

  // Cross-links are independent of the hierarchy and are exported with it.
  ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=1.8;
  for(const link of routeMapLinks(mindMap.links||[],nodePositions)){
    ctx.strokeStyle=link.color;ctx.stroke(new Path2D(link.pathString));
    if(link.label){ctx.font=`12px ${settingsService.preferences.fontFamily}`;ctx.fillStyle=link.color;ctx.textAlign='center';ctx.fillText(link.label,link.labelX,link.labelY-7);}
  }
  ctx.restore();
  // 1. Draw branches
  for (const b of branches) {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const path = new Path2D(b.pathString);
    ctx.stroke(path);

    // If there is an underline path
    if (b.underlinePath) {
      const uPath = new Path2D(b.underlinePath);
      ctx.stroke(uPath);
    }
  }

  // 2. Draw nodes
  for (const [nodeId, pos] of nodePositions.entries()) {
    const node = mindMap.nodes[nodeId];
    if (!node) continue;

    const isRoot = nodeId === mindMap.rootId;
    const effectiveStyle = node.nodeStyle || mindMap.nodeStyle;
    const metrics = measureNode(node,isRoot,mindMap.nodeStyle);

    // Draw background bubble or card
    if (isRoot || effectiveStyle === 'bubble' || effectiveStyle === 'card') {
      const radius = isRoot ? 14 : 10;
      ctx.beginPath();
      roundRect(ctx, pos.x, pos.y, pos.width, pos.height, radius);

      if (isRoot) {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = node.color || '#3B82F6';
        ctx.stroke();
      } else if (effectiveStyle === 'card') {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();
      } else {
        // Bubble style
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = pos.branchColor || '#94a3b8';
        ctx.stroke();
      }
    } else {
      // Underline style baseline bar
      ctx.strokeStyle = pos.branchColor || '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + pos.height - 2);
      ctx.lineTo(pos.x + pos.width, pos.y + pos.height - 2);
      ctx.stroke();
    }

    // Draw attached image if exists
    let contentStartY = pos.y + metrics.paddingY;
    if (node.image?.url && imageElements[node.id]) {
      const img = imageElements[node.id];
      const imgW = metrics.contentWidth;
      const imgH = metrics.imageHeight;
      const imgX = pos.x + (pos.width - imgW) / 2;

      ctx.save();
      ctx.beginPath();
      roundRect(ctx, imgX, contentStartY, imgW, imgH, 6);
      ctx.clip();
      ctx.drawImage(img, imgX, contentStartY, imgW, imgH);
      ctx.restore();

      contentStartY += imgH + metrics.imageGap;
    }

    // Use the same font, wrapping, and padding as the live editor.
    ctx.font = metrics.font;
    ctx.fillStyle = '#1e293b';
    ctx.textBaseline = 'top';
    metrics.lines.forEach((line,index)=>ctx.fillText(line,pos.x+metrics.paddingX,contentStartY+index*metrics.lineHeight));
  }

  ctx.restore();
  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Downloads high-resolution PNG image.
 */
export async function exportAsPng(mindMap: MindMap, settings: ExportSettings): Promise<void> {
  const canvas = await renderMindMapToCanvas(mindMap, settings.scale, settings.background);
  const dataUrl = canvas.toDataURL('image/png', 1.0);

  const cleanTitle = (mindMap.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanTitle}_${settings.scale}x.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports mind map as standalone SVG vector file.
 */
export function exportAsSvg(mindMap: MindMap): void {
  const { nodePositions, branches, bounds } = computeMindMapLayout(mindMap);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}" style="background-color: #ffffff; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">\n`;

  // Branches
  svgContent += '  <g id="branches">\n';
  for (const b of branches) {
    svgContent += `    <path d="${b.pathString}" fill="none" stroke="${b.color}" stroke-width="${b.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />\n`;
    if (b.underlinePath) {
      svgContent += `    <path d="${b.underlinePath}" fill="none" stroke="${b.color}" stroke-width="${b.strokeWidth}" stroke-linecap="round" />\n`;
    }
  }
  svgContent += '  </g>\n';

  const escapeXml=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  for(const link of routeMapLinks(mindMap.links||[],nodePositions)){
    svgContent+=`<path d="${link.pathString}" fill="none" stroke="${link.color}" stroke-width="1.8" stroke-dasharray="7 5"/>`;
    if(link.label)svgContent+=`<text x="${link.labelX}" y="${link.labelY-7}" text-anchor="middle" font-size="12" fill="${link.color}">${escapeXml(link.label)}</text>`;
  }
  // Nodes
  svgContent += '  <g id="nodes">\n';
  for (const [nodeId, pos] of nodePositions.entries()) {
    const node = mindMap.nodes[nodeId];
    if (!node) continue;
    const isRoot = nodeId === mindMap.rootId;
    const effectiveStyle = node.nodeStyle || mindMap.nodeStyle;
    const metrics = measureNode(node,isRoot,mindMap.nodeStyle);

    if (isRoot || effectiveStyle === 'bubble' || effectiveStyle === 'card') {
      const radius = isRoot ? 14 : 8;
      const stroke = isRoot ? (node.color || '#3B82F6') : (pos.branchColor || '#cbd5e1');
      const strokeW = isRoot ? 2.5 : 1.5;
      svgContent += `    <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" rx="${radius}" fill="#ffffff" stroke="${stroke}" stroke-width="${strokeW}" />\n`;
    } else {
      svgContent += `    <line x1="${pos.x}" y1="${pos.y + pos.height - 2}" x2="${pos.x + pos.width}" y2="${pos.y + pos.height - 2}" stroke="${pos.branchColor || '#cbd5e1'}" stroke-width="2" stroke-linecap="round" />\n`;
    }

    const escape = (value:string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    const textX=pos.x+metrics.paddingX;
    const textY=pos.y+metrics.paddingY+metrics.imageHeight+metrics.imageGap+metrics.fontSize;
    if(node.image?.url) svgContent += `<image href="${escape(node.image.url)}" x="${textX}" y="${pos.y+metrics.paddingY}" width="${metrics.contentWidth}" height="${metrics.imageHeight}" preserveAspectRatio="xMidYMid slice" />`;
    svgContent += `<text font-family="${escape(metrics.fontFamily)}" font-size="${metrics.fontSize}" font-weight="${metrics.fontWeight}" font-style="${node.isItalic?'italic':'normal'}" fill="#1e293b">`;
    metrics.lines.forEach((line,index)=>{svgContent+=`<tspan x="${textX}" y="${textY+index*metrics.lineHeight}">${escape(line)}</tspan>`;});
    svgContent+='</text>';
  }
  svgContent += '  </g>\n';
  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanTitle = (mindMap.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');

  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanTitle}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports mind map as high-quality PDF document using jsPDF.
 */
export async function exportAsPdf(mindMap: MindMap, settings: ExportSettings): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const canvas = await renderMindMapToCanvas(mindMap, settings.scale, 'white');
  const imgData = canvas.toDataURL('image/png', 1.0);

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const aspectRatio = canvasWidth / canvasHeight;

  let doc: JsPDF;

  if (settings.pdfFormat === 'fit') {
    // Exact aspect ratio page
    const orientation = aspectRatio >= 1 ? 'landscape' : 'portrait';
    const pageWidth = aspectRatio >= 1 ? 297 : 210; // mm
    const pageHeight = pageWidth / aspectRatio;
    doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  } else {
    // Standard A4
    const orientation = settings.pdfOrientation || (aspectRatio >= 1 ? 'landscape' : 'portrait');
    doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    const margin = 12; // mm

    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2 - (settings.includeTitle ? 14 : 0);

    let renderW = printableWidth;
    let renderH = renderW / aspectRatio;

    if (renderH > printableHeight) {
      renderH = printableHeight;
      renderW = renderH * aspectRatio;
    }

    const startX = margin + (printableWidth - renderW) / 2;
    const startY = margin + (settings.includeTitle ? 14 : 0) + (printableHeight - renderH) / 2;

    if (settings.includeTitle) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(mindMap.title, margin, margin + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Exported from Mindmapper • ${new Date().toLocaleDateString()}`, margin, margin + 11);
    }

    doc.addImage(imgData, 'PNG', startX, startY, renderW, renderH, undefined, 'FAST');
  }

  const cleanTitle = (mindMap.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}.pdf`);
}

