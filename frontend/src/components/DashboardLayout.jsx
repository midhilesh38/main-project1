import React, { useState, useEffect } from 'react';
import { Sidebar, NAV_ITEMS } from './Sidebar';
import { Navbar } from './Navbar';
import { RaiseComplaintPage } from '../pages/RaiseComplaintPage';
import { MyComplaintsPage } from '../pages/MyComplaintsPage';
import { HodApprovalsPage } from '../pages/HodApprovalsPage';
import { AssignElectricianPage } from '../pages/AssignElectricianPage';
import { AllocatedWorkTrackingPage } from '../pages/AllocatedWorkTrackingPage';
import { MyJobsPage } from '../pages/MyJobsPage';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
  const { user, token, logout } = useAuth();
  const userRole = user?.role || 'SUPERVISOR';
  const permittedItems = NAV_ITEMS.filter((item) => item.allowedRoles.includes(userRole));
  const [activePage, setActivePage] = useState('raise-complaint');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (permittedItems.length > 0 && !permittedItems.some((item) => item.id === activePage)) {
      setActivePage(permittedItems[0].id);
    }
  }, [userRole]);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex">
      {/* Fixed Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          user={user}
          onLogout={logout}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'raise-complaint' && (
            <RaiseComplaintPage
              token={token}
              user={user}
              onNavigateToMyComplaints={() => handleNavigate('my-complaints')}
            />
          )}

          {activePage === 'my-complaints' && (
            <MyComplaintsPage
              token={token}
              user={user}
              onNavigateToRaiseComplaint={() => handleNavigate('raise-complaint')}
            />
          )}

          {activePage === 'hod-approvals' && (
            <HodApprovalsPage token={token} user={user} />
          )}

          {activePage === 'assign-electrician' && (
            <AssignElectricianPage token={token} user={user} />
          )}

          {activePage === 'allocated-tracking' && (
            <AllocatedWorkTrackingPage token={token} user={user} />
          )}

          {activePage === 'my-jobs' && (
            <MyJobsPage token={token} user={user} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            Panimalar Engineering College (Autonomous) • Central Maintenance Cell
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Repair & Maintenance Management System (PEC-RMMS) • Real-Time Resolution Workflow
          </p>
        </footer>
      </div>
    </div>
  );
}
