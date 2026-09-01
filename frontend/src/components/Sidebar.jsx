import React from 'react';
import {
  FilePlus,
  ClipboardList,
  CheckSquare,
  UserPlus,
  Briefcase,
  LogOut,
  X,
  Building2,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
  Activity,
} from 'lucide-react';
import { PanimalarLogo } from './PanimalarLogo';

export const NAV_ITEMS = [
  {
    id: 'raise-complaint',
    label: 'Raise Complaint',
    subtitle: 'Register maintenance issue',
    icon: FilePlus,
    allowedRoles: ['SUPERVISOR', 'HOD', 'ELECTRICIAN_HEAD', 'ELECTRICIAN_INCHARGE', 'ELECTRICIAN', 'MANAGER', 'DEAN_IQAC'],
  },
  {
    id: 'my-complaints',
    label: 'My Complaints',
    subtitle: 'Track your submitted tickets',
    icon: ClipboardList,
    allowedRoles: ['SUPERVISOR', 'HOD', 'ELECTRICIAN_HEAD', 'ELECTRICIAN_INCHARGE', 'ELECTRICIAN', 'MANAGER', 'DEAN_IQAC'],
    badge: 'Tracking',
  },
  {
    id: 'hod-approvals',
    label: 'HOD Approvals',
    subtitle: 'Department verification',
    icon: CheckSquare,
    allowedRoles: ['HOD', 'MANAGER', 'DEAN_IQAC'],
    badge: 'Approvals',
  },
  {
    id: 'assign-electrician',
    label: 'Assign Electrician',
    subtitle: 'Maintenance allocation',
    icon: UserPlus,
    allowedRoles: ['ELECTRICIAN_HEAD', 'ELECTRICIAN_INCHARGE', 'MANAGER', 'DEAN_IQAC'],
    badge: 'Allocation',
  },
  {
    id: 'allocated-tracking',
    label: 'Allocated Work Tracking',
    subtitle: 'Campus execution overview',
    icon: Activity,
    allowedRoles: ['MANAGER', 'DEAN_IQAC', 'ELECTRICIAN_HEAD', 'ELECTRICIAN_INCHARGE'],
    badge: 'Live',
  },
  {
    id: 'my-jobs',
    label: 'My Jobs / Work Orders',
    subtitle: 'Technician task execution',
    icon: Briefcase,
    allowedRoles: ['ELECTRICIAN', 'ELECTRICIAN_HEAD', 'ELECTRICIAN_INCHARGE'],
    badge: 'ATR',
  },
];

export function Sidebar({
  activePage,
  onNavigate,
  user,
  onLogout,
  mobileOpen = false,
  onMobileClose,
}) {
  const userRole = user?.role || 'SUPERVISOR';

  const NavContent = (
    <div className="flex flex-col h-full bg-[#0b1e33] text-slate-200 border-r border-[#16365a] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#16365a] bg-[#09192b]">
        <div className="flex items-center justify-between">
          <PanimalarLogo className="w-10 h-10 shrink-0" showText={true} />
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Institutional System Tag */}
      <div className="px-5 py-2.5 bg-[#0f2a47] border-b border-[#16365a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-300">
            PEC-RMMS v2.4 (LIVE)
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
          Campus Portal
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Main Workflows
        </div>

        {NAV_ITEMS.filter((item) => item.allowedRoles.includes(userRole)).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (mobileOpen && onMobileClose) onMobileClose();
              }}
              className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-lg text-left transition-all group relative ${
                isActive
                  ? 'bg-[#1a3d66] text-white font-semibold shadow-inner border-l-4 border-amber-400'
                  : 'text-slate-300 hover:bg-[#122c4a] hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 mt-0.5 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-tight leading-snug">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1 block">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}

        {/* Section Divider */}
        <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          System Overview
        </div>

        <div className="px-3.5 py-3 rounded-lg bg-[#091b2e] border border-[#143254] space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Maintenance Cell</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Panimalar Engineering College, Bangalore Trunk Road, Varadharajapuram, Chennai.
          </p>
          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#16365a] flex justify-between">
            <span>Help Desk: #2401</span>
            <span>Ext: 302</span>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[#16365a] bg-[#081726]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#1a365d] border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs uppercase shrink-0">
            {user?.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Institutional User'}</p>
            <p className="text-[10px] font-mono text-amber-300/90 truncate">
              {user?.role?.replace(/_/g, ' ') || 'STAFF'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#112942] hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 z-30 shadow-xl">
        {NavContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0b1e33] animate-in slide-in-from-left duration-200">
            {NavContent}
          </div>
        </div>
      )}
    </>
  );
}
