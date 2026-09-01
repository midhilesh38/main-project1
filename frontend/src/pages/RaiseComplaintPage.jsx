import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  Building,
  MapPin,
  Tag,
  AlertTriangle,
  FileText,
  Phone,
  PhoneCall,
  Mail,
  RotateCcw,
  Send,
  CheckCircle2,
  Copy,
  Clock,
  ListFilter,
  Radio,
  User,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { complaintService } from '../services/complaintService';
import { useToast } from '../components/Toast';

export const BUILDING_INTERCOMS = {
  'Main Academic Block': 'Ext 101 (Admin & Central Helpdesk)',
  'Science & Tech Block': 'Ext 201 (Science & Tech Dean Desk)',
  'Mechanical Engineering Block': 'Ext 301 (Mech & Civil Reception)',
  'Computer Science Complex': 'Ext 401 (IT Lab Control Room)',
  'Central Library Building': 'Ext 501 (Library Helpdesk)',
  'Auditorium & Indoor Stadium': 'Ext 601 (Auditorium Operations)',
  'Boys Hostel Complex': 'Ext 701 (Warden Office - Boys)',
  'Girls Hostel Complex': 'Ext 801 (Warden Office - Girls)',
  'Central Dining Hall': 'Ext 901 (Catering & Estate Maintenance)',
};

export const getBuildingIntercom = (building) => {
  return BUILDING_INTERCOMS[building] || (building ? `Ext 100 (${building})` : '');
};

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical (Fans, Lights, Sockets, Wiring, MCB)' },
  { value: 'AIR_CONDITIONING', label: 'Air Conditioning / HVAC Systems' },
  { value: 'PLUMBING', label: 'Plumbing & Water Supply' },
  { value: 'CARPENTER', label: 'Carpentry & Classroom Furniture' },
  { value: 'NETWORKING', label: 'Campus Network, LAN & Wi-Fi Access Points' },
  { value: 'CIVIL', label: 'Civil Maintenance & Structural' },
  { value: 'GENERAL', label: 'General Campus Repair' },
];

const PRIORITIES = [
  {
    value: 'LOW',
    label: 'Low',
    desc: 'Minor issue, non-urgent (SLA: 5-7 days)',
    border: 'hover:border-slate-400',
    activeBg: 'bg-slate-50 border-slate-600 ring-1 ring-slate-500',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    desc: 'Standard classroom/lab issue (SLA: 3 days)',
    border: 'hover:border-sky-400',
    activeBg: 'bg-sky-50 border-sky-600 ring-1 ring-sky-500',
  },
  {
    value: 'HIGH',
    label: 'High',
    desc: 'Impacts active academic classes/labs (SLA: 24 hrs)',
    border: 'hover:border-amber-400',
    activeBg: 'bg-amber-50 border-amber-600 ring-1 ring-amber-500',
  },
  {
    value: 'CRITICAL',
    label: 'Critical',
    desc: 'Safety hazard, power breakdown (SLA: Immediate)',
    border: 'hover:border-rose-400',
    activeBg: 'bg-rose-50 border-rose-600 ring-1 ring-rose-500',
  },
];

