import { ModalFrame } from './Dialog';
import React from 'react';
import { Layers, X, ArrowRight, Sparkles, BookOpen, Target, Lightbulb, FileText } from 'lucide-react';
import { storageService } from '../services/storage';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMap: (id: string) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectMap,
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      type: 'ww2' as const,
      title: 'WW2 Foreign Policy Analysis',
      desc: 'Complete Miro-replica mindmap with bi-directional branches, Treaty of Versailles analysis, and foreign policy milestones.',
      icon: BookOpen,
      badge: 'From Screenshot',
      nodes: 32,
      color: '#EC4899',
    },
    {
      type: 'product' as const,
      title: 'Product Strategy & Roadmap',
      desc: 'Mindmap structure for feature planning, UX milestones, cloud syncing, and release timelines.',
      icon: Target,
      badge: 'Product & Tech',
      nodes: 14,
      color: '#06B6D4',
    },
    {
      type: 'blank' as const,
      title: 'Blank Mind Map',
      desc: 'Clean starting canvas with central root topic and three starter branches ready for your thoughts.',
      icon: FileText,
      badge: 'Minimal',
      nodes: 4,
      color: '#3B82F6',
    },
  ];

  const handleApply = (type: 'blank' | 'ww2' | 'product') => {
    const created = storageService.createMap(type);
    onSelectMap(created.id);
    onClose();
  };

  return (
    <ModalFrame title="Templates" onClose={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Miro Mindmap Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Select a template to instantly start a new mindmap with curated branches, colors, and layout:
          </p>

          <div className="space-y-3">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.type}
                  onClick={() => handleApply(tpl.type)}
                  className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: tpl.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tpl.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {tpl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">
                        {tpl.desc}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        {tpl.nodes} nodes structured
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalFrame>
  );
};

