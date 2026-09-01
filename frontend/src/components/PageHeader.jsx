import React from 'react';

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  icon: Icon,
}) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            <span>PEC-RMMS</span>
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-300">/</span>
                <span className={idx === breadcrumbs.length - 1 ? 'text-[#1a365d] font-semibold' : ''}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-[#1a365d]/10 text-[#1a365d] border border-[#1a365d]/20 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
