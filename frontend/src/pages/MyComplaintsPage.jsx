import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  Building,
  MapPin,
  Clock,
  Wrench,
  FileText,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  Filter,
  ArrowRight,
  FilePlus,
  Tag,
  Phone,
  Layers,
  History,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Select } from '../components/Input';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { complaintService } from '../services/complaintService';
import { useToast } from '../components/Toast';

export function MyComplaintsPage({ token, user, onNavigateToRaiseComplaint }) {
  const { showSuccess, showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // ALL, PENDING_HOD, IN_PROGRESS, CLOSED, REJECTED
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Selected complaint for full audit trail modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchMyComplaints = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await complaintService.getMyComplaints(token);
      const items = data.complaints || data.data || [];
      setComplaints(items);
      setLastSyncedAt(new Date());
      if (isManualRefresh) {
        showSuccess('Your complaints have been refreshed with real-time status', 'Refreshed');
      }
    } catch (err) {
      showError(err.message || 'Failed to retrieve your submitted complaints');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError, showSuccess]);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  const copyTicketId = (ticketId, e) => {
    if (e) e.stopPropagation();
    if (ticketId) {
      navigator.clipboard.writeText(ticketId);
      showSuccess(`Ticket #${ticketId} copied to clipboard`, 'Copied');
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    let pendingHod = 0;
    let activeRepair = 0;
    let closed = 0;
    let rejected = 0;

    complaints.forEach((c) => {
      const st = String(c.status || '').toUpperCase();
      const hodSt = String(c.hodApprovalStatus || '').toUpperCase();

      if (st === 'REJECTED' || hodSt === 'REJECTED') {
        rejected++;
      } else if (st === 'CLOSED' || st === 'VERIFIED') {
        closed++;
      } else if (
        st === 'ASSIGNED' ||
        st === 'REPAIR_ASSIGNED' ||
        st === 'IN_PROGRESS' ||
        st === 'ACTION_TAKEN' ||
        st === 'WORK_COMPLETED' ||
        st === 'COMPLETED' ||
        st === 'APPROVED'
      ) {
        activeRepair++;
      } else if (hodSt === 'PENDING' || st === 'COMPLAINT_REGISTERED') {
        pendingHod++;
      }
    });

    return {
      total: complaints.length,
      pendingHod,
      activeRepair,
      closed,
      rejected,
    };
  }, [complaints]);

  // Unique categories in the user's complaints
  const categoryOptions = useMemo(() => {
    const set = new Set();
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return [
      { value: 'ALL', label: 'All Maintenance Categories' },
      ...Array.from(set).map((cat) => ({ value: cat, label: cat })),
    ];
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const st = String(c.status || '').toUpperCase();
      const hodSt = String(c.hodApprovalStatus || '').toUpperCase();

      // Tab filter
      if (statusTab === 'PENDING_HOD') {
        if (hodSt !== 'PENDING' && st !== 'COMPLAINT_REGISTERED') return false;
        if (st === 'REJECTED' || hodSt === 'REJECTED') return false;
      } else if (statusTab === 'IN_PROGRESS') {
        const inProg = [
          'APPROVED',
          'ASSIGNED',
          'REPAIR_ASSIGNED',
          'IN_PROGRESS',
          'ACTION_TAKEN',
          'WORK_COMPLETED',
          'COMPLETED',
        ];
        if (!inProg.includes(st) || hodSt === 'REJECTED') return false;
      } else if (statusTab === 'CLOSED') {
        if (st !== 'CLOSED' && st !== 'VERIFIED') return false;
      } else if (statusTab === 'REJECTED') {
        if (st !== 'REJECTED' && hodSt !== 'REJECTED') return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ticketNum = (c.ticketNumber || c.id || '').toLowerCase();
        const title = (c.title || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const building = (c.locationBuilding || '').toLowerCase();
        const room = (c.roomAreaNumber || '').toLowerCase();

        return (
          ticketNum.includes(q) ||
          title.includes(q) ||
          desc.includes(q) ||
          building.includes(q) ||
          room.includes(q)
        );
      }

      return true;
    });
  }, [complaints, statusTab, priorityFilter, categoryFilter, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Submitted Complaints"
        description="Track the end-to-end resolution workflow for all equipment and maintenance tickets registered under your institutional profile."
        breadcrumbs={['Complaints', 'My Complaints']}
        icon={ClipboardList}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchMyComplaints(true)}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            {onNavigateToRaiseComplaint && (
              <Button
                variant="primary"
                size="sm"
                icon={FilePlus}
                onClick={onNavigateToRaiseComplaint}
              >
                Raise New Complaint
              </Button>
            )}
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Logged
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="text-[11px] text-slate-400">All submitted tickets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending HOD
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900">{metrics.pendingHod}</p>
          <p className="text-[11px] text-amber-600">Awaiting department approval</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Active / In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900">{metrics.activeRepair}</p>
          <p className="text-[11px] text-indigo-600">Assigned / under technician repair</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Resolved & Closed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900">{metrics.closed}</p>
          <p className="text-[11px] text-emerald-600">Verified & closed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Rejected
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-900">{metrics.rejected}</p>
          <p className="text-[11px] text-rose-600">Requires review / clarification</p>
        </div>
      </div>

      {/* Main Container Card */}
      <Card>
        <CardHeader
          title="Workflow Status & Complaint History"
          subtitle={
            lastSyncedAt
              ? `Real-time synchronization active • Last updated: ${lastSyncedAt.toLocaleTimeString()}`
              : 'Viewing tickets submitted under your institutional account'
          }
          icon={Layers}
        />

        {/* Tab Filters and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4 bg-slate-50/50">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Tickets', count: metrics.total },
              { id: 'PENDING_HOD', label: 'Pending HOD', count: metrics.pendingHod },
              { id: 'IN_PROGRESS', label: 'In Progress / Assigned', count: metrics.activeRepair },
              { id: 'CLOSED', label: 'Verified & Closed', count: metrics.closed },
              { id: 'REJECTED', label: 'Rejected', count: metrics.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  statusTab === tab.id
                    ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, defect description, campus building, room..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <Select
              id="my-complaints-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Urgency Levels' },
                { value: 'CRITICAL', label: 'Critical / Emergency' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Low Priority' },
              ]}
            />

            <Select
              id="my-complaints-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>
        </div>

        {/* Complaints Content */}
        <CardBody className="p-4 sm:p-6 space-y-4">
          {isLoading && complaints.length === 0 ? (
            <LoadingSkeleton rows={3} type="table" />
          ) : filteredComplaints.length === 0 ? (
            <EmptyState
              title={
                complaints.length === 0
                  ? 'No Complaints Registered Yet'
                  : 'No Matching Complaints Found'
              }
              description={
                complaints.length === 0
                  ? 'You have not submitted any maintenance repair tickets under this login session.'
                  : 'No tickets matched your current search filters. Try adjusting your search query or reset filter settings.'
              }
              icon={complaints.length === 0 ? ClipboardList : Search}
              actionLabel={
                complaints.length === 0 && onNavigateToRaiseComplaint
                  ? 'Raise Your First Complaint'
                  : searchQuery || statusTab !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'Reset Filters'
                  : undefined
              }
              onAction={() => {
                if (complaints.length === 0 && onNavigateToRaiseComplaint) {
                  onNavigateToRaiseComplaint();
                } else {
                  setSearchQuery('');
                  setStatusTab('ALL');
                  setPriorityFilter('ALL');
                  setCategoryFilter('ALL');
                }
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((ticket) => {
                const isRejected =
                  ticket.status === 'REJECTED' || ticket.hodApprovalStatus === 'REJECTED';
                const activeAssignment = ticket.assignments?.[0];
                const technician = activeAssignment?.technician;
                const activeAtr = ticket.atrs?.[0];
                const isVerified = ticket.status === 'VERIFIED' || ticket.status === 'CLOSED';

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#1a365d]/40 transition-all overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a365d] text-white rounded-md font-mono text-xs font-bold shadow-2xs">
                          <span>{ticket.ticketNumber || ticket.id}</span>
                          <button
                            type="button"
                            onClick={(e) => copyTicketId(ticket.ticketNumber || ticket.id, e)}
                            className="text-amber-300 hover:text-white p-0.5"
                            title="Copy Ticket ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <PriorityBadge priority={ticket.priority} />
                        <CategoryBadge category={ticket.category} />
                        <StatusBadge status={ticket.status || 'COMPLAINT_REGISTERED'} />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Lodged: {formatShortDate(ticket.createdAt || ticket.registeredAt)}
                        </span>
                        {ticket.slaDueAt && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Target SLA: {formatShortDate(ticket.slaDueAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Information */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Defect Title and Location */}
                      <div className="space-y-1.5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {ticket.title || 'Facility Maintenance Request'}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200/80">
                            <MapPin className="w-3.5 h-3.5 text-[#1a365d]" />
                            <span>{ticket.locationBuilding || 'Main Academic Block'}</span>
                            {ticket.floorArea && (
                              <span className="text-slate-400 font-normal">• {ticket.floorArea}</span>
                            )}
                            {ticket.roomAreaNumber && (
                              <span className="text-slate-800">• {ticket.roomAreaNumber}</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Embedded Real-Time Workflow Tracker */}
                      <div className="pt-1">
                        <WorkflowTracker
                          currentStatus={ticket.status}
                          hodApprovalStatus={ticket.hodApprovalStatus}
                        />
                      </div>

                      {/* Contextual Status Insights */}
                      {isRejected ? (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-xs text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">
                              Ticket Endorsement Rejected by Department HOD
                            </p>
                            <p className="text-rose-700">
                              Reason:{' '}
                              <span className="font-medium">
                                {ticket.rejectionReason ||
                                  ticket.hodRemarks ||
                                  'Complaint does not meet institutional repair criteria or requires departmental re-submission.'}
                              </span>
                            </p>
                          </div>
                        </div>
                      ) : ticket.hodApprovalStatus === 'PENDING' ? (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg flex items-center justify-between text-xs text-amber-900">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              Complaint logged in system. Awaiting verification and endorsement from your Department Head.
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Stage 1: HOD Review
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Technician Assignment Info */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-[#1a365d]" />
                                Assigned Technician
                              </span>
                              {technician ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Assigned
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                  Allocation In Progress
                                </span>
                              )}
                            </div>
                            {technician ? (
                              <div>
                                <p className="font-bold text-slate-800">
                                  {technician.fullName || technician.username}
                                </p>
                                <p className="text-slate-500 font-mono text-[11px]">
                                  Emp ID: {technician.employeeId || 'N/A'}
                                  {technician.phone ? ` • Tel: ${technician.phone}` : ''}
                                </p>
                              </div>
                            ) : (
                              <p className="text-slate-500 italic">
                                Approved by HOD. Maintenance supervisor is assigning technician.
                              </p>
                            )}
                          </div>

                          {/* Resolution / Verification State */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Resolution & Verification
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  isVerified
                                    ? 'text-emerald-700 bg-emerald-100'
                                    : activeAtr
                                    ? 'text-indigo-700 bg-indigo-100'
                                    : 'text-slate-600 bg-slate-200'
                                }`}
                              >
                                {isVerified
                                  ? 'Verified & Closed'
                                  : activeAtr
                                  ? 'ATR Submitted'
                                  : 'Repair Active'}
                              </span>
                            </div>
                            {isVerified ? (
                              <p className="font-bold text-emerald-800">
                                Repair inspected and officially verified closed.
                              </p>
                            ) : activeAtr ? (
                              <p className="text-slate-700 font-medium">
                                Action Taken Report logged by electrician:{' '}
                                <span className="italic text-slate-600">
                                  "{activeAtr.actionTaken || 'Repair accomplished'}"
                                </span>
                              </p>
                            ) : (
                              <p className="text-slate-500">
                                Technician is currently addressing the maintenance task on-site.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Action */}
                    <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {ticket.statusHistory && ticket.statusHistory.length > 0
                          ? `${ticket.statusHistory.length} status milestone(s) recorded`
                          : 'Institutional audit tracking enabled'}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedComplaint(ticket)}
                      >
                        View Full Audit Trail
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Full Ticket Inspection & Audit Trail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket Audit Trail: ${selectedComplaint.ticketNumber || selectedComplaint.id}`}
          size="lg"
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Modal Workflow Tracker */}
            <WorkflowTracker
              currentStatus={selectedComplaint.status}
              hodApprovalStatus={selectedComplaint.hodApprovalStatus}
            />

            {/* General Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Complaint Classification
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{selectedComplaint.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <CategoryBadge category={selectedComplaint.category} />
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Location & Contact Details
                </span>
                <div className="space-y-1 text-slate-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#1a365d]" />
                    {selectedComplaint.locationBuilding || 'Main Academic Block'}
                  </p>
                  <p className="text-slate-600">
                    Floor: {selectedComplaint.floorArea || 'General Floor'} • Room:{' '}
                    <span className="font-bold text-slate-900">
                      {selectedComplaint.roomAreaNumber || 'N/A'}
                    </span>
                  </p>
                  {selectedComplaint.locationIntercom && (
                    <p className="text-sky-800 font-mono text-[11px] font-semibold">
                      Intercom: {selectedComplaint.locationIntercom}
                    </p>
                  )}
                  {selectedComplaint.requesterContact && (
                    <p className="text-emerald-800 font-mono text-[11px] font-semibold">
                      Direct Contact: {selectedComplaint.requesterContact}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Defect Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Detailed Defect Description
              </span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Department Head Clearance Details */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1a365d]" />
                Department Head (HOD) Endorsement Status
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Status:{' '}
                    <span
                      className={
                        selectedComplaint.hodApprovalStatus === 'APPROVED'
                          ? 'text-emerald-700'
                          : selectedComplaint.hodApprovalStatus === 'REJECTED'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }
                    >
                      {selectedComplaint.hodApprovalStatus || 'PENDING'}
                    </span>
                  </p>
                  {selectedComplaint.hodRemarks && (
                    <p className="text-slate-600 mt-0.5 italic">
                      Remarks: "{selectedComplaint.hodRemarks}"
                    </p>
                  )}
                  {selectedComplaint.rejectionReason && (
                    <p className="text-rose-700 mt-0.5 font-medium">
                      Rejection Reason: "{selectedComplaint.rejectionReason}"
                    </p>
                  )}
                </div>
                {selectedComplaint.hodApprovedAt && (
                  <span className="text-slate-500 text-[11px]">
                    Cleared on: {formatDate(selectedComplaint.hodApprovedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Technician & ATR Section */}
            {selectedComplaint.assignments && selectedComplaint.assignments.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-[#1a365d]" />
                  Technician Action & ATR Report
                </span>
                {selectedComplaint.assignments.map((assign, idx) => (
                  <div
                    key={assign.id || idx}
                    className="p-2.5 bg-white border border-slate-200 rounded-md space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>
                        Electrician: {assign.technician?.fullName || assign.technician?.username} (
                        {assign.technician?.employeeId})
                      </span>
                      <span className="text-indigo-700 font-semibold">{assign.status}</span>
                    </div>
                    {assign.actionTakenReports && assign.actionTakenReports.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Action Taken Report (ATR)
                        </span>
                        <p className="text-slate-700 font-medium">
                          {assign.actionTakenReports[0].actionTaken}
                        </p>
                        {assign.actionTakenReports[0].partsUsed && (
                          <p className="text-slate-500 text-[11px]">
                            Parts / Material:{' '}
                            <span className="font-mono">
                              {assign.actionTakenReports[0].partsUsed}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Status History Audit Trail Timeline */}
            {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-[#1a365d]" />
                  Status Audit Timeline
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                  {selectedComplaint.statusHistory.map((history, hIdx) => (
                    <div
                      key={history.id || hIdx}
                      className="p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1a365d]"></span>
                        <span className="font-bold text-slate-800">{history.toStatus}</span>
                        {history.remarks && (
                          <span className="text-slate-500 italic truncate max-w-xs">
                            — {history.remarks}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDate(history.changedAt || history.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
              >
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
