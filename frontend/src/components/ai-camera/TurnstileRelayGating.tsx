import React, { useState } from 'react';
import { Lock, Unlock, Zap, Radio, KeyRound, Cpu } from 'lucide-react';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { soundEffects } from '../../services/soundEffects';

export const TurnstileRelayGating: React.FC = () => {
  const currentWorker = useWorkerSafetyStore((state) => state.currentWorker);
  const isAuthorized = currentWorker.verdict === 'ALL CORRECT';
  const [manualOverride, setManualOverride] = useState(false);

  const effectiveUnlocked = isAuthorized || manualOverride;

  const handleManualOverride = () => {
    setManualOverride(!manualOverride);
    soundEffects.playClick();
  };

  return (
    <div
      className={`relative w-full rounded-xl border p-3.5 backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between ${
        effectiveUnlocked
          ? 'border-emerald-500/40 bg-[#061C1D]/80 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
          : 'border-rose-500/50 bg-[#1F0910]/85 shadow-[0_0_20px_rgba(255,77,90,0.25)]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h4 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            PHYSICAL ACCESS TURNSTILE RELAY
          </h4>
        </div>
        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          HARDWARE GATE #04
        </span>
      </div>

      {/* Main Status Display */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border transition-all duration-300 ${
              effectiveUnlocked
                ? 'border-emerald-500/50 bg-emerald-950/70 text-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'border-rose-500/60 bg-rose-950/70 text-rose-400 shadow-[0_0_18px_rgba(255,77,90,0.5)] animate-pulse'
            }`}
          >
            {effectiveUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>

          <div>
            <span
              className={`font-hud text-sm font-extrabold tracking-wide uppercase block ${
                effectiveUnlocked ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {effectiveUnlocked
                ? 'TURNSTILE UNLOCKED — BARRIER DOWN'
                : 'BARRIER LOCKED — ACCESS DENIED'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
              {effectiveUnlocked
                ? 'Relay Signal: GPIO-14 HIGH (24V Solenoid Active)'
                : 'Relay Signal: GPIO-14 LOW (Physical Interlock Closed)'}
            </span>
          </div>
        </div>

        {/* Manual Override Button */}
        <button
          type="button"
          onClick={handleManualOverride}
          title="Supervisor Manual Key Override"
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
            manualOverride
              ? 'border-amber-400/60 bg-amber-950/80 text-amber-300'
              : 'border-cyan-500/30 bg-[#091D30] text-cyan-300 hover:text-white hover:bg-cyan-900/60'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{manualOverride ? 'Override: ON' : 'Override Gate'}</span>
        </button>
      </div>

      {/* Hardware Relay Telemetry Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>PORT: WebSerial COM3 (115200 bps)</span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>MQTT: mine/turnstile/gate04/state</span>
        </div>
      </div>
    </div>
  );
};
