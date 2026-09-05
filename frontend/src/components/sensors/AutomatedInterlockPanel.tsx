import React, { useState } from 'react';
import {
  Zap,
  Fan,
  ShieldCheck,
  ShieldAlert,
  Power,
  RotateCcw,
  Sliders,
  FileCheck,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { telemetryStream } from '../../services/telemetryStream';
import { MineZoneId } from '../../types/dashboard';

export const AutomatedInterlockPanel: React.FC = () => {
  const activeZone = useTelemetryStore((state) => state.activeZone);
  const setActiveZone = useTelemetryStore((state) => state.setActiveZone);
  const interlockState = useTelemetryStore((state) => state.interlockState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const zones: MineZoneId[] = [
    'Shaft-01',
    'Tunnel-A04',
    'Gas-Zone-B12',
    'Conveyor-C02',
    'Excavation-Face',
  ];

  const zoneState = interlockState?.zones[activeZone] || {
    zone: activeZone,
    sectionPower: 'ACTIVE',
    ventilationFan: 'NORMAL',
    turnstileGating: 'UNLOCKED',
    autoInterlockArmed: true,
  };

  const isPowerCutoff = zoneState.sectionPower === 'CUTOFF';
  const isFanOverdrive = zoneState.ventilationFan === 'OVERDRIVE';
  const isAutoArmed = interlockState?.autoContainmentArmed ?? true;
  const isTurnstileLocked = zoneState.turnstileGating === 'LOCKED';

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleTogglePower = async () => {
    setIsProcessing(true);
    const nextAction = isPowerCutoff ? 'RESTORE_POWER' : 'CUT_POWER';
    const res = await telemetryStream.sendCommand({
      action: nextAction,
      zone: activeZone,
      supervisorName: 'Control Supervisor',
      badgeId: 'AUTH-SUP-8821',
      reason: isPowerCutoff
        ? 'Manual breaker re-energize after sector clearance'
        : 'Emergency manual section cutoff trip',
    });
    setIsProcessing(false);
    showNotification(res.message);
  };

  const handleToggleFan = async () => {
    setIsProcessing(true);
    const nextAction = isFanOverdrive ? 'SET_FAN_NORMAL' : 'SET_FAN_OVERDRIVE';
    const res = await telemetryStream.sendCommand({
      action: nextAction,
      zone: activeZone,
      supervisorName: 'Ventilation Officer',
      badgeId: 'AUTH-VENT-402',
      reason: isFanOverdrive
        ? 'Restoring scrubber speed to standard nominal RPM'
        : '100% maximum ventilation overdrive purge command',
    });
    setIsProcessing(false);
    showNotification(res.message);
  };

  const handleToggleAutoArm = async () => {
    setIsProcessing(true);
    const res = await telemetryStream.sendCommand({
      action: 'TOGGLE_AUTO_ARM',
      zone: activeZone,
      supervisorName: 'Chief Inspector',
      badgeId: 'AUTH-REG-001',
      reason: 'Safety Containment Closed-Loop Auto-Trip Toggle',
    });
    setIsProcessing(false);
    showNotification(res.message);
  };

  const handleToggleTurnstile = async () => {
    setIsProcessing(true);
    const nextAction = isTurnstileLocked ? 'UNLOCK_TURNSTILE' : 'LOCK_TURNSTILE';
    const res = await telemetryStream.sendCommand({
      action: nextAction,
      zone: activeZone,
      supervisorName: 'Security Master',
      badgeId: 'AUTH-GATE-11',
      reason: isTurnstileLocked ? 'Operator gate unlock' : 'Emergency perimeter containment lock',
    });
    setIsProcessing(false);
    showNotification(res.message);
  };

  const recentLogs = interlockState?.recentAuditLogs || [];

  return (
    <div className="flex flex-col rounded-xl border border-cyan-500/30 bg-[#06111F]/90 backdrop-blur-xl p-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            AUTOMATED INTERLOCKING & CONTAINMENT SUBSTATION
          </h3>
        </div>

        {/* Auto-Interlock Armed Badge / Toggle Button */}
        <button
          type="button"
          onClick={handleToggleAutoArm}
          title="Click to Toggle Automated Safety Containment"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
            isAutoArmed
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-900/80'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/50 hover:bg-rose-900/80 animate-pulse'
          }`}
        >
          {isAutoArmed ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>LOOP: ARMED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>LOOP: OVERRIDDEN</span>
            </>
          )}
        </button>
      </div>

      {/* Sector Quick-Select Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
        {zones.map((z) => {
          const state = interlockState?.zones[z];
          const isSelected = activeZone === z;
          const isTripped = state?.sectionPower === 'CUTOFF';

          return (
            <button
              key={z}
              type="button"
              onClick={() => setActiveZone(z)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.3)] font-bold'
                  : 'bg-[#091B2E]/70 text-slate-400 border-slate-700/60 hover:text-white hover:border-cyan-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isTripped ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span>{z}</span>
              {isTripped && <span className="text-[9px] text-rose-400 font-bold">[TRIPPED]</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="mb-2 px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 text-center animate-fade-in">
          {feedbackMsg}
        </div>
      )}

      {/* Two Subsystem Breaker Modules: 1. Grid Power & 2. Scrubber Ventilation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        {/* Module 1: Substation Section Circuit Breaker */}
        <div
          className={`rounded-xl p-3 border transition-all flex flex-col justify-between ${
            isPowerCutoff
              ? 'bg-gradient-to-br from-rose-950/50 via-[#180914] to-[#0a1829] border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-[#071626]/80 border-cyan-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-hud text-[11px] font-bold text-slate-200 tracking-wider">
                SECTION POWER GRID
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  isPowerCutoff
                    ? 'bg-rose-900/80 text-rose-300 border border-rose-500/60'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {zoneState.sectionPower}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isPowerCutoff
                    ? 'bg-rose-950 border-rose-500/60 shadow-[0_0_10px_#F43F5E]'
                    : 'bg-cyan-950 border-cyan-500/50 shadow-[0_0_10px_#00D4FF]'
                }`}
              >
                <Zap
                  className={`w-4 h-4 ${
                    isPowerCutoff ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
                  }`}
                />
              </div>

              <div>
                <div className="font-mono text-sm font-bold text-white">
                  {isPowerCutoff ? 'CIRCUIT TRIPPED' : '415V 3-PHASE ACTIVE'}
                </div>
                <p className="text-[9px] font-mono text-slate-400">
                  {isPowerCutoff ? 'High gas containment cutoff' : 'Machinery & lighting energized'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-400">DGMS Sec. 153 Trip</span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleTogglePower}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isPowerCutoff
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{isPowerCutoff ? 'RESTORE POWER' : 'TRIP BREAKER'}</span>
            </button>
          </div>
        </div>

        {/* Module 2: Auxiliary Scrubber Fan System */}
        <div
          className={`rounded-xl p-3 border transition-all flex flex-col justify-between ${
            isFanOverdrive
              ? 'bg-gradient-to-br from-cyan-950/50 via-[#0a1b2e] to-[#081524] border-cyan-400/60 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              : 'bg-[#071626]/80 border-cyan-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-hud text-[11px] font-bold text-slate-200 tracking-wider">
                VENTILATION SCRUBBER
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  isFanOverdrive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                    : 'bg-slate-900 text-slate-300 border border-slate-700'
                }`}
              >
                {zoneState.ventilationFan}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isFanOverdrive
                    ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_10px_#00D4FF]'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <Fan
                  className={`w-4 h-4 text-cyan-400 ${
                    isFanOverdrive ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: isFanOverdrive ? '0.4s' : '2.0s' }}
                />
              </div>

              <div>
                <div className="font-mono text-sm font-bold text-white">
                  {isFanOverdrive ? '100% OVERDRIVE (3500 RPM)' : 'NOMINAL VELOCITY (1200 RPM)'}
                </div>
                <p className="text-[9px] font-mono text-slate-400">
                  {isFanOverdrive ? 'Maximum suction & air purge' : 'DGMS ventilation nominal flow'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-400">Scrubber Speed</span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleToggleFan}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isFanOverdrive
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isFanOverdrive ? 'SET NORMAL' : 'ENGAGE 100%'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turnstile Gating Relay Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20 text-xs font-mono mb-3">
        <div className="flex items-center gap-2">
          {isTurnstileLocked ? (
            <Lock className="w-4 h-4 text-rose-400" />
          ) : (
            <Unlock className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-slate-300">Sector Turnstile Access Barrier:</span>
          <span
            className={`font-bold ${
              isTurnstileLocked ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {zoneState.turnstileGating}
          </span>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleToggleTurnstile}
          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-colors"
        >
          {isTurnstileLocked ? 'UNLOCK GATE' : 'LOCK GATE'}
        </button>
      </div>

      {/* Tamper-Evident Interlock Audit Trail */}
      <div className="border-t border-cyan-500/20 pt-2 flex flex-col">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <div className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-hud font-bold text-slate-300">
              TAMPER-EVIDENT SAFETY TRIP AUDIT LOG
            </span>
          </div>
          <span className="text-[9px] text-slate-500">ISO 27001 / DGMS REG</span>
        </div>

        <div className="max-h-[110px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {recentLogs.length === 0 ? (
            <div className="text-center py-2 text-slate-500 text-[10px] font-mono">
              No recent trip events recorded. System nominal.
            </div>
          ) : (
            recentLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-2 p-1.5 rounded bg-[#07172B]/60 border border-slate-800/80 text-[10px] font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      log.action.includes('TRIP')
                        ? 'bg-rose-400 animate-ping'
                        : log.action.includes('OVERDRIVE')
                        ? 'bg-cyan-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="text-white font-bold">{log.reason}</div>
                    <div className="text-[9px] text-slate-400">
                      Sector: <span className="text-cyan-300">{log.zone}</span> • By:{' '}
                      <span className="text-slate-300">{log.initiatedBy}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
