// Shared repair ticket lifecycle status configuration.
// Backend status values are kept unchanged.
// These labels are for consistent frontend display only.

export const TICKET_STATUS_LABELS = {
  COMPLAINT_REGISTERED: 'Submitted',

  APPROVED: 'HOD Approved',

  AWAITING_ALLOCATION: 'Awaiting Allocation',

  ASSIGNED: 'Electrician Assigned',
  REPAIR_ASSIGNED: 'Electrician Assigned',

  IN_PROGRESS: 'In Progress',

  ACTION_TAKEN: 'ATR Submitted',
  COMPLETED: 'ATR Submitted',
  WORK_COMPLETED: 'ATR Submitted',

  VERIFICATION: 'HOD Verified',
  VERIFIED: 'HOD Verified',

  CLOSED: 'Closed',
};

export const TICKET_LIFECYCLE = [
  {
    key: 'COMPLAINT_REGISTERED',
    label: 'Submitted',
  },
  {
    key: 'APPROVED',
    label: 'HOD Approved',
  },
  {
    key: 'AWAITING_ALLOCATION',
    label: 'Awaiting Allocation',
  },
  {
    key: 'ASSIGNED',
    label: 'Electrician Assigned',
  },
  {
    key: 'IN_PROGRESS',
    label: 'In Progress',
  },
  {
    key: 'ACTION_TAKEN',
    label: 'ATR Submitted',
  },
  {
    key: 'VERIFICATION',
    label: 'HOD Verified',
  },
  {
    key: 'CLOSED',
    label: 'Closed',
  },
];

export function getTicketStatusLabel(status) {
  const normalized = String(status || '').toUpperCase();

  return (
    TICKET_STATUS_LABELS[normalized] ||
    normalized.replace(/_/g, ' ') ||
    'Unknown'
  );
}