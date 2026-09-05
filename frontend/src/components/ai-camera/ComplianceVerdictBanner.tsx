import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertOctagon, AlertTriangle } from 'lucide-react';

interface ComplianceVerdictBannerProps {
  verdict: 'ALL CORRECT' | 'SOMETHING IS MISSING!';
  missingItems?: string[];
}

export const ComplianceVerdictBanner: React.FC<ComplianceVerdictBannerProps> = ({
  verdict,
  missingItems = [],
}) => {
  const isSafe = verdict === 'ALL CORRECT';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={verdict + missingItems.join(',')}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative overflow-hidden rounded-xl border p-4 backdrop-blur-md shadow-2xl transition-all duration-300 ${
          isSafe
            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_30px_rgba(34,197,94,0.25)]'
            : 'border-rose-500/60 bg-rose-950/50 text-rose-300 shadow-[0_0_35px_rgba(255,77,90,0.35)]'
        }`}
      >
        {/* Glow edge accents */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] ${
            isSafe
              ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
              : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent animate-pulse'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                isSafe
                  ? 'border-emerald-500/40 bg-emerald-900/50 text-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'border-rose-500/50 bg-rose-900/50 text-rose-400 shadow-[0_0_18px_rgba(255,77,90,0.5)] animate-bounce'
              }`}
            >
              {isSafe ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <AlertOctagon className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud text-lg sm:text-xl font-extrabold tracking-wider uppercase">
                  {verdict}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                    isSafe
                      ? 'border-emerald-400/40 bg-emerald-950 text-emerald-400'
                      : 'border-rose-400/40 bg-rose-950 text-rose-400'
                  }`}
                >
                  {isSafe ? 'STATUS: NOMINAL' : 'STATUS: NON-COMPLIANT'}
                </span>
              </div>

              <p className="text-xs font-tech text-slate-300 mt-0.5">
                {isSafe
                  ? 'All certified underground PPE verified. Worker cleared for shaft descent.'
                  : `Safety violation detected. ${missingItems.length} critical gear item(s) absent.`}
              </p>
            </div>
          </div>

          {/* Missing items chips or clearance badge */}
          {!isSafe && missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
              <span className="text-[10px] font-mono uppercase text-rose-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> MISSING:
              </span>
              {missingItems.map((item) => (
                <span
                  key={item}
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-900/80 border border-rose-500/60 text-white shadow-[0_0_10px_rgba(255,77,90,0.4)]"
                >
                  ✕ {item}
                </span>
              ))}
            </div>
          )}

          {isSafe && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-400 text-xs font-mono font-bold">
              <span>CLEARANCE: PASS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
