import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  Gauge,
  ShieldAlert,
  Flame,
  Wind,
  CheckCircle,
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { MineZoneId } from '../../types/dashboard';

export const PredictiveHazardRadar: React.FC = () => {
  const activeZone = useTelemetryStore((state) => state.activeZone);
  const setActiveZone = useTelemetryStore((state) => state.setActiveZone);
  const predictiveMetrics = useTelemetryStore((state) => state.predictiveMetrics);
  const zonePackets = useTelemetryStore((state) => state.zonePackets);

  const zones: MineZoneId[] = [
    'Shaft-01',
    'Tunnel-A04',
    'Gas-Zone-B12',
    'Conveyor-C02',
    'Excavation-Face',
  ];

  const currentMetric = predictiveMetrics[activeZone] || {
    zone: activeZone,
    ch4VelocityPercentPerMin: 0.005,
    coVelocityPpmPerMin: 0.2,
    tempVelocityDegPerMin: 0.05,
    projectedCh4_10m: 0.5,
    projectedCh4_30m: 0.6,
    timeToBreachSeconds: null,
    predictiveRiskLevel: 'LOW',
    confidenceScore: 90,
    lastCalculated: Date.now(),
  };

  const currentPacket = zonePackets[activeZone];
  const isImminent = currentMetric.predictiveRiskLevel === 'IMMINENT_BREACH';
  const isElevated = currentMetric.predictiveRiskLevel === 'ELEVATED';

  // Format TTB display
  const formatTTB = (seconds: number | null) => {
    if (seconds === null) return 'STABLE / NO BREACH';
    if (seconds === 0) return 'BREACH IN PROGRESS!';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="flex flex-col rounded-xl border border-cyan-500/30 bg-[#06111F]/90 backdrop-blur-xl p-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            {(isImminent || isElevated) && (
              <span className="animate-ping absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            )}
          </div>
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            PREDICTIVE ATMOSPHERIC RADAR
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
              isImminent
                ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse'
                : isElevated
                ? 'bg-amber-950/80 text-amber-400 border-amber-500/50'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
            }`}
          >
            {isImminent ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>IMMINENT RISK</span>
              </>
            ) : isElevated ? (
              <>
                <Activity className="w-3 h-3" />
                <span>ELEVATED VELOCITY</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>NOMINAL STABILITY</span>
              </>
            )}
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {currentMetric.confidenceScore}% CONF
          </span>
        </div>
      </div>

      {/* Sector Quick-Select Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
        {zones.map((z) => {
          const metric = predictiveMetrics[z];
          const isSelected = activeZone === z;
          const zoneRisk = metric?.predictiveRiskLevel || 'LOW';

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
                  zoneRisk === 'IMMINENT_BREACH'
                    ? 'bg-rose-400 animate-ping'
                    : zoneRisk === 'ELEVATED'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span>{z}</span>
              {metric?.timeToBreachSeconds !== null && (
                <span className="text-[9px] text-amber-400 font-bold">
                  {Math.round(metric.timeToBreachSeconds / 60)}m
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time-To-Breach (TTB) Master Countdown Box */}
      <div
        className={`relative overflow-hidden rounded-xl p-3 border mb-3 transition-all ${
          isImminent
            ? 'bg-gradient-to-br from-rose-950/50 via-[#160b14] to-[#0a1829] border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
            : isElevated
            ? 'bg-gradient-to-br from-amber-950/40 via-[#17130a] to-[#0a1829] border-amber-500/50'
            : 'bg-[#07172A]/70 border-cyan-500/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${
                isImminent ? 'text-rose-400 animate-spin' : isElevated ? 'text-amber-400' : 'text-cyan-400'
              }`}
            />
            <span className="font-hud text-[11px] font-bold text-slate-200 tracking-wider">
              TIME-TO-BREACH (TTB): DGMS 1.25% CH₄
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            CURRENT: <strong className="text-white">{currentPacket?.methane_CH4 ?? 0.45}%</strong>
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div
            className={`font-mono text-2xl sm:text-3xl font-black tracking-tight ${
              isImminent
                ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                : isElevated
                ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                : 'text-emerald-400'
            }`}
          >
            {formatTTB(currentMetric.timeToBreachSeconds)}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Threshold: <strong>1.25% DGMS Section Cutoff</strong>
          </span>
        </div>

        {/* Progress Bar towards critical limit */}
        <div className="mt-2.5 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              isImminent
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 w-full'
                : isElevated
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500 w-3/4'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-500 w-1/4'
            }`}
          />
        </div>
      </div>

      {/* Derivative Rate-Of-Change (Velocity) Triple Gauges */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* d(CH4)/dt */}
        <div className="bg-[#071626]/80 rounded-lg p-2.5 border border-cyan-500/25 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>d(CH₄)/dt</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-bold">1st Deriv</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`font-mono text-base font-bold ${
                currentMetric.ch4VelocityPercentPerMin > 0.03
                  ? 'text-rose-400'
                  : currentMetric.ch4VelocityPercentPerMin > 0.01
                  ? 'text-amber-300'
                  : 'text-emerald-400'
              }`}
            >
              {currentMetric.ch4VelocityPercentPerMin > 0 ? '+' : ''}
              {currentMetric.ch4VelocityPercentPerMin}
            </span>
            <span className="text-[9px] font-mono text-slate-400">%/min</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">
            {currentMetric.ch4VelocityPercentPerMin > 0.02 ? 'ACCELERATING' : 'STEADY'}
          </span>
        </div>

        {/* d(CO)/dt */}
        <div className="bg-[#071626]/80 rounded-lg p-2.5 border border-cyan-500/25 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>d(CO)/dt</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-bold">Toxicity</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-base font-bold text-cyan-300">
              {currentMetric.coVelocityPpmPerMin > 0 ? '+' : ''}
              {currentMetric.coVelocityPpmPerMin}
            </span>
            <span className="text-[9px] font-mono text-slate-400">ppm/min</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">IS/IEC 60079</span>
        </div>

        {/* d(Temp)/dt */}
        <div className="bg-[#071626]/80 rounded-lg p-2.5 border border-cyan-500/25 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-rose-400" />
              <span>d(Temp)/dt</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-bold">Thermal</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-base font-bold text-slate-200">
              {currentMetric.tempVelocityDegPerMin > 0 ? '+' : ''}
              {currentMetric.tempVelocityDegPerMin}
            </span>
            <span className="text-[9px] font-mono text-slate-400">°C/min</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">Spontaneous Comb.</span>
        </div>
      </div>

      {/* Horizon Projections Strip (+10m and +30m Forecast) */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">PROJECTION:</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">+10m:</span>
            <span
              className={`font-bold ${
                currentMetric.projectedCh4_10m >= 1.25
                  ? 'text-rose-400'
                  : currentMetric.projectedCh4_10m >= 0.75
                  ? 'text-amber-300'
                  : 'text-cyan-300'
              }`}
            >
              {currentMetric.projectedCh4_10m}% CH₄
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-500">+30m:</span>
          <span
            className={`font-bold ${
              currentMetric.projectedCh4_30m >= 1.25
                ? 'text-rose-400'
                : currentMetric.projectedCh4_30m >= 0.75
                ? 'text-amber-300'
                : 'text-cyan-300'
            }`}
          >
            {currentMetric.projectedCh4_30m}% CH₄
          </span>
        </div>
      </div>
    </div>
  );
};