const BUILDINGS = [
  { value: 'Main Academic Block', label: 'Main Academic Block (Admin & Classes)' },
  { value: 'Science & Tech Block', label: 'Science & Humanities Tech Block' },
  { value: 'Mechanical Engineering Block', label: 'Mechanical & Civil Engineering Block' },
  { value: 'Computer Science Complex', label: 'CSE / IT Computing Center' },
  { value: 'Central Library Building', label: 'Central Library & Digital Hub' },
  { value: 'Auditorium & Indoor Stadium', label: 'Dr. M.G.R. Auditorium & Sports Arena' },
  { value: 'Boys Hostel Complex', label: 'Hostel Complex (Boys)' },
  { value: 'Girls Hostel Complex', label: 'Hostel Complex (Girls)' },
  { value: 'Central Dining Hall', label: 'Central Mess & Cafeteria' },
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultSlaDate = (priority = 'MEDIUM') => {
  const now = new Date();
  let days = 3;
  if (priority === 'CRITICAL' || priority === 'HIGH') days = 1;
  else if (priority === 'LOW') days = 5;
  const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function RaiseComplaintPage({ token, user, onNavigateToMyComplaints }) {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    locationBuilding: 'Main Academic Block',
    floorArea: '2nd Floor',
    roomAreaNumber: 'Lab 204',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    slaDueAt: getDefaultSlaDate('MEDIUM'),
    title: '',
    description: '',
    requesterContact: user?.phone || '9876543210',
    locationIntercom: getBuildingIntercom('Main Academic Block'),
    contactEmail: user?.email || 'staff@panimalar.ac.in',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requesterContact: user.phone || prev.requesterContact || '9876543210',
        contactEmail: user.email || prev.contactEmail || 'staff@panimalar.ac.in',
      }));
    }
  }, [user]);

  const handleChange = (field, value) => {
    if (field === 'locationBuilding') {
      const autoIntercom = getBuildingIntercom(value);
      setFormData((prev) => ({
        ...prev,
        locationBuilding: value,
        locationIntercom: autoIntercom,
      }));
      if (formErrors.locationBuilding) {
        setFormErrors((prev) => ({ ...prev, locationBuilding: null }));
      }
      if (formErrors.locationIntercom) {
        setFormErrors((prev) => ({ ...prev, locationIntercom: null }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePriorityChange = (newPriority) => {
    setFormData((prev) => {
      // If the current date is the default date for the previous priority, update it to the new default
      const prevDefault = getDefaultSlaDate(prev.priority);
      const shouldUpdateDate = !prev.slaDueAt || prev.slaDueAt === prevDefault;
      return {
        ...prev,
        priority: newPriority,
        slaDueAt: shouldUpdateDate ? getDefaultSlaDate(newPriority) : prev.slaDueAt,
      };
    });
    if (formErrors.priority) {
      setFormErrors((prev) => ({ ...prev, priority: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.locationBuilding?.trim()) errors.locationBuilding = 'Building location is required';
    if (!formData.roomAreaNumber?.trim()) errors.roomAreaNumber = 'Room/Lab number is required';
    if (!formData.category) errors.category = 'Please select a category';
    if (!formData.slaDueAt) {
      errors.slaDueAt = 'Target SLA date is required';
    } else if (formData.slaDueAt < getTodayDateString()) {
      errors.slaDueAt = 'Target SLA resolution date cannot be earlier than today';
    }
    if (!formData.description || formData.description.trim().length < 8) {
      errors.description = 'Please describe the defect in detail (minimum 8 characters)';
    }
    if (!formData.requesterContact?.trim()) {
      errors.requesterContact = 'Requester direct contact number is required';
    }
    if (!formData.locationIntercom?.trim()) {
      errors.locationIntercom = 'Location intercom extension is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    const defaultBuilding = 'Main Academic Block';
    setFormData({
      locationBuilding: defaultBuilding,
      floorArea: '',
      roomAreaNumber: '',
      category: 'ELECTRICAL',
      priority: 'MEDIUM',
      slaDueAt: getDefaultSlaDate('MEDIUM'),
      title: '',
      description: '',
      requesterContact: user?.phone || '',
      locationIntercom: getBuildingIntercom(defaultBuilding),
      contactEmail: user?.email || '',
    });
    setFormErrors({});
    setSubmittedTicket(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const generatedTitle =
        formData.title?.trim() ||
        `${formData.category} Fault at ${formData.locationBuilding} (${formData.roomAreaNumber})`;

      const result = await complaintService.registerComplaint(token, {
        ...formData,
        contactPhone: formData.requesterContact,
        title: generatedTitle,
      });

      const ticket = result.complaint || result.data || result;
      setSubmittedTicket({
        ...ticket,
        locationBuilding: ticket.locationBuilding || formData.locationBuilding,
        floorArea: ticket.floorArea !== undefined && ticket.floorArea !== null ? ticket.floorArea : formData.floorArea,
        roomAreaNumber: ticket.roomAreaNumber || formData.roomAreaNumber,
        requesterContact: ticket.requesterContact || formData.requesterContact,
        locationIntercom: ticket.locationIntercom || formData.locationIntercom,
      });
      showSuccess(
        `Ticket #${ticket.ticketNumber || ticket.id} registered successfully. Sent to HOD for approval.`,
        'Complaint Lodged'
      );
    } catch (err) {
      showError(err.message || 'Failed to register complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (submittedTicket?.ticketNumber || submittedTicket?.id) {
      navigator.clipboard.writeText(submittedTicket.ticketNumber || submittedTicket.id);
      showSuccess('Ticket number copied to clipboard', 'Copied');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raise Maintenance Complaint"
        description="Register institutional repair requests for electrical, plumbing, carpentry, and campus infrastructure."
        breadcrumbs={['Complaints', 'New Registration']}
        icon={FilePlus}
      />

      {/* Success Confirmation Card */}
      {submittedTicket && (
        <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <CardBody className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Complaint Successfully Registered & Logged
                  </h3>
                  <p className="text-xs text-slate-500">
                    A maintenance reference token has been generated and dispatched for HOD endorsement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#1a365d] text-white flex items-center gap-2 font-mono text-sm font-bold shadow-xs">
                  <span>{submittedTicket.ticketNumber || submittedTicket.id}</span>
                  <button
                    type="button"
                    onClick={copyTicketId}
                    className="text-amber-300 hover:text-white p-0.5"
                    title="Copy Ticket ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Location & Intercom</span>
                <p className="font-bold text-slate-800">
                  {submittedTicket.locationBuilding || 'Campus Building'}
                  {submittedTicket.roomAreaNumber ? ` • ${submittedTicket.roomAreaNumber}` : ''}
                </p>
                {submittedTicket.locationIntercom && (
                  <p className="text-sky-800 font-mono text-[11px] font-semibold flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-sky-600" />
                    {submittedTicket.locationIntercom}
                  </p>
                )}
                {submittedTicket.floorArea ? (
                  <p className="text-slate-600 font-medium">{submittedTicket.floorArea}</p>
                ) : (
                  <p className="text-slate-400 italic">No specific floor designated</p>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Requester Contact</span>
                <p className="font-bold text-slate-800 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {submittedTicket.requesterContact || 'Direct Contact Provided'}
                </p>
                <p className="text-slate-500">{user?.fullName || 'Requester'}</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Category & Priority</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <PriorityBadge priority={submittedTicket.priority} />
                  <StatusBadge status={submittedTicket.status || 'COMPLAINT_REGISTERED'} />
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Next Clearance Step</span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending HOD Approval
                </p>
                <p className="text-slate-500">Department Head verification queue</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
              >
                Log Another Complaint
              </Button>

              {onNavigateToMyComplaints && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ListFilter}
                  onClick={onNavigateToMyComplaints}
                >
                  Track in My Complaints
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Registration Form */}
      <Card>
        <CardHeader
          title="Equipment / Facility Complaint Form"
          subtitle="All fields marked with an asterisk (*) are mandatory for institutional audit tracking."
          icon={Building}
        />

        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {/* Section 1: Location Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1a365d]" />
                1. Location & Premises Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Campus Building / Block"
                  id="building-select"
                  value={formData.locationBuilding}
                  onChange={(e) => handleChange('locationBuilding', e.target.value)}
                  options={BUILDINGS}
                  required
                  error={formErrors.locationBuilding}
                />

                <Input
                  label="Floor / Wing / Area"
                  id="floor-input"
                  value={formData.floorArea}
                  onChange={(e) => handleChange('floorArea', e.target.value)}
                  placeholder="e.g. 2nd Floor / North Wing"
                />

                <Input
                  label="Room / Lab / Hall Number"
                  id="room-input"
                  value={formData.roomAreaNumber}
                  onChange={(e) => handleChange('roomAreaNumber', e.target.value)}
                  placeholder="e.g. Lab 204 or EEE Seminar Hall"
                  required
                  error={formErrors.roomAreaNumber}
                />
              </div>
            </div>

            {/* Section 2: Category & Priority */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#1a365d]" />
                2. Complaint Classification & Urgency
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Maintenance Category"
                  id="category-select"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={CATEGORIES}
                  required
                  error={formErrors.category}
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Urgency Priority Level <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => {
                      const isSelected = formData.priority === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => handlePriorityChange(p.value)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${p.border} ${
                            isSelected ? p.activeBg : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{p.label}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.value === 'CRITICAL'
                                  ? 'bg-rose-600'
                                  : p.value === 'HIGH'
                                  ? 'bg-amber-500'
                                  : p.value === 'MEDIUM'
                                  ? 'bg-sky-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">
                            {p.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SLA Target Resolution Date Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Target SLA Resolution Date"
                  id="sla-date-input"
                  type="date"
                  min={getTodayDateString()}
                  value={formData.slaDueAt}
                  onChange={(e) => handleChange('slaDueAt', e.target.value)}
                  required
                  icon={Clock}
                  error={formErrors.slaDueAt}
                  helperText="Auto-computed based on priority urgency; dates prior to today are disabled."
                />
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1a365d]" />
                3. Defect Description & Remarks
              </h4>

              <Textarea
                label="Detailed Description of Repair Needed"
                id="description-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Specify the exact issue, equipment condition, noise/spark/fault symptoms, and any immediate hazard..."
                required
                error={formErrors.description}
                helperText="Provide precise details to help technicians bring appropriate spare parts and tools."
              />
            </div>

            {/* Section 4: Contact & Premises Communication */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1a365d]" />
                4. Requester & Location Contact Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Requester Direct Contact"
                  id="requester-contact-input"
                  type="tel"
                  value={formData.requesterContact}
                  onChange={(e) => handleChange('requesterContact', e.target.value)}
                  placeholder="e.g. 9876543210 (Mobile)"
                  required
                  icon={Phone}
                  error={formErrors.requesterContact}
                  helperText="Auto-filled from user profile; technicians use this for direct coordination."
                />

                <Input
                  label="Location Intercom"
                  id="location-intercom-input"
                  type="text"
                  value={formData.locationIntercom}
                  onChange={(e) => handleChange('locationIntercom', e.target.value)}
                  placeholder="e.g. Ext 101"
                  required
                  icon={PhoneCall}
                  error={formErrors.locationIntercom}
                  helperText="Auto-filled based on selected campus building in Section 1."
                />

                <Input
                  label="Institutional Email"
                  id="email-input"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="e.g. staff.eee@panimalar.ac.in"
                  icon={Mail}
                  helperText="Official email for automated progress notifications."
                />
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset / Clear Form
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Submit Complaint for HOD Endorsement
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
