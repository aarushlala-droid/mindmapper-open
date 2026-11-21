import { ModalFrame } from './Dialog';
import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Sparkles, X, Image as ImageIcon, Check } from 'lucide-react';
import { NodeImage } from '../types/mindmap';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (image: NodeImage) => void;
  targetNodeTitle?: string;
}

const SAMPLE_ICONS = [
  { name: 'Lightbulb / Idea', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80' },
  { name: 'Analytics Chart', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop&q=80' },
  { name: 'Target & Strategy', url: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=300&auto=format&fit=crop&q=80' },
  { name: 'Historical Archive', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&auto=format&fit=crop&q=80' },
  { name: 'Team Meeting', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80' },
  { name: 'World Map / Geography', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&auto=format&fit=crop&q=80' },
];

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  targetNodeTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPreviewUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleApply = () => {
    const finalUrl = previewUrl || (activeTab === 'url' ? urlInput.trim() : null);
    if (!finalUrl) return;

    const sizeMap = {
      sm: { width: 140, height: 90 },
      md: { width: 200, height: 130 },
      lg: { width: 280, height: 180 },
    };

    onInsertImage({
      url: finalUrl,
      width: sizeMap[selectedSize].width,
      height: sizeMap[selectedSize].height,
      alt: targetNodeTitle || 'Branch Image',
    });
    onClose();
  };

  return (
    <ModalFrame title="Insert image" onClose={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Insert Image to Branch</h2>
            {targetNodeTitle && (
              <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                Target: &quot;{targetNodeTitle}&quot;
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'samples'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Gallery</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Drag and drop your image here, or
              </p>
              <label className="mt-2 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-xs">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400 mt-2">
                Supports PNG, JPG, WebP, SVG
              </span>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Image Address
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {SAMPLE_ICONS.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewUrl(sample.url)}
                  className={`group relative rounded-lg overflow-hidden border text-left transition-all ${
                    previewUrl === sample.url ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-16 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-1 bg-white">
                    <p className="text-[10px] font-medium text-slate-700 truncate">
                      {sample.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Image Preview & Size Selector */}
          {previewUrl && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-md border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800">Size Preset</span>
                  <div className="flex items-center gap-1 mt-1">
                    {(['sm', 'md', 'lg'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                          selectedSize === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewUrl(null)}
                className="text-xs text-rose-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!previewUrl && (!urlInput.trim() || activeTab !== 'url')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              previewUrl || (activeTab === 'url' && urlInput.trim())
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Insert Image</span>
          </button>
        </div>
      </div>
    </ModalFrame>
  );
};

