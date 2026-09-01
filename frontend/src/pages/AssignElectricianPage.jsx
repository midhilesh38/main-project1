import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  RefreshCw,
  Wrench,
  UserCheck,
  Building,
  Clock,
  Send,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Select, Textarea } from '../components/Input';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { ticketService } from '../services/ticketService';
import { useToast } from '../components/Toast';

export function AssignElectricianPage({ token, user }) {
  const { showSuccess, showError } = useToast();

  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Assign Modal State
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [selectedElectricianId, setSelectedElectricianId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [priorityOverride, setPriorityOverride] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchTicketsAndElectricians = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsData, electriciansData] = await Promise.all([
        ticketService.getUnassignedTickets(token),
        ticketService.getElectricians(token).catch(() => ({ electricians: [] })),
      ]);

      const rawTickets = ticketsData.tickets || ticketsData.complaints || [];
      const normalizedTickets = rawTickets.map((t) => {
        const c = t.complaint || t;
        return {
          ...c,
          id: c.id || t.id || t.complaintId,
          ticketNumber: c.ticketNumber || t.ticketNumber,
          title: c.title || t.title,
          category: c.category || t.category,
          priority: c.priority || t.priority,
          description: c.description || t.description,
          locationBuilding: c.locationBuilding || t.locationBuilding,
          floorArea: c.floorArea || t.floorArea,
          roomAreaNumber: c.roomAreaNumber || t.roomAreaNumber,
          reporter: c.reporter || t.reporter,
          department: c.department || t.department,
          hodApprovalStatus: c.hodApprovalStatus || t.hodApprovalStatus || 'APPROVED',
          slaDueAt: c.slaDueAt || t.slaDueAt,
        };
      });

      setUnassignedTickets(normalizedTickets);

      const techs = electriciansData.electricians || electriciansData.technicians || [];
      setElectricians(techs);
    } catch (err) {
      showError(err.message || 'Failed to retrieve unassigned complaints');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchTicketsAndElectricians();
  }, [fetchTicketsAndElectricians]);

  const filteredTickets = unassignedTickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.locationBuilding?.toLowerCase().includes(q) ||
      t.roomAreaNumber?.toLowerCase().includes(q);

    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleOpenAssignModal = (ticket) => {
    setAssignModalTicket(ticket);
    setSelectedElectricianId(electricians[0]?.id || '');
    setInstructions('');
    setPriorityOverride(ticket.priority || 'MEDIUM');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalTicket || !selectedElectricianId) {
      showError('Please choose an electrician from the roster.');
      return;
    }

    setIsAssigning(true);
    try {
      await ticketService.assignElectrician(
        token,
        assignModalTicket.id,
        selectedElectricianId,
        instructions
      );

      const assignedTech = electricians.find((el) => el.id === selectedElectricianId);
      showSuccess(
        `Ticket #${assignModalTicket.ticketNumber || assignModalTicket.id} assigned to ${
          assignedTech?.fullName || 'technician'
        }.`,
        'Electrician Allocated'
      );

      setAssignModalTicket(null);
      fetchTicketsAndElectricians();
    } catch (err) {
      showError(err.message || 'Failed to assign electrician');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Electrician & Work Order Allocation"
        description="Allocate approved departmental repair complaints to active campus maintenance electricians."
        breadcrumbs={['Maintenance Cell', 'Allocation']}
        icon={UserPlus}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchTicketsAndElectricians}
            isLoading={isLoading}
          >
            Refresh Queue
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search approved tickets by ID, Lab, or Building..."
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 rounded-md border border-slate-200 focus:bg-white focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton rows={4} type="table" />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Unassigned Approved Tickets"
          description={
            searchQuery || priorityFilter !== 'ALL'
              ? 'No tickets match the search query.'
              : 'All HOD-approved repair requests have been assigned to technicians.'
          }
          actionLabel="Refresh Tickets"
          onAction={fetchTicketsAndElectricians}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} hover className="flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1a365d]">
                      {ticket.ticketNumber || ticket.id}
                    </span>
                    <CategoryBadge category={ticket.category} />
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {ticket.title || `${ticket.category} Issue`}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ticket.locationBuilding} • <span className="font-semibold text-slate-700">{ticket.roomAreaNumber}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                    {ticket.description}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Approval Status:</span>
                      <span className="font-semibold text-blue-700">HOD Approved</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requester:</span>
                      <span className="font-medium text-slate-700">{ticket.reporter?.fullName || 'Staff'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  icon={Wrench}
                  onClick={() => handleOpenAssignModal(ticket)}
                >
                  Allocate Electrician
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignModalTicket && (
        <Modal
          isOpen={!!assignModalTicket}
          onClose={() => setAssignModalTicket(null)}
          title={`Allocate Work Order: #${assignModalTicket.ticketNumber || assignModalTicket.id}`}
          subtitle="Assign maintenance crew member and dispatch task order"
          icon={UserPlus}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Premises Location:</span>
                <span className="font-semibold text-slate-900">
                  {assignModalTicket.locationBuilding} • {assignModalTicket.roomAreaNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Issue Category:</span>
                <CategoryBadge category={assignModalTicket.category} />
              </div>
              <div className="pt-1 text-slate-600 font-mono line-clamp-2">
                {assignModalTicket.description}
              </div>
            </div>

            {/* Electrician Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Field Electrician / Technician <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={selectedElectricianId}
                onChange={(e) => setSelectedElectricianId(e.target.value)}
                required
                className="w-full p-2.5 text-sm rounded-md border border-slate-300 bg-white focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
              >
                <option value="">-- Choose Active Technician --</option>
                {electricians.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.fullName} (ID: {el.employeeId || 'EL'}) - {el.role?.replace(/_/g, ' ') || 'Electrician'}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Override Option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Task Execution Priority
              </label>
              <select
                value={priorityOverride}
                onChange={(e) => setPriorityOverride(e.target.value)}
                className="w-full p-2.5 text-sm rounded-md border border-slate-300 bg-white focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
              >
                <option value="CRITICAL">Critical (Immediate Response)</option>
                <option value="HIGH">High (24 Hours SLA)</option>
                <option value="MEDIUM">Medium (Standard 3 Days)</option>
                <option value="LOW">Low (Routine Maintenance)</option>
              </select>
            </div>

            {/* Instructions */}
            <Textarea
              label="Work Order Instructions & Tool Requirements"
              id="instructions-textarea"
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Inspect capacitor, bring 2.5 sq mm copper wire, check DB board MCB tripping..."
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignModalTicket(null)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                isLoading={isAssigning}
              >
                Confirm & Dispatch Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
