import { create } from 'zustand';
import { IncidentAlert } from '../types/dashboard';

interface AiCopilotState {
  isCopilotOpen: boolean;
  selectedIncident: IncidentAlert | null;
  initialPrompt: string | null;
  aiStatus: 'CONNECTED' | 'ERROR' | 'CHECKING';
  activeModel: string;
  latencyMs: number;

  openCopilot: (prompt?: string) => void;
  closeCopilot: () => void;
  openIncidentAssessment: (incident: IncidentAlert) => void;
  closeIncidentAssessment: () => void;
  setAiStatus: (status: 'CONNECTED' | 'ERROR' | 'CHECKING', model?: string, latencyMs?: number) => void;
}

export const useAiCopilotStore = create<AiCopilotState>((set) => ({
  isCopilotOpen: false,
  selectedIncident: null,
  initialPrompt: null,
  aiStatus: 'CHECKING',
  activeModel: 'openrouter/free',
  latencyMs: 450,

  openCopilot: (prompt) =>
    set({
      isCopilotOpen: true,
      initialPrompt: prompt || null,
    }),

  closeCopilot: () =>
    set({
      isCopilotOpen: false,
      initialPrompt: null,
    }),

  openIncidentAssessment: (incident) =>
    set({
      selectedIncident: incident,
    }),

  closeIncidentAssessment: () =>
    set({
      selectedIncident: null,
    }),

  setAiStatus: (status, model, latencyMs) =>
    set((state) => ({
      aiStatus: status,
      activeModel: model || state.activeModel,
      latencyMs: latencyMs !== undefined ? latencyMs : state.latencyMs,
    })),
}));
