import React from 'react';
import { AlertTriangle, Info, CheckCircle2, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary', // 'primary' | 'danger' | 'success'
  isLoading = false,
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  zIndex = 'z-[70]',
}) {
  const iconMap = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    info: <Info className="w-6 h-6 text-sky-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  };

  const bgMap = {
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-rose-50 border-rose-200',
    info: 'bg-sky-50 border-sky-200',
    success: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      zIndex={zIndex}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-lg border shrink-0 ${bgMap[type] || bgMap.warning}`}>
          {iconMap[type] || iconMap.warning}
        </div>
        <div className="space-y-1.5 pt-0.5">
          <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </Modal>
  );
}
