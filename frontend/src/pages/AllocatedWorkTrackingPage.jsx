import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  Eye,
  Building,
  Clock,
  Wrench,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  ArrowUpRight,
  UserCheck,
  CheckSquare,
  Package,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Select } from '../components/Input';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { ticketService } from '../services/ticketService';
import { useToast } from '../components/Toast';

export function AllocatedWorkTrackingPage({ token, user }) {
  const { showSuccess, showError } = useToast();

  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [technicianFilter, setTechnicianFilter] = useState('ALL');
  const [buildingFilter, setBuildingFilter] = useState('ALL');

  // Selected work order for inspection modal
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const fetchAllocatedTickets = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await ticketService.getAllocatedTickets(token);
      const items = data.assignments || data.allocatedTickets || [];
      setAllocations(items);
      setLastSyncedAt(new Date());
      if (isManualRefresh) {
        showSuccess('Allocated work orders refreshed successfully');
      }
    } catch (err) {
      showError(err.message || 'Failed to retrieve allocated work orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError, showSuccess]);

  useEffect(() => {
    fetchAllocatedTickets();
  }, [fetchAllocatedTickets]);

  // Unique lists for dropdown filters
  const technicianOptions = useMemo(() => {
    const map = new Map();
    allocations.forEach((a) => {
      if (a.technician?.id) {
        map.set(a.technician.id, a.technician.fullName || a.technician.username);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [allocations]);

  const buildingOptions = useMemo(() => {
    const set = new Set();
    allocations.forEach((a) => {
      const b = a.complaint?.locationBuilding;
      if (b) set.add(b);
    });
    return Array.from(set).map((b) => ({ value: b, label: b }));
  }, [allocations]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = allocations.length;
    const allocatedCount = allocations.filter((a) => a.status === 'ASSIGNED').length;
    const inProgressCount = allocations.filter((a) => a.status === 'IN_PROGRESS').length;
    const completedCount = allocations.filter((a) => {
      const isAtr = a.status === 'COMPLETED' || a.status === 'WORK_COMPLETED' || (a.complaint?.atrs && a.complaint.atrs.length > 0);
      const isClosed = a.complaint?.status === 'CLOSED' || a.complaint?.status === 'RESOLVED';
      return isAtr && !isClosed;
    }).length;
    const resolvedCount = allocations.filter(
      (a) => a.complaint?.status === 'CLOSED' || a.complaint?.status === 'RESOLVED'
    ).length;

    return {
      total,
      allocatedCount,
      inProgressCount,
      completedCount,
      resolvedCount,
    };
  }, [allocations]);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const c = item.complaint || {};
      const tech = item.technician || {};
      const rep = c.reporter || {};
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        item.id?.toLowerCase().includes(q) ||
        c.ticketNumber?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.locationBuilding?.toLowerCase().includes(q) ||
        c.roomAreaNumber?.toLowerCase().includes(q) ||
        tech.fullName?.toLowerCase().includes(q) ||
        tech.employeeId?.toLowerCase().includes(q) ||
        rep.fullName?.toLowerCase().includes(q);

      // Status filter matching
      let matchesStatus = true;
      if (statusFilter === 'ASSIGNED') {
        matchesStatus = item.status === 'ASSIGNED' && c.status !== 'CLOSED' && c.status !== 'RESOLVED';
      } else if (statusFilter === 'IN_PROGRESS') {
        matchesStatus = item.status === 'IN_PROGRESS' && c.status !== 'CLOSED' && c.status !== 'RESOLVED';
      } else if (statusFilter === 'COMPLETED') {
        matchesStatus =
          (item.status === 'COMPLETED' || item.status === 'WORK_COMPLETED' || (c.atrs && c.atrs.length > 0)) &&
          c.status !== 'CLOSED' &&
          c.status !== 'RESOLVED';
      } else if (statusFilter === 'RESOLVED') {
        matchesStatus = c.status === 'CLOSED' || c.status === 'RESOLVED';
      }

      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchesTech = technicianFilter === 'ALL' || tech.id === technicianFilter;
      const matchesBuilding = buildingFilter === 'ALL' || c.locationBuilding === buildingFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesTech && matchesBuilding;
    });
  }, [allocations, searchQuery, statusFilter, priorityFilter, technicianFilter, buildingFilter]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getSlaStatus = (slaDueAt) => {
    if (!slaDueAt) return null;
    const due = new Date(slaDueAt).getTime();
    const now = Date.now();
    const diffHours = Math.round((due - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return {
        label: `Overdue by ${Math.abs(Math.round(diffHours / 24))}d`,
        className: 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
      };
    }
    if (diffHours <= 24) {
      return {
        label: `Due in ${diffHours}h`,
        className: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
      };
    }
    const days = Math.ceil(diffHours / 24);
    return {
      label: `${days} days left`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Allocated Work Tracking & Campus Overview"
        subtitle="Real-time execution dashboard tracking all allocated campus repair tickets, assigned electricians, work progress, and ATR milestones."
        breadcrumbs={['Campus Management', 'Allocated Work Tracking']}
        actions={
          <div className="flex items-center gap-3">
            {lastSyncedAt && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live: {lastSyncedAt.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              isLoading={isLoading}
              onClick={() => fetchAllocatedTickets(true)}
            >
              Refresh Status
            </Button>
          </div>
        }
      />

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Dispatched</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all campus zones</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Under Active Repair</p>
            <p className="text-2xl font-black text-purple-900 mt-1">{metrics.inProgressCount}</p>
            <p className="text-[11px] text-purple-600 mt-0.5">Technicians currently on-site</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">ATR Filed / Pending Signoff</p>
            <p className="text-2xl font-black text-teal-900 mt-1">{metrics.completedCount}</p>
            <p className="text-[11px] text-teal-600 mt-0.5">Repair finished by electrician</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified & Closed</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{metrics.resolvedCount}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Fully resolved & approved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Filter & Work Orders Table */}
      <Card>
        <CardHeader
          title="Allocated Campus Work Orders"
          subtitle={`Showing ${filteredAllocations.length} of ${allocations.length} total allocated repair jobs`}
          action={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                Live Tracking Active
              </span>
            </div>
          }
        />
        <CardBody className="p-0">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Ticket #, Title, Location, Technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">Allocated (Waiting to Start)</option>
                  <option value="IN_PROGRESS">In Progress (Under Repair)</option>
                  <option value="COMPLETED">ATR Submitted / Completed</option>
                  <option value="RESOLVED">Verified & Closed</option>
                </select>
              </div>

              {/* Technician Filter */}
              <div>
                <select
                  value={technicianFilter}
                  onChange={(e) => setTechnicianFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Technicians</option>
                  {technicianOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || technicianFilter !== 'ALL' || buildingFilter !== 'ALL') && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 flex-wrap">
                <span className="font-semibold text-slate-700">Active Filters:</span>
                {searchQuery && (
                  <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">×</button>
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('ALL')} className="text-slate-400 hover:text-slate-700">×</button>
                  </span>
                )}
                {technicianFilter !== 'ALL' && (
                  <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    Technician
                    <button onClick={() => setTechnicianFilter('ALL')} className="text-slate-400 hover:text-slate-700">×</button>
                  </span>
                )}
                {priorityFilter !== 'ALL' && (
                  <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    Priority: {priorityFilter}
                    <button onClick={() => setPriorityFilter('ALL')} className="text-slate-400 hover:text-slate-700">×</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                    setTechnicianFilter('ALL');
                    setBuildingFilter('ALL');
                  }}
                  className="text-blue-600 hover:underline text-[11px] font-semibold ml-2"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>

          {/* Table / List View */}
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton count={4} />
            </div>
          ) : filteredAllocations.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No Allocated Work Orders Found"
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No allocated work orders match the selected filters. Try clearing your filters.'
                  : 'There are currently no allocated work orders in the campus queue. Allocate approved tickets from the Assign Electrician tab.'
              }
              actionLabel={searchQuery || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
              onAction={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setTechnicianFilter('ALL');
                setBuildingFilter('ALL');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Ticket Details</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Assigned Electrician</th>
                    <th className="py-3.5 px-4">Execution Status</th>
                    <th className="py-3.5 px-4">Timeline / SLA</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredAllocations.map((item) => {
                    const complaint = item.complaint || {};
                    const tech = item.technician || {};
                    const sla = getSlaStatus(complaint.slaDueAt);

                    // Compute clean execution badge state
                    let executionStatus = item.status;
                    let executionLabel = 'Allocated';
                    let executionBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';

                    if (complaint.status === 'CLOSED' || complaint.status === 'RESOLVED') {
                      executionStatus = 'RESOLVED';
                      executionLabel = 'Closed & Verified';
                      executionBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    } else if (item.status === 'COMPLETED' || item.status === 'WORK_COMPLETED' || (complaint.atrs && complaint.atrs.length > 0)) {
                      executionStatus = 'COMPLETED';
                      executionLabel = 'ATR Submitted (Done)';
                      executionBadgeClass = 'bg-teal-50 text-teal-800 border-teal-200';
                    } else if (item.status === 'IN_PROGRESS') {
                      executionStatus = 'IN_PROGRESS';
                      executionLabel = 'In Progress (Active)';
                      executionBadgeClass = 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Ticket Details */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {complaint.ticketNumber || `CMP-${item.id?.substring(0, 8)}`}
                            </span>
                            <PriorityBadge priority={complaint.priority} />
                          </div>
                          <p className="font-bold text-slate-900 line-clamp-1 text-sm">{complaint.title || 'Maintenance Request'}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <CategoryBadge category={complaint.category} />
                            <span>Req: {complaint.reporter?.fullName || 'Campus Staff'}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-start gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-900">{complaint.locationBuilding || 'Main Campus'}</p>
                              <p className="text-[11px] text-slate-500">
                                {complaint.roomAreaNumber ? `Room/Lab: ${complaint.roomAreaNumber}` : 'General Area'}
                                {complaint.floorArea ? ` • ${complaint.floorArea}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Electrician */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shrink-0">
                              {tech.fullName ? tech.fullName.charAt(0).toUpperCase() : 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{tech.fullName || tech.username || 'Assigned Technician'}</p>
                              <p className="text-[11px] font-mono text-slate-500">ID: {tech.employeeId || 'EL-001'}</p>
                              {tech.phone && (
                                <p className="text-[10px] text-slate-400">{tech.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Execution Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${executionBadgeClass}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {executionLabel}
                            </span>
                            {item.startedAt && item.status === 'IN_PROGRESS' && (
                              <p className="text-[10px] text-purple-700 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Work started {formatDateTime(item.startedAt)}
                              </p>
                            )}
                            {complaint.atrs && complaint.atrs.length > 0 && (
                              <p className="text-[10px] text-teal-700 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                ATR Filed ({complaint.atrs.length})
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Timeline / SLA */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Allocated: {formatDateTime(item.assignedAt)}</span>
                            </div>
                            {sla && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${sla.className}`}
                              >
                                SLA: {sla.label}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedAllocation(item)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detailed Work Order Inspection Modal */}
      {selectedAllocation && (
        <Modal
          isOpen={!!selectedAllocation}
          onClose={() => setSelectedAllocation(null)}
          title={`Work Order Audit: #${selectedAllocation.complaint?.ticketNumber || selectedAllocation.id}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Real-time Lifecycle Tracker */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Live Resolution Lifecycle
              </h4>
              <WorkflowTracker
                currentStatus={selectedAllocation.complaint?.status || selectedAllocation.status}
              />
            </div>

            {/* 2-Column Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complaint Defect Scope */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Defect Specification
                  </span>
                  <PriorityBadge priority={selectedAllocation.complaint?.priority} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedAllocation.complaint?.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedAllocation.complaint?.description || 'No defect scope notes provided.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAllocation.complaint?.category || 'ELECTRICAL'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Premises Location</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAllocation.complaint?.locationBuilding} • {selectedAllocation.complaint?.roomAreaNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporter</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAllocation.complaint?.reporter?.fullName || 'Staff Member'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target SLA</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateTime(selectedAllocation.complaint?.slaDueAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Allocation Details */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">
                    Assigned Field Electrician
                  </span>
                  <StatusBadge status={selectedAllocation.status} />
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {selectedAllocation.technician?.fullName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedAllocation.technician?.fullName || 'Assigned Electrician'}
                    </p>
                    <p className="text-xs font-mono text-indigo-700 font-medium">
                      Emp ID: {selectedAllocation.technician?.employeeId || 'EL-001'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedAllocation.technician?.email || 'technician@panimalar.ac.in'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dispatched At:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatDateTime(selectedAllocation.assignedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dispatched By:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAllocation.assignedBy?.fullName || 'Central Maintenance Cell'}
                    </span>
                  </div>
                  {selectedAllocation.remarks && (
                    <div className="pt-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Allocation Instructions:</span>
                      <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100 mt-0.5">
                        "{selectedAllocation.remarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Taken Report (ATR) Section if submitted */}
            {selectedAllocation.complaint?.atrs && selectedAllocation.complaint.atrs.length > 0 && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-teal-700" />
                  Filed Action Taken Report (ATR)
                </div>
                {selectedAllocation.complaint.atrs.map((atr, idx) => (
                  <div key={atr.id || idx} className="bg-white p-3.5 rounded-lg border border-teal-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        Submitted by: {atr.submittedBy?.fullName || selectedAllocation.technician?.fullName || 'Electrician'}
                      </span>
                      <span className="font-mono">{formatDateTime(atr.submittedAt || atr.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">
                      <strong className="text-slate-900 block mb-0.5">Corrective Action Taken:</strong>
                      {atr.actionTaken || atr.details || 'Repairs performed and operational checks confirmed.'}
                    </p>
                    {atr.partsUsed && (
                      <p className="text-xs text-slate-700 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Materials / Parts Consumed:</strong> {atr.partsUsed}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" onClick={() => setSelectedAllocation(null)}>
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
