import React from 'react';
import { Users, ShieldCheck, AlertTriangle, LifeBuoy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';

export const TopMetricStatsStrip: React.FC = () => {
  const currentPacket = useTelemetryStore((state) => state.currentPacket);
  const overallStatus = useTelemetryStore((state) => state.overallStatus);
  const mineSafetyIndex = useTelemetryStore((state) => state.mineSafetyIndex);

  const totalWorkers = useWorkerSafetyStore((state) => state.totalWorkersMonitored);
  const complianceRate = useWorkerSafetyStore((state) => state.complianceRateToday);

  const STATS = [
    {
      title: 'ACTIVE UNDERGROUND WORKERS',
      value: totalWorkers.toString(),
      unit: 'Miners On Shift',
      delta: '+4 in Sector A',
      deltaPositive: true,
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      glow: 'cyan' as const,
      floatDelay: 0,
    },
    {
      title: 'AI PPE SAFETY COMPLIANCE',
      value: `${complianceRate}%`,
      unit: 'Certified Gear Check',
      delta: '+2.1% this week',
      deltaPositive: true,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      glow: 'green' as const,
      floatDelay: 0.15,
    },
    {
      title: 'ACTIVE HAZARD MONITORING',
      value: overallStatus === 'NOMINAL' ? '0 CRITICAL' : overallStatus === 'WARNING' ? '1 WARNING' : 'CRITICAL ALERT',
      unit: currentPacket.zone,
      delta: `CH4: ${currentPacket.methane_CH4}%`,
      deltaPositive: overallStatus === 'NOMINAL',
      icon: <AlertTriangle className={`w-5 h-5 ${overallStatus === 'NOMINAL' ? 'text-cyan-400' : overallStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'}`} />,
      glow: overallStatus === 'NOMINAL' ? ('cyan' as const) : overallStatus === 'WARNING' ? ('amber' as const) : ('crimson' as const),
      floatDelay: 0.3,
    },
    {
      title: 'MINE SAFETY INDEX (MSI)',
      value: `${mineSafetyIndex}%`,
      unit: 'Multi-Factor Rating',
      delta: overallStatus === 'NOMINAL' ? 'Optimal Range' : 'Attention Required',
      deltaPositive: overallStatus === 'NOMINAL',
      icon: <LifeBuoy className="w-5 h-5 text-purple-400" />,
      glow: 'purple' as const,
      floatDelay: 0.45,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {STATS.map((stat, i) => (
        <GlassCard
          key={i}
          glowColor={stat.glow}
          enableFloating={true}
          floatDelay={stat.floatDelay}
          className="p-3.5 flex items-center justify-between"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-hud font-bold tracking-wider text-slate-400 uppercase">
              {stat.title}
            </span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="font-hud text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs font-tech text-cyan-300/80">{stat.unit}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {stat.deltaPositive ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
              )}
              <span className={stat.deltaPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {stat.delta}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#091D30] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
            {stat.icon}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
