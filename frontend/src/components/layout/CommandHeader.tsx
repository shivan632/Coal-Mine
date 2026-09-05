import React, { useState, useEffect } from 'react';
import { Shield, Radio, Wifi, Clock, AlertTriangle, Users, FileText, Download, Database } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { useAlertStore } from '../../stores/useAlertStore';
import { generateStatutoryPDFReport } from '../../services/pdfReportGenerator';
import { ShiftRosterModal } from '../modals/ShiftRosterModal';

export const CommandHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const activeZone = useTelemetryStore((state) => state.activeZone);
  const currentPacket = useTelemetryStore((state) => state.currentPacket);
  const overallStatus = useTelemetryStore((state) => state.overallStatus);
  const emergencyEvacuationActive = useTelemetryStore((state) => state.emergencyEvacuationActive);
  const mineSafetyIndex = useTelemetryStore((state) => state.mineSafetyIndex);
  const openReplayModal = useTelemetryStore((state) => state.openReplayModal);

  const workerQueue = useWorkerSafetyStore((state) => state.workerQueue);
  const alerts = useAlertStore((state) => state.alerts);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportPDF = () => {
    generateStatutoryPDFReport(currentPacket, workerQueue, alerts, mineSafetyIndex);
  };

  return (
    <>
      <header className="relative w-full border-b border-cyan-500/30 bg-[#06111F]/90 backdrop-blur-xl px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] z-40">
        {/* Emergency Evacuation Strobe Banner */}
        {emergencyEvacuationActive && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#102A45] to-[#061424] border border-cyan-400/50 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Shield className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_#00D4FF]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-hud text-lg sm:text-xl font-black tracking-wider text-white">
                  COALGUARD <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  DGMS v3.0 PRO
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70 tracking-tight hidden sm:block">
                UNDERGROUND MINE SAFETY INTELLIGENCE & STATUTORY COMMAND CENTER
              </p>
            </div>
          </div>

          {/* Action Center: Shift Roster, Statutory PDF & Network Telemetry */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Shift Roster Button */}
            <button
              type="button"
              onClick={() => setIsRosterOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-[#091D33] text-cyan-300 hover:text-white hover:bg-cyan-900/60 transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shift Tag-Board</span>
            </button>

            {/* Incident Flight Recorder / Replay Button */}
            <button
              type="button"
              onClick={() => openReplayModal()}
              className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-[#170C2A] text-purple-300 hover:text-white hover:bg-purple-900/60 transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Incident Replay</span>
            </button>

            {/* 1-Click PDF Report Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-[#061E1A] text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statutory PDF Audit</span>
            </button>

            {/* Active Sector Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E243A] border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">SECTOR:</span>
              <span className="text-cyan-300 font-bold">{activeZone}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  overallStatus === 'NOMINAL'
                    ? 'bg-emerald-400'
                    : overallStatus === 'WARNING'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400 animate-ping'
                }`}
              />
            </div>

            {/* Field Telemetry & Offline Cache Sync */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#081524] border border-cyan-500/20 text-[10px] font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>LoRa/RS-485: -72 dBm</span>
              <span className="text-slate-600">|</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300">IndexedDB: SYNCED</span>
            </div>

            {/* Live Clock Strip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E243A]/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentDate}</span>
              <span className="text-slate-500">•</span>
              <span className="font-bold text-white">{currentTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Shift Roster Tag-Board Modal */}
      <ShiftRosterModal isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} />
    </>
  );
};
