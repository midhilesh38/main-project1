import React from 'react';
import { Inbox, FileQuestion, SearchX, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No Records Found',
  description = 'There are no active entries matching your current filters.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4, type = 'table' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded-full w-20"></div>
            </div>
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-5/6"></div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between">
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded-full w-24"></div>
            <div className="h-8 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
