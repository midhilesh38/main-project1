import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed select-none rounded-md';

  const variants = {
    primary: 'bg-[#1a365d] hover:bg-[#152e50] active:bg-[#0f2439] text-white border border-transparent shadow-xs focus-visible:ring-[#1a365d] disabled:bg-slate-300 disabled:text-slate-500 disabled:border-transparent',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 shadow-2xs focus-visible:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400',
    outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs focus-visible:ring-[#1a365d] disabled:bg-white disabled:text-slate-300 disabled:border-slate-200',
    danger: 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white border border-transparent shadow-xs focus-visible:ring-rose-600 disabled:bg-rose-200 disabled:text-rose-400',
    success: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-transparent shadow-xs focus-visible:ring-emerald-600 disabled:bg-emerald-200 disabled:text-emerald-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 focus-visible:ring-slate-400 disabled:text-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2 min-h-[38px]',
    lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
          {children}
        </>
      )}
    </button>
  );
}
