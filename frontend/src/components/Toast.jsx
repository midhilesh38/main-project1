import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    addToast({ type: 'error', title, message, duration: 6000 });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Notice') => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Warning') => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  const { type, title, message } = toast;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/95',
      titleColor: 'text-emerald-900',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      border: 'border-rose-200',
      bg: 'bg-rose-50/95',
      titleColor: 'text-rose-900',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      border: 'border-amber-200',
      bg: 'bg-amber-50/95',
      titleColor: 'text-amber-900',
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      border: 'border-sky-200',
      bg: 'bg-sky-50/95',
      titleColor: 'text-sky-900',
    },
  };

  const style = config[type] || config.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-xs transition-all animate-in slide-in-from-bottom-2 ${style.bg} ${style.border}`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        {title && <h5 className={`text-xs font-bold ${style.titleColor}`}>{title}</h5>}
        <p className="text-xs text-slate-700 leading-snug mt-0.5">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-sm -mr-1 -mt-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
