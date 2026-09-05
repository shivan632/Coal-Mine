import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';
import { CircularGauge } from '../ui/CircularGauge';
import { GlassCard } from '../ui/GlassCard';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';

export const CompositeSafetyGauge: React.FC = () => {
  const mineSafetyIndex = useTelemetryStore((state) => state.mineSafetyIndex);
  const overallStatus = useTelemetryStore((state) => state.overallStatus);
  const currentPacket = useTelemetryStore((state) => state.currentPacket);
  const complianceRateToday = useWorkerSafetyStore((state) => state.complianceRateToday);

  // Sub-index calculations
  const atmosphericScore = Math.max(10, Math.min(100, Math.round(100 - (currentPacket.methane_CH4 * 25 + currentPacket.carbonMonoxide_CO * 0.6))));
  const thermalScore = Math.max(10, Math.min(100, Math.round(100 - (currentPacket.temperature > 25 ? (currentPacket.temperature - 25) * 5 : 0))));

  return (
    <GlassCard glowColor={overallStatus === 'NOMINAL' ? 'cyan' : overallStatus === 'WARNING' ? 'amber' : 'crimson'} className="flex flex-col items-center justify-between p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full border-b border-cyan-500/20 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          {overallStatus === 'NOMINAL' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          {overallStatus === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {overallStatus === 'CRITICAL' && <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />}
          <h3 className="font-hud text-xs font-bold text-white tracking-wider">
            MINE SAFETY INDEX (MSI)
          </h3>
        </div>
        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
            overallStatus === 'NOMINAL'
              ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-500/40'
              : overallStatus === 'WARNING'
              ? 'text-amber-400 bg-amber-950/70 border border-amber-500/40'
              : 'text-rose-400 bg-rose-950/70 border border-rose-500/50 animate-pulse'
          }`}
        >
          {overallStatus} THREAT TIER
        </span>
      </div>

      {/* Main Radial Gauge */}
      <div className="my-1">
        <CircularGauge
          value={mineSafetyIndex}
          size={160}
          strokeWidth={12}
          label="SAFETY SCORE"
          sublabel={overallStatus === 'NOMINAL' ? 'OPTIMAL' : overallStatus === 'WARNING' ? 'ELEVATED RISK' : 'CRITICAL ALERT'}
          status={overallStatus}
        />
      </div>

      {/* Sub-Metrics Breakdown Bar */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-2 border-t border-slate-800">
        <div className="flex flex-col items-center p-1.5 rounded bg-[#071322] border border-cyan-500/20">
          <span className="text-[9px] font-mono text-slate-400">ATMOSPHERIC</span>
          <span className="font-hud text-xs font-bold text-cyan-400 mt-0.5">{atmosphericScore}%</span>
        </div>
        <div className="flex flex-col items-center p-1.5 rounded bg-[#071322] border border-cyan-500/20">
          <span className="text-[9px] font-mono text-slate-400">PPE COMPLIANCE</span>
          <span className="font-hud text-xs font-bold text-emerald-400 mt-0.5">{complianceRateToday}%</span>
        </div>
        <div className="flex flex-col items-center p-1.5 rounded bg-[#071322] border border-cyan-500/20">
          <span className="text-[9px] font-mono text-slate-400">THERMAL STAB</span>
          <span className="font-hud text-xs font-bold text-purple-400 mt-0.5">{thermalScore}%</span>
        </div>
      </div>
    </GlassCard>
  );
};
