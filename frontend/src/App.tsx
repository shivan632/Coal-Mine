import React, { useEffect } from 'react';
import { CommandHeader } from './components/layout/CommandHeader';
import { TopMetricStatsStrip } from './components/layout/TopMetricStatsStrip';
import { VideoInferenceCanvas } from './components/ai-camera/VideoInferenceCanvas';
import { ComplianceVerdictBanner } from './components/ai-camera/ComplianceVerdictBanner';
import { TurnstileRelayGating } from './components/ai-camera/TurnstileRelayGating';
import { PPEChecklistDeck } from './components/ai-camera/PPEChecklistDeck';
import { MineDigitalTwin3D } from './components/3d/MineDigitalTwin3D';
import { CompositeSafetyGauge } from './components/sensors/CompositeSafetyGauge';
import { SensorFlipMatrix } from './components/sensors/SensorFlipMatrix';
import { RiskRadarMatrix } from './components/sensors/RiskRadarMatrix';
import { IncidentDispatcher } from './components/sensors/IncidentDispatcher';
import { PredictiveHazardRadar } from './components/sensors/PredictiveHazardRadar';
import { AutomatedInterlockPanel } from './components/sensors/AutomatedInterlockPanel';
import { IncidentReplayModal } from './components/modals/IncidentReplayModal';
import { OpenRouterSafetyCopilotModal } from './components/modals/OpenRouterSafetyCopilotModal';
import { IncidentAiAssessmentModal } from './components/modals/IncidentAiAssessmentModal';
import { MultiAxisTelemetryHistory } from './components/bottom-panel/MultiAxisTelemetryHistory';
import { ScenarioSimulationDeck } from './components/bottom-panel/ScenarioSimulationDeck';
import { useWorkerSafetyStore } from './stores/useWorkerSafetyStore';
import { telemetryStream } from './services/telemetryStream';
import { Shield, Code, Wifi, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const currentWorker = useWorkerSafetyStore((state) => state.currentWorker);

  // Initialize simulated telemetry & websocket adapter stream
  useEffect(() => {
    telemetryStream.start();
    return () => {
      telemetryStream.stop();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#030812] text-slate-100 flex flex-col cyber-grid-bg cyber-radial-overlay overflow-x-hidden">
      {/* 1. Command Header */}
      <CommandHeader />

      {/* 2. Main Dashboard Canvas Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-5">
        {/* Top KPI Metrics Strip */}
        <TopMetricStatsStrip />

        {/* 3-Column Interactive Command Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-start">
          {/* LEFT COLUMN: AI Vision & PPE Inspection Terminal (4 Columns on XL) */}
          <section className="xl:col-span-4 flex flex-col gap-4 w-full">
            <VideoInferenceCanvas />
            <ComplianceVerdictBanner
              verdict={currentWorker.verdict}
              missingItems={currentWorker.missingItems}
            />
            <TurnstileRelayGating />
            <PPEChecklistDeck />
          </section>

          {/* CENTER COLUMN: 3D Mine Digital Twin & Spatial Matrix (5 Columns on XL) */}
          <section className="xl:col-span-5 flex flex-col gap-4 w-full h-full">
            <MineDigitalTwin3D />
            <SensorFlipMatrix />
          </section>

          {/* RIGHT COLUMN: Safety Gauge, Risk Radar & Live Incident Feed (3 Columns on XL) */}
          <section className="xl:col-span-3 flex flex-col gap-4 w-full">
            <CompositeSafetyGauge />
            <RiskRadarMatrix />
            <IncidentDispatcher />
          </section>
        </div>

        {/* PREDICTIVE HAZARD ENGINE & AUTOMATED INTERLOCKING COMMAND SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          <PredictiveHazardRadar />
          <AutomatedInterlockPanel />
        </section>

        {/* BOTTOM SECTION: Historical Analytics & Scenario Simulation Controller */}
        <section className="flex flex-col gap-4 w-full mt-2">
          <MultiAxisTelemetryHistory />
          <ScenarioSimulationDeck />
        </section>

        {/* Clean Footer with Backend Integration Ready Badge */}
        <footer className="mt-6 pt-4 pb-2 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">COALGUARD AI COMMAND CENTER</span>
            <span>— Mission Critical Underground Safety System</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#091B2E] border border-cyan-500/30 text-cyan-300 text-[11px]">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>OPENROUTER AI ENGINE ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#091B2E] border border-emerald-500/30 text-emerald-300 text-[11px]">
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>LIVE WS STREAM :8081</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Chronological Incident Flight Recorder Replay Modal */}
      <IncidentReplayModal />

      {/* OpenRouter Mission-Critical Neural Safety Advisor Modal */}
      <OpenRouterSafetyCopilotModal />

      {/* Structured AI Incident Threat Assessment Modal */}
      <IncidentAiAssessmentModal />
    </div>
  );
};

export default App;
