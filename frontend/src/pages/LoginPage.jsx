import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  KeyRound,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { PanimalarLogo, AnniversaryBadge } from '../components/PanimalarLogo';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { DEMO_USERS } from '../services/authService';

export function LoginPage({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('supervisor1');
  const [password, setPassword] = useState('LocalSupervisor!2026');
  const [role, setRole] = useState('SUPERVISOR');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleSelectChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    const demo = DEMO_USERS.find((u) => u.role === selectedRole);
    if (demo) {
      setEmployeeId(demo.username);
      setPassword(demo.password);
    }
  };

  const handleQuickFill = (demo) => {
    setRole(demo.role);
    setEmployeeId(demo.username);
    setPassword(demo.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!employeeId.trim()) {
      setError('Please enter your Employee ID / Institutional ID / Register Number');
      return;
    }

    if (!password) {
      setError('Please enter your account password');
      return;
    }

    setIsLoading(true);
    try {
      await onLoginSuccess(employeeId.trim(), password, role);
    } catch (err) {
      setError(
        err.message || 'Authentication failed. Please verify your credentials or contact Central Maintenance Cell.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Banner Header */}
      <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <PanimalarLogo className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Panimalar Engineering College
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              An Autonomous Institution | Affiliated to Anna University, Chennai
            </p>
          </div>
        </div>
        <AnniversaryBadge />
      </div>

      {/* Main Login Container */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Institutional Card Header */}
          <div className="bg-[#0b1e33] px-6 py-6 text-center text-white border-b border-[#16365a]">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-b from-[#1a365d] to-[#0f2439] border border-amber-400/40 shadow-inner mb-3">
              <PanimalarLogo className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Repair & Maintenance Management System
            </h2>
            <p className="text-xs text-amber-300 font-medium tracking-wide mt-1">
              PEC-RMMS • Institutional Portal
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Authentication Error</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <Select
                label="Select Access Role"
                id="role-select"
                value={role}
                onChange={handleRoleSelectChange}
                required
                icon={ShieldCheck}
                options={[
                  { value: 'SUPERVISOR', label: 'Staff / Department Supervisor' },
                  { value: 'HOD', label: 'Head of Department (HOD)' },
                  { value: 'ELECTRICIAN_HEAD', label: 'Electrician Head / Maintenance Cell' },
                  { value: 'ELECTRICIAN', label: 'Field Electrician / Technician' },
                  { value: 'MANAGER', label: 'Estate / Facility Manager' },
                ]}
              />

              {/* Employee ID / Institutional ID */}
              <Input
                label="Employee ID / Register Number / Username"
                id="employee-id-input"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. supervisor1 or SUP001"
                required
                icon={User}
                autoComplete="username"
              />

              {/* Password */}
              <Input
                label="Account Password"
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your security password"
                required
                icon={Lock}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-bold tracking-wide shadow-md"
                isLoading={isLoading}
              >
                Sign In to PEC-RMMS
              </Button>
            </form>

            {/* Quick Demo Credentials Preset Bar for Testing */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#1a365d]" />
                  Quick-Fill Demo Credentials
                </span>
                <span className="text-[10px] text-slate-400">Click to load</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleQuickFill(demo)}
                    className={`px-2.5 py-1.5 rounded text-left border text-[11px] transition-all ${
                      role === demo.role && employeeId === demo.username
                        ? 'bg-blue-50/80 border-[#1a365d] text-[#1a365d] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="truncate font-semibold">{demo.roleLabel.split('/')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{demo.username}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>
              Central Maintenance Cell • Helpline Ext: <span className="font-semibold text-slate-700">302</span>
            </p>
          </div>
        </div>
      </div>

      {/* Page Bottom Copyright */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 py-2">
        <p>© 2026 Panimalar Engineering College (Autonomous). All Rights Reserved.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Accessories Repair & Action Taken Report (ATR) Management Framework
        </p>
      </footer>
    </div>
  );
}
