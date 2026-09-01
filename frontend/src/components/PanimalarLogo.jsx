import React from 'react';

export function PanimalarLogo({ className = 'w-12 h-12', showText = false, textClassName = 'text-white' }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center rounded-lg bg-white p-1 shadow-md border border-amber-400/40 overflow-hidden ${className}`}>
        <img
          src="/assets/panimalar-logo.png"
          alt="Panimalar Engineering College logo"
          className="w-full h-full object-contain rounded"
          draggable={false}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight leading-none text-base uppercase ${textClassName}`}>
              PANIMALAR
            </span>
            <span className="text-[10px] font-semibold uppercase px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 leading-none">
              Autonomous
            </span>
          </div>
          <span className="text-[11px] font-medium tracking-wide text-slate-300 uppercase leading-snug">
            Engineering College
          </span>
          <span className="text-[9px] font-mono text-slate-400 tracking-wider">
            Repair & Maintenance System
          </span>
        </div>
      )}
    </div>
  );
}

export function AnniversaryBadge({ className = '', imgClassName = 'h-12 w-auto' }) {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/assets/panimalar-badge.jpeg"
        alt="Panimalar Engineering College badge"
        className={`${imgClassName} object-contain drop-shadow-sm`}
        draggable={false}
      />
    </div>
  );
}
