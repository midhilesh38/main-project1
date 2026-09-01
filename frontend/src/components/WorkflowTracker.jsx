import React from 'react';
import {
  FileText,
  UserCheck,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Archive,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export function WorkflowTracker({
  currentStatus = 'COMPLAINT_REGISTERED',
  hodApprovalStatus = 'PENDING',
  className = '',
  compact = false,
}) {
  const normalizedStatus = String(currentStatus || '').toUpperCase();
  const normalizedHod = String(hodApprovalStatus || '').toUpperCase();

  const isRejected = normalizedStatus === 'REJECTED' || normalizedHod === 'REJECTED';
  const isClosed =
    !isRejected &&
    (normalizedStatus === 'CLOSED' ||
      normalizedStatus === 'ARCHIVED' ||
      normalizedStatus === 'VERIFIED_AND_CLOSED');

  // Not resolved within the 3-day SLA / auto-escalation states (see backend
  // ComplaintStatus.OVERDUE / ESCALATED). These branch off the normal flow
  // rather than replacing any of the 6 core stages below.
  const isOverdue = !isRejected && !isClosed && normalizedStatus === 'OVERDUE';
  const isEscalated = !isRejected && !isClosed && normalizedStatus === 'ESCALATED';

  // Determine stage index: 0 to 5
  // 0: Complaint Registered
  // 1: HOD Approval
  // 2: Electrician Assigned
  // 3: Repair / Action Taken
  // 4: Verification
  // 5: Closed
  let currentStageIndex = 0;

  if (isRejected) {
    currentStageIndex = 1;
  } else if (isClosed) {
    currentStageIndex = 5;
  } else if (isOverdue || isEscalated) {
    currentStageIndex = 3;
  } else if (normalizedStatus === 'VERIFIED' || normalizedStatus === 'VERIFICATION') {
    currentStageIndex = 4;
  } else if (
    normalizedStatus === 'ACTION_TAKEN' ||
    normalizedStatus === 'WORK_COMPLETED' ||
    normalizedStatus === 'COMPLETED' ||
    normalizedStatus === 'IN_PROGRESS'
  ) {
    currentStageIndex = 3;
  } else if (
    normalizedStatus === 'REPAIR_ASSIGNED' ||
    normalizedStatus === 'ASSIGNED'
  ) {
    currentStageIndex = 2;
  } else if (normalizedHod === 'APPROVED' || normalizedStatus === 'APPROVED') {
    currentStageIndex = 2;
  } else if (normalizedStatus === 'COMPLAINT_REGISTERED' || normalizedHod === 'PENDING') {
    currentStageIndex = 1;
  }

  const steps = [
    {
      id: 0,
      title: 'Complaint Registered',
      shortTitle: 'Registered',
      icon: FileText,
      description: 'Submitted into PEC system',
    },
    {
      id: 1,
      title: 'HOD Approval',
      shortTitle: 'HOD Review',
      icon: isRejected ? XCircle : UserCheck,
      description: isRejected ? 'Department Rejected' : 'Department clearance',
    },
    {
      id: 2,
      title: 'Electrician Assigned',
      shortTitle: 'Assigned',
      icon: Wrench,
      description: 'Allocated to maintenance crew',
    },
    {
      id: 3,
      title: 'Action Taken (ATR)',
      shortTitle: 'Repair / ATR',
      icon: isEscalated || isOverdue ? AlertTriangle : CheckCircle2,
      description: isEscalated
        ? 'Not resolved within 3-day SLA — escalated'
        : isOverdue
        ? 'Nearing / past 3-day SLA window'
        : 'Technician resolution & ATR report',
    },
    {
      id: 4,
      title: 'Verification',
      shortTitle: 'Verification',
      icon: ShieldCheck,
      description: 'HOD verifies work before closure',
    },
    {
      id: 5,
      title: 'Closed',
      shortTitle: 'Closed',
      icon: Archive,
      description: 'Report shared with Manager, HOD & Dean IQAC',
    },
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 overflow-x-auto py-1 ${className}`}>
        {steps.map((step, idx) => {
          const isDone = !isRejected && (idx < currentStageIndex || (isClosed && idx <= 5));
          const isCurrent = !isClosed && idx === currentStageIndex;
          const isAtRisk = isCurrent && (isOverdue || isEscalated);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border ${
                  isRejected && isCurrent
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isAtRisk
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300/60'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isCurrent
                    ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.shortTitle}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-slate-300 font-bold text-xs">→</span>
              )}
            </React.Fragment>
          );
        })}
        {(isOverdue || isEscalated) && (
          <>
            <span className="text-rose-300 font-bold text-xs">→</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap border bg-rose-600 text-white border-rose-600 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isEscalated ? 'Escalated' : 'Overdue (> 3 Days)'}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#1a365d]" />
          Resolution Workflow Progress
        </h4>
        <span
          className={`text-xs font-semibold ${
            isEscalated || isOverdue ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {isRejected
            ? 'Workflow Terminated (Rejected)'
            : isClosed
            ? 'Lifecycle Complete (Closed)'
            : isEscalated
            ? 'Not Resolved Within 3 Days — Escalated'
            : isOverdue
            ? 'Approaching 3-Day SLA — Overdue'
            : `Stage ${Math.min(currentStageIndex + 1, 6)} of 6`}
        </span>
      </div>

      <div className="relative">
        {/* Desktop / Tablet Line Layout */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 relative">
          {steps.map((step, idx) => {
            const isDone = !isRejected && (idx < currentStageIndex || (isClosed && idx <= 5));
            const isCurrent = !isClosed && idx === currentStageIndex;
            const isAtRisk = isCurrent && (isOverdue || isEscalated);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`relative flex flex-col items-center text-center p-2.5 rounded-lg border transition-all ${
                  isRejected && isCurrent
                    ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20'
                    : isAtRisk
                    ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/30 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : isCurrent
                    ? 'bg-[#1a365d]/5 border-[#1a365d] ring-2 ring-[#1a365d]/20 shadow-xs'
                    : 'bg-white border-slate-200/70 opacity-65'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 font-bold text-xs ${
                    isRejected && isCurrent
                      ? 'bg-rose-600 text-white'
                      : isAtRisk
                      ? 'bg-rose-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#1a365d] text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Title */}
                <div className="space-y-0.5">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isRejected && isCurrent
                        ? 'text-rose-900'
                        : isAtRisk
                        ? 'text-rose-900'
                        : isDone
                        ? 'text-emerald-900'
                        : isCurrent
                        ? 'text-[#1a365d]'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escalation Alert — surfaces the "not resolved within 3 days" / auto-escalation
          keypoints from the workflow spec (SLA breach, no update in 24 hours, or HOD
          marking not-resolved), and where the alert is routed. */}
      {(isOverdue || isEscalated) && (
        <div className="mt-3 p-3 rounded-lg border border-rose-300 bg-rose-50/80 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-rose-800">
              {isEscalated
                ? 'Escalation Triggered — Not Resolved Within 3 Days'
                : 'Approaching SLA Breach — Ticket Not Yet Resolved'}
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5 leading-snug">
              Auto-escalates on: ticket unresolved past the 3-day SLA, no update for
              over 24 hours, or marked "Not Resolved" by HOD. Alerts are sent to the
              Manager, HOD, Dean IQAC &amp; Electrician Head via Email, Dashboard
              Notification and SMS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
