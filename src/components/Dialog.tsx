import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Dialog({ title, description, onClose, children, wide = false }: {title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = ref.current!;
    const focusable = () => Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,a[href],[tabindex="0"]')).filter(e => e.getClientRects().length);
    (focusable()[0] || el).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); }
      if (e.key === 'Tab') {
        const list = focusable(); const first = list[0]; const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener('keydown', onKey);
    return () => { el.removeEventListener('keydown', onKey); previous?.focus(); };
  }, []);
  return <div className="dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`dialog-panel ${wide ? 'wide' : ''}`}><div className="dialog-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label={`Close ${title}`}><X size={20}/></button></div>{children}</div></div>;
}

export function ModalFrame({ title, onClose, children }: {title:string;onClose:()=>void;children:ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const el = ref.current!;
    const controls = () => Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,a[href],[tabindex="0"]')).filter(e=>e.getClientRects().length);
    (controls()[0] || el).focus();
    const key = (e:KeyboardEvent) => {
      if (e.key==='Escape') { e.stopPropagation();closeRef.current(); }
      if (e.key==='Tab') { const list=controls();const first=list[0];const last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();} }
    };
    el.addEventListener('keydown',key);return ()=>{el.removeEventListener('keydown',key);prior?.focus();};
  },[]);
  return <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="dialog-backdrop legacy-modal" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>{children}</div>;
}
