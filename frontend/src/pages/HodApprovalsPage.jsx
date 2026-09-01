import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  AlertCircle,
  FileText,
  ShieldAlert,
  SlidersHorizontal,
  Wrench,
  History,
  Activity,
  CheckCheck,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, PriorityBadge, CategoryBadge, Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { approvalService } from '../services/approvalService';
import { useToast } from '../components/Toast';

export function HodApprovalsPage({ token, user }) {
  const { showSuccess, showError } = useToast();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history' | 'atr'

  // Data states
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [historyComplaints, setHistoryComplaints] = useState([]);
  const [atrComplaints, setAtrComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal inspection state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [inspectionTab, setInspectionTab] = useState('overview'); // 'overview' | 'timeline' | 'atr'
  const [hodRemarks, setHodRemarks] = useState('');

  // Confirmation dialogs
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject' | 'atr_approve' | 'atr_reject'
    complaint: null,
    isLoading: false,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingRes, historyRes, atrRes] = await Promise.allSettled([
        approvalService.getPendingApprovals(token),
        approvalService.getApprovalHistory(token),
        approvalService.getPendingActionReports(token),
      ]);

      if (pendingRes.status === 'fulfilled') {
        setPendingComplaints(pendingRes.value.complaints || pendingRes.value.data || []);
      }
      if (historyRes.status === 'fulfilled') {
        setHistoryComplaints(historyRes.value.complaints || historyRes.value.data || []);
      }
      if (atrRes.status === 'fulfilled') {
        setAtrComplaints(atrRes.value.complaints || atrRes.value.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to retrieve approval data');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics
  const metrics = useMemo(() => {
    const pendingCount = pendingComplaints.length;
    const atrCount = atrComplaints.length;
    const activeTrackingCount = historyComplaints.filter(
      (c) => c.status !== 'CLOSED' && c.hodApprovalStatus === 'APPROVED'
    ).length;
    const closedCount = historyComplaints.filter((c) => c.status === 'CLOSED').length;

    return {
      pendingCount,
      activeTrackingCount,
      atrCount,
      closedCount,
      totalHistory: historyComplaints.length,
    };
  }, [pendingComplaints, historyComplaints, atrComplaints]);

  // Filter current tab's dataset
  const currentDataset = useMemo(() => {
    if (activeTab === 'pending') return pendingComplaints;
    if (activeTab === 'atr') return atrComplaints;
    return historyComplaints;
  }, [activeTab, pendingComplaints, historyComplaints, atrComplaints]);

  const filteredComplaints = useMemo(() => {
    return currentDataset.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.ticketNumber?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.locationBuilding?.toLowerCase().includes(q) ||
        c.roomAreaNumber?.toLowerCase().includes(q) ||
        c.reporter?.fullName?.toLowerCase().includes(q) ||
        c.assignments?.[0]?.technician?.fullName?.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

      let matchesStatus = true;
      if (activeTab === 'history' && statusFilter !== 'ALL') {
        if (statusFilter === 'ALLOCATED') {
          matchesStatus = c.status === 'REPAIR_ASSIGNED' || c.status === 'ASSIGNED';
        } else if (statusFilter === 'IN_PROGRESS') {
          matchesStatus = c.status === 'IN_PROGRESS' || c.assignments?.some((a) => a.status === 'IN_PROGRESS');
        } else if (statusFilter === 'ACTION_TAKEN') {
          matchesStatus = c.status === 'ACTION_TAKEN';
        } else if (statusFilter === 'VERIFICATION') {
          matchesStatus = c.status === 'VERIFICATION' || c.status === 'VERIFIED';
        } else if (statusFilter === 'CLOSED') {
          matchesStatus = c.status === 'CLOSED';
        } else if (statusFilter === 'REJECTED') {
          matchesStatus = c.hodApprovalStatus === 'REJECTED';
        } else {
          matchesStatus = c.status === statusFilter;
        }
      }

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
  }, [currentDataset, searchQuery, priorityFilter, categoryFilter, statusFilter, activeTab]);

  const handleOpenApproveDialog = (complaint) => {
    setDialogState({
      isOpen: true,
      type: 'approve',
      complaint,
      isLoading: false,
    });
  };

  const handleOpenRejectDialog = (complaint) => {
    setDialogState({
      isOpen: true,
      type: 'reject',
      complaint,
      isLoading: false,
    });
  };

  const handleOpenAtrApproveDialog = (complaint) => {
    setDialogState({
      isOpen: true,
      type: 'atr_approve',
      complaint,
      isLoading: false,
    });
  };

  const handleOpenAtrRejectDialog = (complaint) => {
    setDialogState({
      isOpen: true,
      type: 'atr_reject',
      complaint,
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    const { type, complaint } = dialogState;
    if (!complaint) return;

    setDialogState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (type === 'approve') {
        await approvalService.approveComplaint(token, complaint.id, hodRemarks || 'Approved by Department HOD');
        showSuccess(`Complaint #${complaint.ticketNumber || complaint.id} approved for maintenance allocation.`);
      } else if (type === 'reject') {
        const reason = hodRemarks?.trim() || 'Rejected during departmental HOD review.';
        await approvalService.rejectComplaint(token, complaint.id, reason);
        showSuccess(`Complaint #${complaint.ticketNumber || complaint.id} has been rejected.`);
      } else if (type === 'atr_approve') {
        await approvalService.reviewActionReport(token, complaint.id, 'APPROVED', hodRemarks || 'ATR approved and endorsed by HOD');
        showSuccess(`Action Taken Report for #${complaint.ticketNumber || complaint.id} endorsed successfully. Ticket is now closed.`);
      } else if (type === 'atr_reject') {
        const reason = hodRemarks?.trim() || 'Action taken report requires rework.';
        await approvalService.reviewActionReport(token, complaint.id, 'REJECTED', null, reason);
        showSuccess(`Action Taken Report for #${complaint.ticketNumber || complaint.id} returned for technician rework.`);
      }

      setDialogState({ isOpen: false, type: 'approve', complaint: null, isLoading: false });
      setSelectedComplaint(null);
      setHodRemarks('');
      fetchData();
    } catch (err) {
      showError(err.message || `Failed to perform action on ticket`);
      setDialogState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department HOD Clearance & Ticket Tracking"
        description="Endorse incoming complaints and monitor live repair lifecycle progression for your department."
        breadcrumbs={['HOD Portal', activeTab === 'pending' ? 'Pending Queue' : activeTab === 'history' ? 'Approved History' : 'ATR Signoff']}
        icon={CheckSquare}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            isLoading={isLoading}
          >
            Refresh Data
          </Button>
        }
      />

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Endorsement
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.pendingCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting HOD approval</p>
        </div>

        <div
          onClick={() => setActiveTab('history')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'history'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Resolution
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.activeTrackingCount}</p>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">In technician pipeline</p>
        </div>

        <div
          onClick={() => setActiveTab('atr')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeTab === 'atr'
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ATR Verification
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <CheckCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.atrCount}</p>
          <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Technician work completed</p>
        </div>

        <div
          onClick={() => {
            setActiveTab('history');
            setStatusFilter('CLOSED');
          }}
          className="cursor-pointer p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Closed & Archived
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.closedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Total resolved tickets</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('pending');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-[#1a365d] text-[#1a365d]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Pending Approvals</span>
          {metrics.pendingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {metrics.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-[#1a365d] text-[#1a365d]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Approved History & Real-Time Tracking</span>
          {metrics.totalHistory > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {metrics.totalHistory}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('atr');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'atr'
              ? 'border-[#1a365d] text-[#1a365d]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>ATR Signoff Queue</span>
          {metrics.atrCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {metrics.atrCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID, Building, Lab, Requester, or Electrician..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 rounded-md border border-slate-200 focus:bg-white focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'history' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="ALLOCATED">Allocated / Assigned</option>
                <option value="IN_PROGRESS">In Progress (Active Work)</option>
                <option value="ACTION_TAKEN">Action Taken (ATR Filed)</option>
                <option value="VERIFICATION">Under Verification</option>
                <option value="CLOSED">Closed & Resolved</option>
                <option value="REJECTED">Department Rejected</option>
              </select>
            )}

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="AIR_CONDITIONING">Air Conditioning</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="CARPENTER">Carpenter</option>
              <option value="NETWORKING">Networking</option>
              <option value="CIVIL">Civil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <LoadingSkeleton rows={5} type="table" />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={activeTab === 'pending' ? CheckSquare : activeTab === 'history' ? History : CheckCheck}
          title={
            activeTab === 'pending'
              ? 'No Pending Endorsements'
              : activeTab === 'history'
              ? 'No Department History Found'
              : 'No ATRs Awaiting Approval'
          }
          description={
            searchQuery || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No tickets match your active filter and search criteria.'
              : activeTab === 'pending'
              ? 'All incoming department repair tickets have been reviewed.'
              : activeTab === 'history'
              ? 'No approved or past departmental tickets found in the system.'
              : 'No action taken reports currently pending your departmental endorsement.'
          }
          actionLabel={searchQuery ? 'Clear Filters' : 'Refresh Queue'}
          onAction={() => {
            setSearchQuery('');
            setPriorityFilter('ALL');
            setCategoryFilter('ALL');
            setStatusFilter('ALL');
            fetchData();
          }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0b1e33] text-white border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Ticket Ref</th>
                  <th className="py-3.5 px-4">Location & Lab</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">
                    {activeTab === 'pending' ? 'Submitted Date' : 'Assigned Technician'}
                  </th>
                  <th className="py-3.5 px-4">Current Stage & Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredComplaints.map((item) => {
                  const assignedTech = item.assignments?.[0]?.technician;
                  const isApproved = item.hodApprovalStatus === 'APPROVED';
                  const isRejected = item.hodApprovalStatus === 'REJECTED';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#1a365d] text-xs">
                          {item.ticketNumber || item.id}
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[140px]">
                          {item.title || item.description?.substring(0, 30)}
                        </p>
                      </td>

                      {/* Location & Room */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.roomAreaNumber || 'Room N/A'}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {item.locationBuilding}
                        </p>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <CategoryBadge category={item.category} />
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </td>

                      {/* Requester */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {item.reporter?.fullName || 'Faculty/Supervisor'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {item.reporter?.employeeId || 'FACULTY'}
                        </p>
                      </td>

                      {/* Middle column dependent on tab */}
                      <td className="py-3.5 px-4">
                        {activeTab === 'pending' ? (
                          <div>
                            <p className="font-medium text-slate-700">
                              {item.registeredAt ? new Date(item.registeredAt).toLocaleDateString() : 'Today'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              SLA: {item.slaDueAt ? new Date(item.slaDueAt).toLocaleDateString() : '48h'}
                            </p>
                          </div>
                        ) : assignedTech ? (
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                              <Wrench className="w-3 h-3 text-[#1a365d]" />
                              <span>{assignedTech.fullName}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Emp: {assignedTech.employeeId} • {assignedTech.role}
                            </p>
                          </div>
                        ) : isRejected ? (
                          <span className="text-[11px] text-rose-600 font-medium">Department Rejected</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Awaiting Allocation
                          </span>
                        )}
                      </td>

                      {/* Status & Live Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={item.status} />
                            {item.status === 'ACTION_TAKEN' && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 animate-pulse">
                                ATR Ready
                              </span>
                            )}
                          </div>
                          {activeTab === 'history' && (
                            <div className="w-32">
                              <WorkflowTracker
                                currentStatus={item.status}
                                hodApprovalStatus={item.hodApprovalStatus}
                                compact={true}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeTab === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={() => {
                                  setSelectedComplaint(item);
                                  setInspectionTab('overview');
                                  setHodRemarks('');
                                }}
                              >
                                Review
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                icon={CheckCircle}
                                onClick={() => handleOpenApproveDialog(item)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={XCircle}
                                onClick={() => handleOpenRejectDialog(item)}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {activeTab === 'history' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Activity}
                              onClick={() => {
                                setSelectedComplaint(item);
                                setInspectionTab('overview');
                                setHodRemarks('');
                              }}
                            >
                              Track Status
                            </Button>
                          )}

                          {activeTab === 'atr' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={FileText}
                                onClick={() => {
                                  setSelectedComplaint(item);
                                  setInspectionTab('atr');
                                  setHodRemarks('');
                                }}
                              >
                                Inspect ATR
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                icon={CheckCircle}
                                onClick={() => handleOpenAtrApproveDialog(item)}
                              >
                                Endorse
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={XCircle}
                                onClick={() => handleOpenAtrRejectDialog(item)}
                              >
                                Rework
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Full Inspection & Multi-Stage Real-Time Tracking */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket #${selectedComplaint.ticketNumber || selectedComplaint.id}`}
          subtitle="Department Real-Time Tracking & Inspection Console"
          icon={FileText}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
              >
                Close View
              </Button>

              <div className="flex items-center gap-2">
                {selectedComplaint.hodApprovalStatus === 'PENDING' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleOpenRejectDialog(selectedComplaint)}
                    >
                      Reject Complaint
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleOpenApproveDialog(selectedComplaint)}
                    >
                      Endorse & Approve
                    </Button>
                  </>
                )}

                {selectedComplaint.status === 'ACTION_TAKEN' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleOpenAtrRejectDialog(selectedComplaint)}
                    >
                      Reject ATR (Rework)
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleOpenAtrApproveDialog(selectedComplaint)}
                    >
                      Endorse ATR
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Real-time Progress Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Live Resolution Lifecycle
                </span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <WorkflowTracker
                currentStatus={selectedComplaint.status}
                hodApprovalStatus={selectedComplaint.hodApprovalStatus}
              />
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => setInspectionTab('overview')}
                className={`pb-2 border-b-2 transition-colors ${
                  inspectionTab === 'overview'
                    ? 'border-[#1a365d] text-[#1a365d]'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                Overview & Premises
              </button>
              <button
                type="button"
                onClick={() => setInspectionTab('timeline')}
                className={`pb-2 border-b-2 transition-colors ${
                  inspectionTab === 'timeline'
                    ? 'border-[#1a365d] text-[#1a365d]'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                Technician & Status Trail
              </button>
              {(selectedComplaint.atrs?.length > 0 || selectedComplaint.status === 'ACTION_TAKEN') && (
                <button
                  type="button"
                  onClick={() => setInspectionTab('atr')}
                  className={`pb-2 border-b-2 transition-colors ${
                    inspectionTab === 'atr'
                      ? 'border-[#1a365d] text-[#1a365d]'
                      : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Action Taken Report (ATR)
                </button>
              )}
            </div>

            {/* Tab: Overview */}
            {inspectionTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Location & Lab
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedComplaint.roomAreaNumber || 'Room N/A'}
                    </p>
                    <p className="text-slate-600">{selectedComplaint.locationBuilding}</p>
                    <p className="text-slate-400">{selectedComplaint.floorArea || 'Ground Floor'}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Classification & Priority
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <PriorityBadge priority={selectedComplaint.priority} />
                      <CategoryBadge category={selectedComplaint.category} />
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      SLA Due: {selectedComplaint.slaDueAt ? new Date(selectedComplaint.slaDueAt).toLocaleString() : 'Within 48h'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted By
                    </span>
                    <p className="font-bold text-slate-900">
                      {selectedComplaint.reporter?.fullName || 'Faculty/Supervisor'}
                    </p>
                    <p className="text-slate-500 font-mono">
                      ID: {selectedComplaint.reporter?.employeeId || 'STAFF'}
                    </p>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Defect Description & Work Scope
                  </h5>
                  <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 font-mono">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* HOD Endorsement Status */}
                {selectedComplaint.hodApprovedAt && (
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-blue-950">
                        {selectedComplaint.hodApprovalStatus === 'APPROVED' ? 'Endorsed by HOD' : 'Rejected by HOD'} on{' '}
                        {new Date(selectedComplaint.hodApprovedAt).toLocaleString()}
                      </p>
                      {selectedComplaint.hodRemarks && (
                        <p className="text-blue-800 mt-0.5">Remarks: {selectedComplaint.hodRemarks}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Timeline & Technician */}
            {inspectionTab === 'timeline' && (
              <div className="space-y-3">
                {/* Assigned Technician Card */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#1a365d]" />
                    <span>Allocated Maintenance Technician</span>
                  </h5>
                  {selectedComplaint.assignments?.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {selectedComplaint.assignments.map((asgn, idx) => (
                        <div key={asgn.id || idx} className="p-2.5 bg-white rounded border border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{asgn.technician?.fullName || 'Technician'}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Emp ID: {asgn.technician?.employeeId || 'EL001'} • Role: {asgn.technician?.role || 'ELECTRICIAN'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {asgn.status}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Assigned: {asgn.assignedAt ? new Date(asgn.assignedAt).toLocaleDateString() : 'Active'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No technician has been assigned yet. Pending Central Maintenance Cell allocation.
                    </p>
                  )}
                </div>

                {/* Status Audit Log */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#1a365d]" />
                    <span>Lifecycle Event Audit Trail</span>
                  </h5>
                  {selectedComplaint.statusHistory?.length > 0 ? (
                    <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3">
                      {selectedComplaint.statusHistory.map((hist, idx) => (
                        <div key={hist.id || idx} className="text-xs relative">
                          <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#1a365d] border-2 border-white" />
                          <p className="font-bold text-slate-800">
                            Status changed to <span className="font-mono text-[#1a365d]">{hist.status}</span>
                          </p>
                          {hist.remarks && <p className="text-slate-600 text-[11px]">{hist.remarks}</p>}
                          <p className="text-[10px] text-slate-400">
                            {new Date(hist.changedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Registered at {new Date(selectedComplaint.registeredAt || selectedComplaint.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Action Taken Report */}
            {inspectionTab === 'atr' && (
              <div className="space-y-3">
                {selectedComplaint.atrs?.length > 0 ? (
                  selectedComplaint.atrs.map((atr, idx) => (
                    <div key={atr.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            ATR Submission #{idx + 1}
                          </span>
                          {atr.submittedBy && (
                            <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                              By: {atr.submittedBy.fullName} (ID: {atr.submittedBy.employeeId})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {atr.submittedAt ? new Date(atr.submittedAt).toLocaleString() : 'Submitted'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Work Carried Out / Actions Taken
                        </span>
                        <p className="mt-1 p-2.5 bg-white rounded border border-slate-200 text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
                          {atr.actionTaken || atr.actionsTaken || atr.details || atr.remarks || 'No specific description recorded.'}
                        </p>
                      </div>

                      {(atr.partsUsed || atr.materialsUsed) && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Materials & Spares Utilized
                          </span>
                          <p className="mt-1 p-2 bg-white rounded border border-slate-200 text-slate-700 font-mono text-[11px]">
                            {atr.partsUsed || atr.materialsUsed}
                          </p>
                        </div>
                      )}

                      {atr.remarks && atr.remarks !== atr.actionTaken && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Technician Remarks
                          </span>
                          <p className="mt-1 text-slate-600 italic">{atr.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                    Technician has not submitted an Action Taken Report (ATR) for this ticket yet.
                  </p>
                )}
              </div>
            )}

            {/* HOD Remarks Input for Pending / ATR review */}
            {(selectedComplaint.hodApprovalStatus === 'PENDING' || selectedComplaint.status === 'ACTION_TAKEN') && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  HOD Endorsement Directives / Notes
                </label>
                <textarea
                  rows={2}
                  value={hodRemarks}
                  onChange={(e) => setHodRemarks(e.target.value)}
                  placeholder="Add departmental instructions, clearance notes, or rejection grounds..."
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        type={
          dialogState.type === 'approve' || dialogState.type === 'atr_approve'
            ? 'success'
            : 'danger'
        }
        title={
          dialogState.type === 'approve'
            ? 'Endorse Complaint for Repair?'
            : dialogState.type === 'reject'
            ? 'Reject Repair Request?'
            : dialogState.type === 'atr_approve'
            ? 'Endorse Action Taken Report?'
            : 'Reject Action Taken Report for Rework?'
        }
        description={
          dialogState.type === 'approve'
            ? `Are you sure you want to approve Ticket #${
                dialogState.complaint?.ticketNumber || dialogState.complaint?.id
              }? It will be forwarded to the Central Maintenance Cell for electrician allocation.`
            : dialogState.type === 'reject'
            ? `Are you sure you want to reject Ticket #${
                dialogState.complaint?.ticketNumber || dialogState.complaint?.id
              }? The requester will be notified of the decision.`
            : dialogState.type === 'atr_approve'
            ? `Confirm that the repair work for Ticket #${
                dialogState.complaint?.ticketNumber || dialogState.complaint?.id
              } has been verified and can proceed to final resolution.`
            : `Send Ticket #${
                dialogState.complaint?.ticketNumber || dialogState.complaint?.id
              } back to the electrician for rectification/rework?`
        }
        confirmLabel={
          dialogState.type === 'approve'
            ? 'Confirm Approval'
            : dialogState.type === 'reject'
            ? 'Confirm Rejection'
            : dialogState.type === 'atr_approve'
            ? 'Endorse ATR'
            : 'Send for Rework'
        }
        confirmVariant={
          dialogState.type === 'approve' || dialogState.type === 'atr_approve'
            ? 'success'
            : 'danger'
        }
        isLoading={dialogState.isLoading}
        onClose={() =>
          setDialogState({
            isOpen: false,
            type: 'approve',
            complaint: null,
            isLoading: false,
          })
        }
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
