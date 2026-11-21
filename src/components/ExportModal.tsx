import { ModalFrame } from './Dialog';
import React, { useState } from 'react';
import { Download, FileImage, FileText, Code2, Check, X, Loader2 } from 'lucide-react';
import { MindMap, ExportSettings } from '../types/mindmap';
import { exportAsPng, exportAsPdf, exportAsSvg } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindMap: MindMap;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mindMap,
}) => {
  const [format, setFormat] = useState<'png' | 'pdf' | 'svg' | 'json'>('png');
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [background, setBackground] = useState<'white' | 'transparent' | 'grid'>('white');
  const [pdfFormat, setPdfFormat] = useState<'fit' | 'a4'>('fit');
  const [pdfOrientation, setPdfOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [includeTitle, setIncludeTitle] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const settings: ExportSettings = {
        format,
        scale,
        background,
        includeTitle,
        pdfOrientation,
        pdfFormat,
      };

      if (format === 'png') {
        await exportAsPng(mindMap, settings);
      } else if (format === 'pdf') {
        await exportAsPdf(mindMap, settings);
      } else if (format === 'svg') {
        exportAsSvg(mindMap);
      } else if (format === 'json') {
        const jsonStr = JSON.stringify(mindMap, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      onClose();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModalFrame title="Export map" onClose={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Export Mind Map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Format selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  format === 'png'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <FileImage className="w-5 h-5" />
                <span className="text-xs">PNG</span>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">PDF</span>
              </button>

              <button
                onClick={() => setFormat('svg')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  format === 'svg'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Code2 className="w-5 h-5" />
                <span className="text-xs">SVG</span>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs">JSON</span>
              </button>
            </div>
          </div>

          {/* Settings for PNG */}
          {format === 'png' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1 as const, label: '1x Standard', desc: 'Fast, Web' },
                    { val: 2 as const, label: '2x Retina', desc: 'Sharp, 2K' },
                    { val: 4 as const, label: '4x Ultra HD', desc: '300 DPI Print' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setScale(item.val)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        scale === item.val
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Background Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'white' as const, label: 'Pure White' },
                    { val: 'transparent' as const, label: 'Transparent' },
                    { val: 'grid' as const, label: 'Grid Paper' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setBackground(item.val)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center transition-all ${
                        background === item.val
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings for PDF */}
          {format === 'pdf' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Page Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPdfFormat('fit')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      pdfFormat === 'fit'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">Single Fit Page</div>
                    <div className="text-[10px] text-slate-500">Auto-fit entire map perfectly</div>
                  </button>

                  <button
                    onClick={() => setPdfFormat('a4')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      pdfFormat === 'a4'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">Standard A4 Document</div>
                    <div className="text-[10px] text-slate-500">Ready for office printing</div>
                  </button>
                </div>
              </div>

              {pdfFormat === 'a4' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPdfOrientation('landscape')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                        pdfOrientation === 'landscape'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Landscape
                    </button>
                    <button
                      onClick={() => setPdfOrientation('portrait')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                        pdfOrientation === 'portrait'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Portrait
                    </button>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeTitle}
                  onChange={(e) => setIncludeTitle(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include title & date header in document</span>
              </label>
            </div>
          )}

          {/* Info banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium truncate mr-2">
              {mindMap.title}
            </span>
            <span className="shrink-0 text-slate-400 text-[11px]">
              {Object.keys(mindMap.nodes).length} nodes
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
};

