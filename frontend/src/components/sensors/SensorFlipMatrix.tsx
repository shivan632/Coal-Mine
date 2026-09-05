import React from 'react';
import { Flame, Wind, Thermometer, Droplets, Gauge, Activity, RotateCw } from 'lucide-react';
import { FlipCard } from '../ui/FlipCard';
import { StatusBadge } from '../ui/StatusBadge';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { SafetyStatus } from '../../types/dashboard';

interface SensorConfig {
  key: string;
  label: string;
  chemicalFormula: string;
  icon: React.ReactNode;
  getValue: (p: any) => number;
  unit: string;
  safeRange: string;
  regulatoryStandard: string;
  getStatus: (v: number) => SafetyStatus;
  minVal: number;
  maxVal: number;
  sensorModel: string;
  atexRating: string;
  atexShort: string;
}

const SENSOR_CONFIGS: SensorConfig[] = [
  {
    key: 'ch4',
    label: 'Methane Gas',
    chemicalFormula: 'CH₄',
    icon: <Flame className="w-4 h-4 text-cyan-400" />,
    getValue: (p) => p.methane_CH4,
    unit: '% vol',
    safeRange: '< 0.75%',
    regulatoryStandard: 'DGMS Reg. 153(2)',
    getStatus: (v) => (v >= 1.25 ? 'CRITICAL' : v >= 0.75 ? 'WARNING' : 'NOMINAL'),
    minVal: 0.25,
    maxVal: 2.85,
    sensorModel: 'NDIR-Ex-d-Flameproof',
    atexRating: 'ATEX M1 / Ex-ia',
    atexShort: 'M1 / Ex-ia',
  },
  {
    key: 'co',
    label: 'Carbon Monoxide',
    chemicalFormula: 'CO',
    icon: <Wind className="w-4 h-4 text-amber-400" />,
    getValue: (p) => p.carbonMonoxide_CO,
    unit: 'ppm',
    safeRange: '< 25 ppm',
    regulatoryStandard: 'IS/IEC 60079-29-1',
    getStatus: (v) => (v > 50 ? 'CRITICAL' : v > 25 ? 'WARNING' : 'NOMINAL'),
    minVal: 8.0,
    maxVal: 68.0,
    sensorModel: 'EC-ToxSense-X4',
    atexRating: 'ATEX Zone 1',
    atexShort: 'Zone 1',
  },
  {
    key: 'temp',
    label: 'Ambient Temp',
    chemicalFormula: 'TEMP',
    icon: <Thermometer className="w-4 h-4 text-rose-400" />,
    getValue: (p) => p.temperature,
    unit: '°C',
    safeRange: '20 - 28°C',
    regulatoryStandard: 'DGMS Thermal Std',
    getStatus: (v) => (v > 35 ? 'CRITICAL' : v > 28 ? 'WARNING' : 'NOMINAL'),
    minVal: 21.4,
    maxVal: 38.6,
    sensorModel: 'PT1000-IS-IntrinsicallySafe',
    atexRating: 'ATEX Zone 1',
    atexShort: 'Zone 1',
  },
  {
    key: 'humidity',
    label: 'Rel Humidity',
    chemicalFormula: 'RH',
    icon: <Droplets className="w-4 h-4 text-blue-400" />,
    getValue: (p) => p.humidity,
    unit: '%',
    safeRange: '40 - 70%',
    regulatoryStandard: 'OSHA 1926.800',
    getStatus: (v) => (v > 85 ? 'CRITICAL' : v > 70 ? 'WARNING' : 'NOMINAL'),
    minVal: 48.0,
    maxVal: 92.5,
    sensorModel: 'Capacitive-RH-02',
    atexRating: 'ATEX Zone 2',
    atexShort: 'Zone 2',
  },
  {
    key: 'pressure',
    label: 'Baro Pressure',
    chemicalFormula: 'hPa',
    icon: <Gauge className="w-4 h-4 text-purple-400" />,
    getValue: (p) => p.pressure,
    unit: 'hPa',
    safeRange: '980 - 1025 hPa',
    regulatoryStandard: 'Mine Venti Rule',
    getStatus: (v) => (v < 975 || v > 1030 ? 'WARNING' : 'NOMINAL'),
    minVal: 968.0,
    maxVal: 1028.5,
    sensorModel: 'Piezo-DeepBaro-Ex',
    atexRating: 'ATEX Zone 1',
    atexShort: 'Zone 1',
  },
  {
    key: 'o2',
    label: 'Oxygen Level',
    chemicalFormula: 'O₂',
    icon: <Activity className="w-4 h-4 text-emerald-400" />,
    getValue: (p) => p.oxygen_O2,
    unit: '% vol',
    safeRange: '20.8 - 21.0%',
    regulatoryStandard: 'DGMS / OSHA Hypoxia',
    getStatus: (v) => (v < 19.5 ? 'CRITICAL' : v < 20.5 ? 'WARNING' : 'NOMINAL'),
    minVal: 17.2,
    maxVal: 21.2,
    sensorModel: 'Galvanic-O2-Pro-Ex',
    atexRating: 'ATEX M1 / Ex-ia',
    atexShort: 'M1 / Ex-ia',
  },
];

