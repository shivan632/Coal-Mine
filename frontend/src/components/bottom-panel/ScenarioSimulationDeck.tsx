import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, ShieldAlert, Flame, Siren, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { telemetryStream } from '../../services/telemetryStream';
import { SimulationScenarioId } from '../../types/dashboard';

interface ScenarioMeta {
  id: SimulationScenarioId;
  title: string;
  desc: string;
  badge: string;
  icon: React.ReactNode;
  borderClass: string;
  bgClass: string;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'NOMINAL_OPERATIONS',
    title: 'Nominal Mine Operations',
    desc: 'Normal gas levels (CH4 < 0.6%), 100% certified PPE verified for all entering miners.',
    badge: 'SAFE',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    bgClass: 'hover:bg-emerald-950/40',
  },
  {
    id: 'GAS_LEAK_ZONE_B',
    title: 'Gas Surge at Zone B-12',
    desc: 'Methane CH4 surges to 2.85%, CO surges to 62.4 ppm. Triggers automatic auxiliary scrubbers.',
    badge: 'HAZARD',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    bgClass: 'hover:bg-amber-950/40',
  },
  {
    id: 'PPE_NON_COMPLIANCE',
    title: 'Worker PPE Defect Alert',
    desc: 'Worker enters without Helmet and Respirator Mask. Triggers instant "SOMETHING IS MISSING!" banner.',
    badge: 'PPE ALERT',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    bgClass: 'hover:bg-rose-950/40',
  },
  {
    id: 'HIGH_THERMAL_ALERT',
    title: 'Thermal & Humidity Surge',
    desc: 'Excavation Face temperature elevated to 38.6°C with 89% humidity. Triggers mist rotation.',
    badge: 'THERMAL',
    icon: <AlertTriangle className="w-4 h-4 text-purple-400" />,
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    bgClass: 'hover:bg-purple-950/40',
  },
  {
    id: 'EMERGENCY_EVACUATION',
    title: 'Full Mine Evacuation Drill',
    desc: 'Audio siren blares, red strobe warning across all sectors, emergency hoist dispatch initiated.',
    badge: 'EVACUATE',
    icon: <Siren className="w-4 h-4 text-rose-500 animate-bounce" />,
    borderClass: 'border-rose-600 hover:border-rose-400',
    bgClass: 'hover:bg-rose-950/60',
  },
];

export const ScenarioSimulationDeck: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenarioId>('NOMINAL_OPERATIONS');

  const handleRun = (scenarioId: SimulationScenarioId) => {
    setActiveScenario(scenarioId);
    telemetryStream.triggerScenario(scenarioId);
  };

  return (
    <GlassCard glowColor="blue" className="flex flex-col p-4 w-full">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            ONE-CLICK FAILURE MODE SIMULATOR & TEST DECK
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300">
          SELECT SCENARIO TO TEST LIVE COMMAND HUD REACTIONS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SCENARIOS.map((sc) => {
          const isSelected = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleRun(sc.id)}
              className={`text-left p-3 rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(0,212,255,0.4)] scale-102'
                  : `border-slate-800/80 bg-[#061424]/70 ${sc.borderClass} ${sc.bgClass}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {sc.icon}
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {sc.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>

                <h4 className="font-hud text-xs font-bold text-white leading-tight mb-1">
                  {sc.title}
                </h4>
                <p className="text-[10px] font-tech text-slate-400 leading-snug">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span className="font-bold">{isSelected ? 'ACTIVE SCENARIO' : 'RUN TRIGGER'}</span>
                <Play className="w-3 h-3 fill-current" />
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};
