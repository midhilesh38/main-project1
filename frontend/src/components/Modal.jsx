import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  icon: Icon,
  zIndex = 'z-50',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndex} overflow-y-auto`} role="region" aria-label={title || 'Modal Dialog'}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 text-center sm:p-6 pointer-events-none">
        <div
          className={`pointer-events-auto w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 animate-in zoom-in-95 duration-150 relative z-20`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-[#1a365d]/10 text-[#1a365d] border border-[#1a365d]/20 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 id="modal-headline" className="text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-hidden"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto space-y-4 text-slate-700">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
