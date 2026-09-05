import React, { useState } from 'react';
import { AlertOctagon, Volume2, VolumeX, Trash2, CheckCircle2, ShieldAlert, FileSignature, History } from 'lucide-react';
import { useAlertStore } from '../../stores/useAlertStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { soundEffects } from '../../services/soundEffects';
import { IncidentAlert } from '../../types/dashboard';
import { IncidentSignoffModal } from '../modals/IncidentSignoffModal';

export const IncidentDispatcher: React.FC = () => {
  const alerts = useAlertStore((state) => state.alerts);
  const audioEnabled = useAlertStore((state) => state.audioEnabled);
  const toggleAudio = useAlertStore((state) => state.toggleAudio);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const clearDismissed = useAlertStore((state) => state.clearDismissed);
  const openReplayModal = useTelemetryStore((state) => state.openReplayModal);

  const [selectedAlertForSignoff, setSelectedAlertForSignoff] = useState<IncidentAlert | null>(null);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const handleAckClick = (alert: IncidentAlert) => {
    if (alert.severity === 'CRITICAL') {
      setSelectedAlertForSignoff(alert);
    } else {
      acknowledgeAlert(alert.id);
      soundEffects.playClick();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full rounded-xl border border-cyan-500/30 bg-[#06111F]/90 backdrop-blur-xl p-3.5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              {unacknowledgedCount > 0 && (
                <span className="animate-ping absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75" />
              )}
            </div>
            <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
              STATUTORY INCIDENT DISPATCHER
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {unacknowledgedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/50 text-[10px] font-mono font-bold">
                {unacknowledgedCount} PENDING
              </span>
            )}

            <button
              type="button"
              onClick={toggleAudio}
              title={audioEnabled ? 'Mute Alert Horns' : 'Unmute Alert Horns'}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={clearDismissed}
              title="Clear Acknowledged Records"
              className="p-1 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Incident List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[140px] max-h-[220px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-1.5" />
              <span className="font-hud text-xs text-emerald-400/80 uppercase">ALL SYSTEMS NOMINAL</span>
              <span className="text-[10px] font-mono text-slate-500">Zero active safety violations</span>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isAcknowledged = alert.acknowledged;

              return (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border transition-all text-xs font-mono ${
                    isAcknowledged
                      ? 'border-slate-800 bg-slate-950/40 opacity-60'
                      : isCritical
                      ? 'border-rose-500/60 bg-rose-950/40 shadow-[0_0_15px_rgba(255,77,90,0.2)] animate-pulse'
                      : 'border-amber-500/50 bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                      <span className="font-hud font-bold text-white tracking-wide">{alert.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                        {alert.zone}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 leading-tight">{alert.description}</p>

                  <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-[9px] text-cyan-300">ACTION: {alert.mitigationStep}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openReplayModal(alert.id)}
                        title="Open Chronological Flight Recorder"
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition-colors"
                      >
                        <History className="w-3 h-3 text-purple-400" />
                        <span>Replay</span>
                      </button>

                      {!isAcknowledged ? (
                        <button
                          type="button"
                          onClick={() => handleAckClick(alert)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            isCritical
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                              : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {isCritical ? (
                            <>
                              <FileSignature className="w-3 h-3" />
                              <span>Sign Audit</span>
                            </>
                          ) : (
                            <span>ACK</span>
                          )}
                        </button>
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-bold">ACK ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Supervisor Sign-off Modal */}
      <IncidentSignoffModal
        alert={selectedAlertForSignoff}
        isOpen={selectedAlertForSignoff !== null}
        onClose={() => setSelectedAlertForSignoff(null)}
      />
    </>
  );
};
