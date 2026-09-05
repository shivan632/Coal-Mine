import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { TrendingUp, Clock, Filter, Download } from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

export const MultiAxisTelemetryHistory: React.FC = () => {
  const historicalSeries = useTelemetryStore((state) => state.historicalSeries);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [activeMetric, setActiveMetric] = useState<'all' | 'gas' | 'temp' | 'safety'>('all');

  const downloadCSV = () => {
    const headers = 'Time,CH4(%),CO(ppm),Temp(C),Humidity(%),Pressure(hPa),O2(%),SafetyIndex(%)\n';
    const rows = historicalSeries
      .map(
        (p) =>
          `${p.timeLabel},${p.ch4},${p.co},${p.temp},${p.humidity},${p.pressure},${p.o2},${p.compositeSafetyIndex}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mine-telemetry-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GlassCard glowColor="cyan" className="flex flex-col p-4 w-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-hud text-sm font-bold text-white tracking-wider uppercase">
              HISTORICAL TELEMETRY TRENDS & SAFETY COMPLIANCE
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              SYNCHRONIZED MULTI-VARIABLE TIME-SERIES WITH PREDICTIVE THRESHOLD BUFFER
            </span>
          </div>
        </div>

        {/* Controls: Timeframe + Metric Filter + Export */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {/* Metric Selector */}
          <div className="flex items-center bg-[#071322] border border-cyan-500/30 rounded-lg p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeMetric === 'all' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('gas')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeMetric === 'gas' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              CH4 / CO
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('temp')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeMetric === 'temp' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Temp / Hum
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('safety')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeMetric === 'safety' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Safety Index
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-[#071322] border border-cyan-500/30 rounded-lg p-0.5 text-xs font-mono">
            {(['1h', '24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded uppercase transition-colors ${
                  timeframe === tf ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={downloadCSV}
            title="Download CSV Audit Log"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ch4Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D5A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF4D5A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="safetyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" />
            <XAxis
              dataKey="timeLabel"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="rgba(0, 212, 255, 0.2)"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="rgba(0, 212, 255, 0.2)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#061424',
                borderColor: 'rgba(0, 212, 255, 0.4)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: 'Chakra Petch',
                paddingTop: '6px',
              }}
            />

            {(activeMetric === 'all' || activeMetric === 'safety') && (
              <Area
                type="monotone"
                name="Safety Index (%)"
                dataKey="compositeSafetyIndex"
                stroke="#22C55E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#safetyGrad)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'gas') && (
              <Area
                type="monotone"
                name="Methane CH4 (%)"
                dataKey="ch4"
                stroke="#00D4FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ch4Grad)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'gas') && (
              <Line
                type="monotone"
                name="Carbon Monoxide (ppm)"
                dataKey="co"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'temp') && (
              <Area
                type="monotone"
                name="Temperature (°C)"
                dataKey="temp"
                stroke="#FF4D5A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
