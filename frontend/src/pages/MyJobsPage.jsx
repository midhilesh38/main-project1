import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  Search,
  RefreshCw,
  Play,
  CheckCircle,
  Eye,
  FileCheck,
  Building,
  Clock,
  Wrench,
  Layers,
  FileText,
  Package,
  Activity,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, PriorityBadge, CategoryBadge, Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Textarea, Input } from '../components/Input';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { jobService } from '../services/jobService';
import { useToast } from '../components/Toast';

export function MyJobsPage({ token, user }) {
  const { showSuccess, showError } = useToast();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Selected Job for Detail View Modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Complete Job & ATR Modal State
  const [atrModalJob, setAtrModalJob] = useState(null);
  const [actionTakenText, setActionTakenText] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [technicianRemarks, setTechnicianRemarks] = useState('');
  const [isSubmittingAtr, setIsSubmittingAtr] = useState(false);

  // Confirm Start Job dialog
  const [startDialogJob, setStartDialogJob] = useState(null);
  const [isStartingJob, setIsStartingJob] = useState(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jobService.getMyJobs(token);
      setJobs(data.jobs || data.assignments || []);
    } catch (err) {
      showError(err.message || 'Failed to retrieve live assigned work orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Metrics summary
  const metrics = useMemo(() => {
    const assignedCount = jobs.filter((j) => j.status === 'ASSIGNED').length;
    const inProgressCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
    const completedCount = jobs.filter(
      (j) => j.status === 'COMPLETED' || j.status === 'WORK_COMPLETED' || j.complaint?.status === 'ACTION_TAKEN'
    ).length;

    return {
      total: jobs.length,
      assignedCount,
      inProgressCount,
      completedCount,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const complaint = job.complaint || {};

      const matchesSearch =
        !searchQuery ||
        job.id?.toLowerCase().includes(q) ||
        complaint.id?.toLowerCase().includes(q) ||
        complaint.ticketNumber?.toLowerCase().includes(q) ||
        complaint.title?.toLowerCase().includes(q) ||
        complaint.description?.toLowerCase().includes(q) ||
        complaint.locationBuilding?.toLowerCase().includes(q) ||
        complaint.roomAreaNumber?.toLowerCase().includes(q) ||
        complaint.reporter?.fullName?.toLowerCase().includes(q) ||
        complaint.reporter?.employeeId?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        job.status === statusFilter ||
        (statusFilter === 'COMPLETED' && (job.status === 'COMPLETED' || job.complaint?.status === 'ACTION_TAKEN'));

      const matchesPriority =
        priorityFilter === 'ALL' || complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [jobs, searchQuery, statusFilter, priorityFilter]);

  const handleStartWork = async () => {
    if (!startDialogJob) return;
    setIsStartingJob(true);
    try {
      await jobService.startJob(token, startDialogJob.id);
      const ticketRef = startDialogJob.complaint?.ticketNumber || startDialogJob.complaint?.id || startDialogJob.id;
      showSuccess(`Work order for Ticket #${ticketRef} is now In Progress.`);
      setStartDialogJob(null);
      fetchJobs();
    } catch (err) {
      showError(err.message || 'Failed to update work order status');
    } finally {
      setIsStartingJob(false);
    }
  };

  const handleOpenAtrModal = (job) => {
    setAtrModalJob(job);
    setActionTakenText('');
    setPartsUsed('');
    setTechnicianRemarks('');
  };

  const handleSubmitAtr = async (e) => {
    e.preventDefault();
    if (!atrModalJob) return;

    if (!actionTakenText.trim() || actionTakenText.trim().length < 5) {
      showError('Please provide a detailed Action Taken Report describing corrective work done.');
      return;
    }

    setIsSubmittingAtr(true);
    try {
      await jobService.completeJob(token, atrModalJob.id, actionTakenText.trim(), partsUsed.trim());
      const ticketRef = atrModalJob.complaint?.ticketNumber || atrModalJob.complaint?.id || atrModalJob.id;
      showSuccess(
        `Action Taken Report submitted. Work marked as Completed for Ticket #${ticketRef}.`,
        'ATR Filed Successfully'
      );
      setAtrModalJob(null);
      fetchJobs();
    } catch (err) {
      showError(err.message || 'Failed to submit Action Taken Report');
    } finally {
      setIsSubmittingAtr(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs & Work Orders"
        description="Live technician execution console for assigned campus repair tasks and Action Taken Report (ATR) filing."
        breadcrumbs={['Technician Portal', 'My Assigned Jobs']}
        icon={Briefcase}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchJobs}
            isLoading={isLoading}
          >
            Refresh Work Orders
          </Button>
        }
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setPriorityFilter('ALL');
          }}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-50 border-slate-300 ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Work Orders
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Briefcase className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.total}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Assigned to your profile</p>
        </div>

        <div
          onClick={() => setStatusFilter('ASSIGNED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'ASSIGNED'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Start
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.assignedCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Ready to commence</p>
        </div>

        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.inProgressCount}</p>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">Active on-site repair</p>
        </div>

        <div
          onClick={() => setStatusFilter('COMPLETED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ATR Filed / Done
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <FileCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.completedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Awaiting HOD / IQAC closure</p>
        </div>
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
              placeholder="Search work orders by Ticket #, Lab, Room, Building, or Requester..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 rounded-md border border-slate-200 focus:bg-white focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Status Quick Filter Buttons */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Jobs' },
                { id: 'ASSIGNED', label: 'Assigned' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st.id
                      ? 'bg-[#1a365d] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} type="card" />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Assigned Work Orders"
          description={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No live maintenance assignments match your search and filter criteria.'
              : 'You currently have no active work orders assigned to your account in the live database.'
          }
          actionLabel="Refresh Live Jobs"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
            setPriorityFilter('ALL');
            fetchJobs();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const complaint = job.complaint || {};
            const ticketRef = complaint.ticketNumber || (complaint.id ? `#${complaint.id}` : `#${job.id}`);
            const isAssigned = job.status === 'ASSIGNED';
            const isInProgress = job.status === 'IN_PROGRESS';
            const isCompleted =
              job.status === 'COMPLETED' ||
              job.status === 'WORK_COMPLETED' ||
              complaint.status === 'ACTION_TAKEN';

            return (
              <Card key={job.id} hover className="flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Card Top Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1a365d]">
                        {ticketRef}
                      </span>
                      <CategoryBadge category={complaint.category || 'ELECTRICAL'} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={complaint.priority || 'MEDIUM'} />
                      <StatusBadge status={job.status} />
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {complaint.title || complaint.description?.substring(0, 40) || 'Campus Maintenance Task'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{complaint.locationBuilding || 'Campus Premises'}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800">
                          {complaint.roomAreaNumber || 'General Area'}
                        </span>
                        {complaint.floorArea && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{complaint.floorArea}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-100 font-mono line-clamp-2 leading-relaxed">
                      {complaint.description || 'No defect description specified.'}
                    </p>

                    {job.remarks && (
                      <div className="p-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                        <span className="font-bold">Supervisor Instructions: </span>
                        {job.remarks}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Assigned: {job.assignedAt ? new Date(job.assignedAt).toLocaleDateString() : 'Active'}
                      </span>
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Requester: {complaint.reporter?.fullName || 'Faculty/Supervisor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </Button>

                  <div className="flex items-center gap-2">
                    {isAssigned && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => setStartDialogJob(job)}
                      >
                        Start Work
                      </Button>
                    )}

                    {isInProgress && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleOpenAtrModal(job)}
                      >
                        Complete & File ATR
                      </Button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded border border-emerald-200">
                        <FileCheck className="w-3.5 h-3.5" />
                        ATR Submitted
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Job Details & Lifecycle Trail */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Work Order: #${selectedJob.complaint?.ticketNumber || selectedJob.complaint?.id || selectedJob.id}`}
          subtitle="Technician Job Scope, Premises & Execution Trail"
          icon={Briefcase}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                Close View
              </Button>

              <div className="flex items-center gap-2">
                {selectedJob.status === 'ASSIGNED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Play}
                    onClick={() => {
                      const j = selectedJob;
                      setSelectedJob(null);
                      setStartDialogJob(j);
                    }}
                  >
                    Commence Repair
                  </Button>
                )}

                {selectedJob.status === 'IN_PROGRESS' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => {
                      const j = selectedJob;
                      setSelectedJob(null);
                      handleOpenAtrModal(j);
                    }}
                  >
                    Submit ATR & Complete
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Live Progress Stage */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Resolution Progress
                </span>
                <StatusBadge status={selectedJob.status} />
              </div>
              <WorkflowTracker
                currentStatus={selectedJob.status}
                hodApprovalStatus={selectedJob.complaint?.hodApprovalStatus || 'APPROVED'}
              />
            </div>

            {/* Premises & Assignment Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Premises & Location
                </span>
                <p className="font-bold text-slate-900 mt-1 text-sm">
                  {selectedJob.complaint?.roomAreaNumber || 'Room N/A'}
                </p>
                <p className="text-slate-600">{selectedJob.complaint?.locationBuilding || 'Campus Block'}</p>
                <p className="text-slate-400">{selectedJob.complaint?.floorArea || 'Standard Floor'}</p>
                {selectedJob.complaint?.locationIntercom && (
                  <p className="text-sky-800 font-semibold font-mono text-[11px] mt-1 pt-1 border-t border-slate-200">
                    Intercom: {selectedJob.complaint.locationIntercom}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Requester Information
                </span>
                <p className="font-bold text-slate-900 mt-1 text-sm">
                  {selectedJob.complaint?.reporter?.fullName || 'Faculty/Supervisor'}
                </p>
                <p className="text-slate-600 font-mono">
                  Emp ID: {selectedJob.complaint?.reporter?.employeeId || 'STAFF'}
                </p>
                <p className="text-slate-400">
                  Dept: {selectedJob.complaint?.department?.name || 'Department'}
                </p>
                {(selectedJob.complaint?.requesterContact || selectedJob.complaint?.reporter?.phone) && (
                  <p className="text-emerald-800 font-semibold font-mono text-[11px] mt-1 pt-1 border-t border-slate-200">
                    Direct Contact: {selectedJob.complaint?.requesterContact || selectedJob.complaint?.reporter?.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Defect Description */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Complaint Defect Scope
              </h5>
              <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                {selectedJob.complaint?.description || 'No defect description specified.'}
              </p>
            </div>

            {/* Supervisor Instructions */}
            {selectedJob.remarks && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                  Work Order Directives
                </span>
                <p>{selectedJob.remarks}</p>
              </div>
            )}

            {/* Existing Action Taken Reports */}
            {selectedJob.complaint?.atrs && selectedJob.complaint.atrs.length > 0 && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>Filed Action Taken Report (ATR)</span>
                </h5>
                {selectedJob.complaint.atrs.map((atr, idx) => (
                  <div key={idx} className="text-xs text-emerald-950 font-mono bg-white/90 p-3 rounded border border-emerald-100 space-y-1.5">
                    <p className="font-bold">{atr.actionTaken || atr.actionsTaken}</p>
                    {(atr.partsUsed || atr.materialsUsed) && (
                      <p className="text-[11px] text-emerald-800">
                        <span className="font-semibold">Parts Consumed: </span>
                        {atr.partsUsed || atr.materialsUsed}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-sans">
                      Submitted on {new Date(atr.submittedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Action Taken Report (ATR) Submission */}
      {atrModalJob && (
        <Modal
          isOpen={!!atrModalJob}
          onClose={() => setAtrModalJob(null)}
          title={`Submit ATR: #${atrModalJob.complaint?.ticketNumber || atrModalJob.complaint?.id || atrModalJob.id}`}
          subtitle="Record repair steps taken, replaced accessories, and verify closure readiness"
          icon={FileCheck}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmitAtr} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700">Location: </span>
                <span className="text-slate-900 font-medium">
                  {atrModalJob.complaint?.locationBuilding} • {atrModalJob.complaint?.roomAreaNumber}
                </span>
              </div>
              <CategoryBadge category={atrModalJob.complaint?.category || 'ELECTRICAL'} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Technician Profile
              </label>
              <input
                type="text"
                disabled
                value={`${user?.fullName || 'Technician'} (ID: ${user?.employeeId || 'EL001'})`}
                className="w-full text-xs p-2.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium"
              />
            </div>

            <Textarea
              label="Action Taken Report (ATR) Details"
              id="action-taken-input"
              rows={3}
              value={actionTakenText}
              onChange={(e) => setActionTakenText(e.target.value)}
              placeholder="e.g. Replaced defective 2.5 mfd capacitor, cleaned terminal contacts, tested load under 230V AC supply, verified normal operation..."
              required
              helperText="Detail the diagnosis and corrective repair procedures executed to resolve the defect."
            />

            <Input
              label="Parts / Accessories Consumed"
              id="parts-used-input"
              type="text"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              placeholder="e.g. 1x 2.5uF Capacitor, 2m 2.5 sq mm copper wire, 1x 16A MCB"
              icon={Package}
              helperText="Optional: specify campus maintenance inventory materials consumed."
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAtrModalJob(null)}
                disabled={isSubmittingAtr}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                icon={CheckCircle}
                isLoading={isSubmittingAtr}
              >
                Submit ATR & Mark Complete
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Dialog to Start Work */}
      <ConfirmationDialog
        isOpen={!!startDialogJob}
        type="info"
        title="Commence Repair Operations?"
        description={`Set work order #${
          startDialogJob?.complaint?.ticketNumber || startDialogJob?.complaint?.id || startDialogJob?.id
        } status to 'In Progress'? This updates the real-time tracking console for the HOD and requester.`}
        confirmLabel="Start Work"
        confirmVariant="primary"
        isLoading={isStartingJob}
        onClose={() => setStartDialogJob(null)}
        onConfirm={handleStartWork}
      />
    </div>
  );
}