export const SensorFlipMatrix: React.FC = () => {
  const currentPacket = useTelemetryStore((state) => state.currentPacket);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Matrix Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            REGULATORY TELEMETRY MATRIX (DGMS / OSHA / ATEX)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
          <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
          <span>CLICK TO VIEW DGMS / ATEX STATS</span>
        </span>
      </div>

      {/* Sensor Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SENSOR_CONFIGS.map((cfg) => {
          const value = cfg.getValue(currentPacket);
          const status = cfg.getStatus(value);

          const isCritical = status === 'CRITICAL';
          const isWarning = status === 'WARNING';

          // Front Face Content - Clean Non-Overflowing Layout
          const frontFace = (
            <div
              className={`h-full w-full rounded-xl border p-3 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-lg overflow-hidden ${
                isCritical
                  ? 'border-rose-500/50 bg-[#1A0810]/90 shadow-[0_0_20px_rgba(255,77,90,0.25)] animate-pulse'
                  : isWarning
                  ? 'border-amber-500/40 bg-[#1A1208]/90 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-cyan-500/25 bg-[#091A2E]/85 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(0,212,255,0.08)]'
              }`}
            >
              {/* Header Row: Icon + Label (Left), Status + ATEX (Right) */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#0E243A] border border-cyan-500/30 shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-tech text-xs font-bold text-white tracking-wide block truncate">
                      {cfg.label}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400/80 block">
                      {cfg.chemicalFormula}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={status} size="sm" showPulse={isCritical || isWarning} />
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {cfg.atexShort}
                  </span>
                </div>
              </div>

              {/* Dedicated Central Value Row (Zero wrapping/collision) */}
              <div className="my-1.5 flex items-baseline gap-1.5 w-full">
                <span className="font-hud text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                  {value}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300/80">
                  {cfg.unit}
                </span>
              </div>

              {/* Footer bounds */}
              <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 border-t border-slate-700/40 pt-1.5 gap-1 w-full">
                <span className="text-slate-300 truncate">LIMIT: {cfg.safeRange}</span>
                <span className="text-cyan-400 font-semibold truncate text-right">
                  {cfg.regulatoryStandard}
                </span>
              </div>
            </div>
          );

          // Back Face Content (Diagnostic details)
          const backFace = (
            <div className="h-full w-full rounded-xl border border-cyan-400/40 bg-[#061424] p-3 backdrop-blur-xl flex flex-col justify-between text-xs font-mono shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
                <span className="font-hud text-cyan-400 font-bold text-[10px]">STATUTORY CALIB</span>
                <span className="text-[9px] text-emerald-400 font-bold">{cfg.atexShort}</span>
              </div>

              <div className="space-y-1 my-1 text-[9.5px]">
                <div className="flex justify-between text-slate-300">
                  <span>Model:</span>
                  <span className="text-cyan-300 font-semibold truncate max-w-[90px]">{cfg.sensorModel}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Standard:</span>
                  <span className="text-amber-300 truncate max-w-[90px]">{cfg.regulatoryStandard}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>24H Peak:</span>
                  <span className="text-rose-400 font-bold">{cfg.maxVal} {cfg.unit}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Auto Power Cut:</span>
                  <span className={cfg.key === 'ch4' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {cfg.key === 'ch4' ? '>1.25%' : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="text-[8.5px] text-slate-400 border-t border-cyan-500/20 pt-1 text-center">
                CLICK TO FLIP BACK
              </div>
            </div>
          );

          return (
            <FlipCard
              key={cfg.key}
              front={frontFace}
              back={backFace}
              className="min-h-[155px]"
            />
          );
        })}
      </div>
    </div>
  );
};
