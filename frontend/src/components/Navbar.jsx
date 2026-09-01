import React from 'react';
import {
  Menu,
  User,
  LogOut,
  Building,
  Shield,
} from 'lucide-react';
import { PanimalarLogo, AnniversaryBadge } from './PanimalarLogo';

export function Navbar({
  onOpenMobileSidebar,
  user,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Hamburger & Branding */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <PanimalarLogo className="w-9 h-9 shrink-0 hidden sm:flex" />

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#1a365d] text-amber-300 text-xs font-bold font-mono tracking-wider border border-[#122846]">
              PEC-RMMS
            </span>

            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                Repair & Maintenance Management System
              </h2>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                Panimalar Engineering College (Autonomous)
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Anniversary Badge & Profile / Role Selector */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <AnniversaryBadge imgClassName="h-11 w-auto" />
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#1a365d] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              <User className="w-4 h-4 text-amber-300" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.fullName || 'Institutional User'}
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase">
                {user?.department?.name || user?.role?.replace(/_/g, ' ') || 'Staff Member'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
