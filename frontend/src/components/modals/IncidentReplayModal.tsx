import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  ShieldAlert,
  Zap,
  Fan,
  Users,
  FileCheck,
  Compass,
  Layers,
  Flame,
  Volume2,
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { IncidentReplayData, ReplayTimelinePoint, MineZoneId } from '../../types/dashboard';
import { API_CONFIG } from '../../services/apiContract';

export const IncidentReplayModal: React.FC = () => {
  const isOpen = useTelemetryStore((state) => state.isReplayModalOpen);
  const closeReplay = useTelemetryStore((state) => state.closeReplayModal);
  const replayIncidentId = useTelemetryStore((state) => state.replayIncidentId);

  const [replayData, setReplayData] = useState<IncidentReplayData | null>(null);
  const [currentOffset, setCurrentOffset] = useState<number>(-300); // starts at t-5min
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 5x
  const [selectedZone, setSelectedZone] = useState<MineZoneId>('Gas-Zone-B12');
  const [loading, setLoading] = useState<boolean>(true);

  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Fetch replay dataset or generate synthetic chronological dataset
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const incidentId = replayIncidentId || 'ALT-SAMPLE-REPLAY';

    fetch(`${API_CONFIG.REST_BASE_URL}/incidents/${incidentId}/replay`)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
          setReplayData(json.data);
          setSelectedZone(json.data.incident.zone || 'Gas-Zone-B12');
        } else {
          fallbackSyntheticReplay(incidentId);
        }
      })
      .catch(() => {
        fallbackSyntheticReplay(incidentId);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, replayIncidentId]);

  const fallbackSyntheticReplay = (incidentId: string) => {
    const t0 = Date.now() - 15 * 60000;
    const timeline: ReplayTimelinePoint[] = [];
    const zones: MineZoneId[] = [
      'Shaft-01',
      'Tunnel-A04',
      'Gas-Zone-B12',
      'Conveyor-C02',
      'Excavation-Face',
    ];

    for (let offset = -300; offset <= 300; offset += 5) {
      const zTele: any = {};
      const zInter: any = {};

      zones.forEach((z) => {
        if (z === 'Gas-Zone-B12') {
          let ch4 = 0.52;
          let temp = 28.2;
          let power: 'ACTIVE' | 'CUTOFF' = 'ACTIVE';
          let fan: 'NORMAL' | 'OVERDRIVE' = 'NORMAL';

          if (offset < -90) {
            ch4 = +(0.50 + Math.random() * 0.05).toFixed(2);
          } else if (offset < 0) {
            const p = (offset + 90) / 90;
            ch4 = +(0.55 + p * 0.72).toFixed(2);
          } else if (offset <= 30) {
            ch4 = +(2.45 - (offset / 30) * 0.4).toFixed(2);
            power = 'CUTOFF';
            fan = 'OVERDRIVE';
          } else {
            const decay = Math.exp(-(offset - 30) / 75);
            ch4 = +(0.62 + 1.4 * decay).toFixed(2);
            power = 'CUTOFF';
            fan = 'OVERDRIVE';
          }

          zTele[z] = {
            zone: z,
            methane_CH4: ch4,
            carbonMonoxide_CO: +(18 + (ch4 > 1 ? 30 : 0)).toFixed(1),
            temperature: temp,
            status: ch4 >= 1.25 ? 'CRITICAL' : ch4 >= 0.75 ? 'WARNING' : 'NOMINAL',
          };
          zInter[z] = { power, fan };
        } else {
          zTele[z] = {
            zone: z,
            methane_CH4: 0.35,
            carbonMonoxide_CO: 12.0,
            temperature: 24.0,
            status: 'NOMINAL',
          };
          zInter[z] = { power: 'ACTIVE', fan: 'NORMAL' };
        }
      });

      timeline.push({
        offsetSeconds: offset,
        timestamp: t0 + offset * 1000,
        telemetry: zTele,
        interlockState: zInter,
        activeIncidents: offset >= 0 ? [{ id: incidentId, title: 'Methane Breach', severity: 'CRITICAL', zone: 'Gas-Zone-B12' }] : [],
      });
    }

    setReplayData({
      incident: {
        id: incidentId,
        title: 'Methane Inundation & Closed-Loop Containment',
        description: 'Atmospheric methane spiked across 1.25% DGMS threshold. Automated breaker trip engaged.',
        severity: 'CRITICAL',
        zone: 'Gas-Zone-B12',
        timestamp: t0,
        acknowledged: false,
        regulatoryClause: 'DGMS Reg. 153(2) Electrical Containment',
        category: 'GAS_LEAK',
        mitigationStep: 'Autonomous circuit breaker cutoff, 100% scrubber overdrive, emergency evacuation.',
      },
      timeline,
      startTime: t0 - 300000,
      incidentTime: t0,
      endTime: t0 + 300000,
    });
  };

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const deltaSec = ((now - lastTickRef.current) / 1000) * playSpeed;
      lastTickRef.current = now;

      setCurrentOffset((prev) => {
        const next = prev + deltaSec * 5; // advance 5 timeline seconds per real second * speed
        if (next >= 300) {
          setIsPlaying(false);
          return 300;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playSpeed]);

  if (!isOpen) return null;

  // Find closest timeline frame to currentOffset
  const timeline = replayData?.timeline || [];
  const currentFrame =
    timeline.reduce((prev, curr) =>
      Math.abs(curr.offsetSeconds - currentOffset) < Math.abs(prev.offsetSeconds - currentOffset)
        ? curr
        : prev,
      timeline[0] || {
        offsetSeconds: -300,
        timestamp: Date.now(),
        telemetry: {},
        interlockState: {},
        activeIncidents: [],
      }
    );

  const activeZoneTele = currentFrame.telemetry[selectedZone];
  const activeZoneInterlock = currentFrame.interlockState[selectedZone];

  const formatOffsetLabel = (sec: number) => {
    const rounded = Math.round(sec);
    const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : '±';
    const abs = Math.abs(rounded);
    const mins = Math.floor(abs / 60);
    const remSecs = abs % 60;
    return `t ${sign} ${mins}m ${remSecs < 10 ? '0' : ''}${remSecs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-[#040D1A] shadow-[0_0_50px_rgba(0,212,255,0.2)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/25 bg-[#061426]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hud text-base sm:text-lg font-black tracking-wider text-white">
                  INCIDENT FLIGHT RECORDER & REPLAY SCRUBBER
                </h2>
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[10px] font-mono font-bold">
                  POST-MORTEM AUDIT
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70">
                CHRONOLOGICAL INVESTIGATION • CH₄ RATE-OF-CHANGE & INTERLOCK TRIP SYNCHRONIZATION
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeReplay}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 custom-scrollbar">
          {/* Incident Overview Badge Banner */}
          {replayData && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-[#130d1e] to-[#07172b] flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <div className="font-hud text-sm font-bold text-white tracking-wide">
                    {replayData.incident.title}
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    Sector: <span className="text-cyan-300 font-bold">{replayData.incident.zone}</span> • Clause:{' '}
                    <span className="text-amber-300 font-bold">{replayData.incident.regulatoryClause}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">INCIDENT TIMESTAMP:</span>
                <span className="text-xs font-mono font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
                  {new Date(replayData.incidentTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Master Timeline Scrubber Controller */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#061425]/80 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-hud font-bold text-slate-200">TIMELINE OFFSET:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 font-mono text-sm font-bold border border-cyan-500/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                  {formatOffsetLabel(currentOffset)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  [{new Date(currentFrame.timestamp).toLocaleTimeString()}]
                </span>
              </div>

              {/* Play / Speed Controls */}
              <div className="flex items-center gap-1.5 bg-[#091C31] p-1 rounded-lg border border-cyan-500/30">
                <button
                  type="button"
                  title="Reset to t-5min"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentOffset(-300);
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  title="Step -15s"
                  onClick={() => setCurrentOffset((p) => Math.max(-300, p - 15))}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1 text-xs border border-cyan-400/50 transition-all shadow-md"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>PLAY</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  title="Step +15s"
                  onClick={() => setCurrentOffset((p) => Math.min(300, p + 15))}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Speed Toggles */}
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaySpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      playSpeed === spd
                        ? 'bg-cyan-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Range Scrubber Slider */}
            <div className="relative flex flex-col gap-1">
              <input
                type="range"
                min="-300"
                max="300"
                step="1"
                value={Math.round(currentOffset)}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentOffset(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-inner"
              />

              {/* Event Tick Markers */}
              <div className="relative flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                <span>t - 5m (Nominal)</span>
                <span className="text-amber-400 font-bold">t - 1m (Gas Velocity Spike)</span>
                <span className="text-rose-400 font-bold underline">t = 0 (DGMS Breach 1.25%)</span>
                <span className="text-cyan-400 font-bold">t + 100ms (Power Cut & Overdrive)</span>
                <span>t + 5m (Dilution Phase)</span>
              </div>
            </div>
          </div>

          {/* Synchronized Replay State Deck: Environmental Telemetry & Breaker Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sector Selector Pill Strip */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="font-hud text-[11px] font-bold text-slate-300">
                INSPECT SECTOR SENSORS
              </span>
              {(['Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face'] as MineZoneId[]).map(
                (z) => {
                  const zTele = currentFrame.telemetry[z];
                  const zInter = currentFrame.interlockState[z];
                  const isSel = selectedZone === z;
                  const isCrit = (zTele?.methane_CH4 ?? 0) >= 1.25;

                  return (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setSelectedZone(z)}
                      className={`p-2 rounded-lg border text-left font-mono text-xs transition-all flex items-center justify-between ${
                        isSel
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                          : 'bg-[#061426]/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCrit
                              ? 'bg-rose-400 animate-ping'
                              : zInter?.power === 'CUTOFF'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-bold">{z}</span>
                      </div>
                      <span className="text-[10px] text-cyan-300">
                        {zTele?.methane_CH4 ?? 0.4}% CH₄
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Current Scrubbed Snapshot Metrics */}
            <div className="md:col-span-9 flex flex-col gap-3 bg-[#061425]/70 rounded-xl p-3.5 border border-cyan-500/25">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="font-hud text-xs font-bold text-white">
                  SECTOR STATE AT {formatOffsetLabel(currentOffset)}: {selectedZone}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    (activeZoneTele?.methane_CH4 ?? 0) >= 1.25
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {activeZoneTele?.status || 'NOMINAL'}
                </span>
              </div>

              {/* Sensor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Methane */}
                <div className="p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Methane (CH₄)</span>
                  </div>
                  <div
                    className={`font-mono text-xl font-bold mt-1 ${
                      (activeZoneTele?.methane_CH4 ?? 0) >= 1.25
                        ? 'text-rose-400'
                        : 'text-cyan-300'
                    }`}
                  >
                    {activeZoneTele?.methane_CH4 ?? 0.4}%
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">DGMS limit: 1.25%</span>
                </div>

                {/* Carbon Monoxide */}
                <div className="p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-slate-400">Carbon Monoxide</div>
                  <div className="font-mono text-xl font-bold mt-1 text-slate-200">
                    {activeZoneTele?.carbonMonoxide_CO ?? 14} ppm
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Toxic limit: 50 ppm</span>
                </div>

                {/* Section Breaker Power State */}
                <div className="p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Grid Breaker</span>
                  </div>
                  <div
                    className={`font-mono text-sm font-bold mt-1 uppercase ${
                      activeZoneInterlock?.power === 'CUTOFF'
                        ? 'text-rose-400 animate-pulse'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activeZoneInterlock?.power ?? 'ACTIVE'}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    {activeZoneInterlock?.power === 'CUTOFF' ? 'Power Isolated' : 'Energized'}
                  </span>
                </div>

                {/* Scrubber Fan State */}
                <div className="p-2.5 rounded-lg bg-[#040C17] border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Fan className="w-3 h-3 text-cyan-400" />
                    <span>Scrubber Fan</span>
                  </div>
                  <div
                    className={`font-mono text-sm font-bold mt-1 uppercase ${
                      activeZoneInterlock?.fan === 'OVERDRIVE'
                        ? 'text-cyan-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {activeZoneInterlock?.fan ?? 'NORMAL'}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    {activeZoneInterlock?.fan === 'OVERDRIVE' ? '3500 RPM (Purge)' : '1200 RPM'}
                  </span>
                </div>
              </div>

              {/* Action Log at this Timestamp */}
              <div className="p-2.5 rounded-lg bg-[#07182B] border border-slate-700/60 text-xs font-mono text-slate-300 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">
                    {currentOffset < -60 && 'Normal baseline production. All telemetry within DGMS safe envelope.'}
                    {currentOffset >= -60 && currentOffset < 0 && 'Pre-incident atmospheric drift: Gas velocity rising rapidly. Early warning beacon pulsing.'}
                    {currentOffset >= 0 && currentOffset < 30 && 'CRITICAL EVENT: DGMS 1.25% exceeded. Automated Closed-Loop Trip executed within 100ms. Grid cut, fan engaged 100% overdrive.'}
                    {currentOffset >= 30 && 'Airway purge & dilution underway. Personnel evacuated via illuminated secondary vectors.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/20 bg-[#061426]/90">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Statutory Investigation Record • Exportable to PDF Audit Log</span>
          </div>

          <button
            type="button"
            onClick={closeReplay}
            className="px-4 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/80 text-cyan-300 hover:text-white hover:bg-cyan-900 transition-all text-xs font-mono font-bold"
          >
            CLOSE REPLAY VIEWER
          </button>
        </div>
      </div>
    </div>
  );
};
