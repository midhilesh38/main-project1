import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200/90 shadow-xs overflow-hidden ${
        hover ? 'transition-shadow hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, badge, action, icon: Icon, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-md bg-slate-100 text-[#1a365d] border border-slate-200 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 text-sm text-slate-600 ${className}`}>
      {children}
    </div>
  );
}
