import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const normalized = String(status || '').toUpperCase();

  const config = {
    // Standard Workflow Statuses
    PENDING: { label: 'Pending HOD Approval', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    COMPLAINT_REGISTERED: { label: 'Registered', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    APPROVED: { label: 'HOD Approved', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    ASSIGNED: { label: 'Electrician Assigned', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    WORK_COMPLETED: { label: 'Work Completed', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    COMPLETED: { label: 'Completed (ATR Submitted)', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    VERIFIED: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  };

  const current = config[normalized] || {
    label: normalized.replace(/_/g, ' ') || 'Unknown',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.text.replace('text-', 'bg-')}`}></span>
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const normalized = String(priority || '').toUpperCase();

  const config = {
    LOW: { label: 'Low Priority', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
    MEDIUM: { label: 'Medium Priority', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
    HIGH: { label: 'High Priority', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    CRITICAL: { label: 'Critical / Emergency', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-600' },
  };

  const current = config[normalized] || config.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </span>
  );
}

export function CategoryBadge({ category, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 ${className}`}
    >
      {category || 'GENERAL'}
    </span>
  );
}

export function Badge({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const selected = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${selected} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;

