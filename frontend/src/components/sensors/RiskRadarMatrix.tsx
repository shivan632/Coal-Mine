import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { ShieldAlert, Compass } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

export const RiskRadarMatrix: React.FC = () => {
  const currentPacket = useTelemetryStore((state) => state.currentPacket);
  const activeZone = useTelemetryStore((state) => state.activeZone);

  // Dynamic radar vectors derived from real-time metrics
  const radarData = [
    {
      subject: 'Methane (CH4)',
      value: Math.min(100, Math.round(currentPacket.methane_CH4 * 35)),
      fullMark: 100,
    },
    {
      subject: 'Carbon Monoxide',
      value: Math.min(100, Math.round(currentPacket.carbonMonoxide_CO * 1.5)),
      fullMark: 100,
    },
    {
      subject: 'Thermal Heat',
      value: Math.min(100, Math.round(currentPacket.temperature > 20 ? (currentPacket.temperature - 20) * 5 : 10)),
      fullMark: 100,
    },
    {
      subject: 'Humidity Stress',
      value: Math.min(100, Math.round(currentPacket.humidity * 0.9)),
      fullMark: 100,
    },
    {
      subject: 'Baro Gradient',
      value: Math.abs(currentPacket.pressure - 1013) > 10 ? 70 : 25,
      fullMark: 100,
    },
    {
      subject: 'O2 Depletion',
      value: currentPacket.oxygen_O2 < 20.0 ? Math.round((20.9 - currentPacket.oxygen_O2) * 45) : 10,
      fullMark: 100,
    },
  ];

  return (
    <GlassCard glowColor="purple" className="flex flex-col justify-between p-4 min-h-[260px]">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-purple-400" />
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            RISK MULTIVARIATE RADAR
          </h3>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
          ZONE: {activeZone}
        </span>
      </div>

      <div className="relative w-full h-[180px] sm:h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(0, 212, 255, 0.2)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Chakra Petch' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="rgba(0, 212, 255, 0.15)"
              tick={false}
            />
            <Radar
              name="Threat Vector"
              dataKey="value"
              stroke="#00D4FF"
              fill="#8B5CF6"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1.5">
        <span>DYNAMIC COMPOSITE THREAT PROJECTION</span>
        <span className="text-cyan-400 font-bold">20Hz SYNCED</span>
      </div>
    </GlassCard>
  );
};
