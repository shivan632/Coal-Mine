import React, { useState } from 'react';
import { X, ShieldCheck, FileCheck, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { IncidentAlert } from '../../types/dashboard';
import { useAlertStore } from '../../stores/useAlertStore';
import { soundEffects } from '../../services/soundEffects';

interface IncidentSignoffModalProps {
  alert: IncidentAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentSignoffModal: React.FC<IncidentSignoffModalProps> = ({ alert, isOpen, onClose }) => {
  const [supervisorName, setSupervisorName] = useState('Er. Anil Deshmukh');
  const [badgeId, setBadgeId] = useState('DGMS-SUP-9081');
  const [correctiveAction, setCorrectiveAction] = useState('Auxiliary scrubber started. Section power cut verified. Turnstile locked until gas levels < 0.75%.');
  const [submitted, setSubmitted] = useState(false);

  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);

  if (!isOpen || !alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alert) {
      acknowledgeAlert(alert.id);
      setSubmitted(true);
      soundEffects.playSuccess();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#06111F]/95 shadow-[0_0_50px_rgba(0,212,255,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/25 bg-[#0A1A2E]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-hud text-base font-bold text-white tracking-wider uppercase">
                SUPERVISOR INCIDENT AUDIT & SIGN-OFF
              </h3>
              <p className="text-xs font-mono text-cyan-400">
                STATUTORY COMPLIANCE DECLARATION (DGMS REG. 182)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:border-cyan-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Incident Summary Card */}
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-xs font-mono">
            <div className="flex items-center justify-between mb-1">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {alert.title}
              </span>
              <span className="text-[10px] text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-slate-300">{alert.description}</p>
            <div className="mt-2 pt-2 border-t border-rose-500/20 text-[10px] text-cyan-300">
              REGULATORY CLAUSE: {alert.regulatoryClause || 'DGMS Reg. 153(2)'}
            </div>
          </div>

          {/* Supervisor Name Input */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Supervisor Full Name (DGMS Certified):
            </label>
            <input
              type="text"
              required
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Badge Number */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Officer Badge Number / Registration:
            </label>
            <input
              type="text"
              required
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Corrective Action Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Corrective Action / Mitigation Protocol Executed:
            </label>
            <textarea
              rows={3}
              required
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Digital Signature Hash Simulation */}
          <div className="p-2.5 rounded-lg bg-[#040D18] border border-cyan-500/20 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <UserCheck className="w-3.5 h-3.5" />
              DIGITAL SIGNATURE HASH
            </span>
            <span className="text-slate-500">SHA-256: e8f9...4b12 (Auto-Signed)</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-2.5 rounded-xl font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                submitted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,212,255,0.4)]'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>INCIDENT SIGNED & AUDITED ✓</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>APPLY STATUTORY SIGNATURE & RESOLVE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
