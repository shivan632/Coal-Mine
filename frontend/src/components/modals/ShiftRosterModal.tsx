import React, { useState } from 'react';
import { X, Users, Search, Clock, Heart, Phone, ShieldCheck, AlertOctagon, Filter } from 'lucide-react';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { WorkerInferenceResult } from '../../types/dashboard';

interface ShiftRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXTENDED_ROSTER: WorkerInferenceResult[] = [
  {
    workerId: 'MINER-4091',
    name: 'Rajesh Kumar',
    role: 'Deep Shaft Operator',
    zone: 'Tunnel-A04',
    bloodGroup: 'O+',
    emergencyContact: '+91 98450 12890',
    shiftStartTimestamp: Date.now() - 4.5 * 3600000,
    undergroundMinutes: 270,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    confidence: 99.2,
    ppeCompliance: { helmet: true, safetyJacket: true, respiratorMask: true, steelBoots: true, gloves: true },
    verdict: 'ALL CORRECT',
    missingItems: [],
    turnstileBarrierState: 'UNLOCKED',
    lastScanned: Date.now(),
  },
  {
    workerId: 'MINER-8422',
    name: 'Devendra Singh',
    role: 'Excavation Drill Master',
    zone: 'Gas-Zone-B12',
    bloodGroup: 'B+',
    emergencyContact: '+91 98231 44520',
    shiftStartTimestamp: Date.now() - 3.2 * 3600000,
    undergroundMinutes: 192,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    confidence: 97.8,
    ppeCompliance: { helmet: false, safetyJacket: true, respiratorMask: false, steelBoots: true, gloves: false },
    verdict: 'SOMETHING IS MISSING!',
    missingItems: ['Helmet', 'Respirator Mask', 'Protective Gloves'],
    turnstileBarrierState: 'LOCKED',
    lastScanned: Date.now() - 45000,
  },
  {
    workerId: 'MINER-1290',
    name: 'Amitabh Sharma',
    role: 'Ventilation Tech',
    zone: 'Shaft-01',
    bloodGroup: 'A+',
    emergencyContact: '+91 94120 77310',
    shiftStartTimestamp: Date.now() - 6.8 * 3600000,
    undergroundMinutes: 408,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    confidence: 98.6,
    ppeCompliance: { helmet: true, safetyJacket: true, respiratorMask: true, steelBoots: true, gloves: true },
    verdict: 'ALL CORRECT',
    missingItems: [],
    turnstileBarrierState: 'UNLOCKED',
    lastScanned: Date.now() - 90000,
  },
  {
    workerId: 'MINER-6743',
    name: 'Sunil Mondal',
    role: 'Conveyor Loader',
    zone: 'Conveyor-C02',
    bloodGroup: 'AB+',
    emergencyContact: '+91 91560 99401',
    shiftStartTimestamp: Date.now() - 5.1 * 3600000,
    undergroundMinutes: 306,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    confidence: 96.4,
    ppeCompliance: { helmet: false, safetyJacket: true, respiratorMask: false, steelBoots: true, gloves: false },
    verdict: 'SOMETHING IS MISSING!',
    missingItems: ['Helmet', 'Respirator Mask', 'Protective Gloves'],
    turnstileBarrierState: 'LOCKED',
    lastScanned: Date.now() - 140000,
  },
  {
    workerId: 'MINER-5519',
    name: 'Prakash Soren',
    role: 'Longwall Specialist',
    zone: 'Excavation-Face',
    bloodGroup: 'O-',
    emergencyContact: '+91 97312 88204',
    shiftStartTimestamp: Date.now() - 2.0 * 3600000,
    undergroundMinutes: 120,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    confidence: 99.0,
    ppeCompliance: { helmet: true, safetyJacket: true, respiratorMask: true, steelBoots: true, gloves: true },
    verdict: 'ALL CORRECT',
    missingItems: [],
    turnstileBarrierState: 'UNLOCKED',
    lastScanned: Date.now() - 200000,
  },
];

export const ShiftRosterModal: React.FC<ShiftRosterModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredMiners = EXTENDED_ROSTER.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || m.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border border-cyan-500/40 bg-[#06111F]/95 shadow-[0_0_50px_rgba(0,212,255,0.25)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/25 bg-[#0A1A2E]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-hud text-base font-bold text-white tracking-wider uppercase">
                UNDERGROUND SHIFT ROSTER & DIGITAL TAG-BOARD
              </h3>
              <p className="text-xs font-mono text-cyan-400">
                ACTIVE PERSONNEL TRACKING & HEAT-EXHAUSTION COUNTERS (DGMS REG. 115)
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

        {/* Filter / Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-cyan-500/20 bg-[#061424]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search by Miner Name, Worker ID, Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-cyan-300 text-xs font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Sectors</option>
              <option value="Shaft-01">Shaft-01</option>
              <option value="Tunnel-A04">Tunnel-A04</option>
              <option value="Gas-Zone-B12">Gas-Zone-B12</option>
              <option value="Conveyor-C02">Conveyor-C02</option>
              <option value="Excavation-Face">Excavation-Face</option>
            </select>
          </div>
        </div>

        {/* Roster Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredMiners.map((miner) => {
            const hours = Math.floor(miner.undergroundMinutes / 60);
            const mins = miner.undergroundMinutes % 60;
            const isHeatRisk = miner.undergroundMinutes > 360; // > 6 hours

            return (
              <div
                key={miner.workerId}
                className="p-4 rounded-xl border border-cyan-500/20 bg-[#091D33]/80 hover:border-cyan-400/50 transition-all flex flex-wrap items-center justify-between gap-4"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={miner.photoUrl || '/assets/miners/rajesh.jpg'}
                    alt={miner.name}
                    className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-hud text-sm font-bold text-white">{miner.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        {miner.workerId}
                      </span>
                    </div>
                    <span className="text-xs font-tech text-slate-300 block">{miner.role}</span>
                    <span className="text-[10px] font-mono text-cyan-400">SECTOR: {miner.zone}</span>
                  </div>
                </div>

                {/* Middle: Medical & Emergency info */}
                <div className="flex flex-col gap-1 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Blood Group: <strong className="text-white">{miner.bloodGroup}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SOS Contact: {miner.emergencyContact}</span>
                  </div>
                </div>

                {/* Right: Shift Timer & Heat Exhaustion Indicator */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Time Under: <strong>{hours}h {mins}m</strong> / 8h</span>
                  </div>

                  {isHeatRisk ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-400 border border-amber-500/50 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" />
                      HEAT ROTATION DUE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      STABLE SHIFT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#0A1A2E]/90 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>SHOWING {filteredMiners.length} UNDERGROUND MINERS</span>
          <span className="text-cyan-400 font-bold">TAG-BOARD AUTO-SYNCED (20Hz)</span>
        </div>
      </div>
    </div>
  );
};
