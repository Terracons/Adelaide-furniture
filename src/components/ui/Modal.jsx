'use client';

import { X } from 'lucide-react';
import { useScrollLock } from '@/lib/hooks';

export default function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  useScrollLock(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} animate-fade-up overflow-hidden rounded-2xl bg-white shadow-lift`}>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 bg-cream/60 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
