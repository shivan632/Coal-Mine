import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  FileCheck2,
  Zap,
  Activity,
  Bot,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAiCopilotStore } from '../../stores/useAiCopilotStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { aiService, IncidentAnalysisResult } from '../../services/aiService';

export const IncidentAiAssessmentModal: React.FC = () => {
  const selectedIncident = useAiCopilotStore((state) => state.selectedIncident);
  const closeIncidentAssessment = useAiCopilotStore((state) => state.closeIncidentAssessment);
  const openCopilot = useAiCopilotStore((state) => state.openCopilot);
  const currentPacket = useTelemetryStore((state) => state.currentPacket);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IncidentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedIncident) {
      setLoading(true);
      setError(null);
      aiService
        .analyzeIncident(selectedIncident, currentPacket)
        .then((result) => {
          setAnalysis(result);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Incident analysis failed:', err);
          setError(err.message || 'Failed to complete AI analysis');
          setLoading(false);
        });
    } else {
      setAnalysis(null);
    }
  }, [selectedIncident]);

  const handleAskFollowUp = () => {
    if (!selectedIncident) return;
    const prompt = `Following up on incident "${selectedIncident.title}" in sector ${selectedIncident.zone}: What are the statutory ventilation requirements and re-entry protocols before underground workers are permitted back inbye?`;
    closeIncidentAssessment();
    openCopilot(prompt);
  };

  if (!selectedIncident) return null;

  const isCritical = selectedIncident.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#040C18] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,212,255,0.25)] flex flex-col overflow-hidden text-slate-100">
        {/* Top Glowing Alert Strip */}
        <div
          className={`h-1.5 w-full ${
            isCritical
              ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse'
              : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#071527]">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl border ${
                isCritical
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hud text-base font-bold text-white tracking-wide">
                  AI STATUTORY INCIDENT AUDIT
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isCritical
                      ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                  }`}
                >
                  {selectedIncident.severity}
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/80">
                {selectedIncident.title} • Sector: {selectedIncident.zone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeIncidentAssessment}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-[#030913] to-[#051121]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative flex">
                <Bot className="w-12 h-12 text-cyan-400 animate-pulse" />
                <span className="animate-ping absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-cyan-400 opacity-75" />
              </div>
              <h3 className="font-hud text-sm font-bold text-white tracking-wider">
                SYNTHESIZING OPENROUTER THREAT AUDIT...
              </h3>
              <p className="text-xs font-mono text-cyan-300/70 max-w-sm">
                Evaluating gas kinetics, CMR 2017 regulatory codes, and automated interlock directives.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>AI Assessment Request Failed</span>
              </div>
              <p>{error}</p>
            </div>
          ) : analysis ? (
            <>
              {/* 1. Root Cause Analysis Card */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#07182C]/80 shadow-md">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold border-b border-cyan-500/20 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>TECHNICAL ROOT-CAUSE INVESTIGATION</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Model: {analysis.modelUsed}
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-relaxed">
                  {analysis.rootCause}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-slate-400">
                    HAZARD RATING: <strong className="text-rose-400">{analysis.immediateHazardRating}</strong>
                  </span>
                  <span className="text-slate-400">
                    EVACUATION RADIUS:{' '}
                    <strong className="text-amber-300">{analysis.evacuationRadiusMeters} meters</strong>
                  </span>
                </div>
              </div>

              {/* 2. Automated SCADA Interlock Directives */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-[#120B24]/80 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold border-b border-purple-500/20 pb-2 mb-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>AUTOMATED SCADA INTERLOCK DIRECTIVES</span>
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-purple-200">
                  {analysis.automatedInterlockDirectives.map((cmd, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">▶</span>
                      <span>{cmd}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Statutory DGMS / CMR Violations */}
              <div className="p-4 rounded-xl border border-rose-500/30 bg-[#210913]/70 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 font-bold border-b border-rose-500/20 pb-2 mb-2.5">
                  <FileCheck2 className="w-4 h-4 text-rose-400" />
                  <span>DGMS / CMR 2017 STATUTORY CITATIONS</span>
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-rose-200">
                  {analysis.dgmsStatutoryViolations.map((viol, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">§</span>
                      <span>{viol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Prioritized Immediate Mitigation Steps */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#061C16]/80 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-300 font-bold border-b border-emerald-500/20 pb-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>PRIORITIZED ACTION CHECKLIST</span>
                </div>
                <ol className="space-y-2 text-xs font-sans text-emerald-100">
                  {analysis.recommendedImmediateActions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-snug pt-0.5">{act}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#06111F] border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAskFollowUp}
            className="px-4 py-2 rounded-xl bg-[#091F36] hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all hover:border-cyan-400 shadow-sm"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Consult Neural Safety Advisor</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={closeIncidentAssessment}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            Dismiss Audit
          </button>
        </div>
      </div>
    </div>
  );
};
