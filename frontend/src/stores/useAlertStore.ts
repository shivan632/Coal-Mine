import { create } from 'zustand';
import { IncidentAlert, SafetyStatus } from '../types/dashboard';
import { soundEffects } from '../services/soundEffects';

interface AlertState {
  alerts: IncidentAlert[];
  soundMuted: boolean;
  audioEnabled: boolean;
  emergencyLockdown: boolean;

  // Actions
  addAlert: (alert: Omit<IncidentAlert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  clearDismissed: () => void;
  clearAll: () => void;
  toggleAudio: () => void;
  toggleSound: () => void;
  triggerEmergencyLockdown: (enable: boolean) => void;
}

const INITIAL_ALERTS: IncidentAlert[] = [
  {
    id: 'ALT-1092',
    title: 'Elevated Methane Spike',
    description: 'CH4 sensor at Gas-Zone-B12 exceeded nominal limit (1.15% vol).',
    severity: 'WARNING',
    zone: 'Gas-Zone-B12',
    timestamp: Date.now() - 120000,
    acknowledged: false,
    category: 'GAS_LEAK',
    regulatoryClause: 'DGMS Reg. 153(2)',
    mitigationStep: 'Spin up auxiliary exhaust fan & monitor trend.',
  },
  {
    id: 'ALT-1091',
    title: 'Missing PPE Equipment',
    description: 'Miner Devendra Singh entered Tunnel-A04 without certified Respirator Mask.',
    severity: 'CRITICAL',
    zone: 'Tunnel-A04',
    timestamp: Date.now() - 340000,
    acknowledged: true,
    category: 'PPE_VIOLATION',
    regulatoryClause: 'OSHA 1926.95 / DGMS PPE Std',
    mitigationStep: 'Safety marshal dispatched to Entry Airway #2.',
  },
  {
    id: 'ALT-1088',
    title: 'Thermal Index Rising',
    description: 'Excavation Face ambient temperature reached 31.2°C.',
    severity: 'WARNING',
    zone: 'Excavation-Face',
    timestamp: Date.now() - 900000,
    acknowledged: true,
    category: 'THERMAL_RISK',
    regulatoryClause: 'DGMS Thermal Regulation',
    mitigationStep: 'Verify chilled water mist lines in Section 4.',
  },
];

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: INITIAL_ALERTS,
  soundMuted: false,
  audioEnabled: true,
  emergencyLockdown: false,

  addAlert: (newAlert) => {
    const alert: IncidentAlert = {
      ...newAlert,
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      acknowledged: false,
    };

    set((state) => ({
      alerts: [alert, ...state.alerts.slice(0, 19)],
    }));

    if (!get().soundMuted) {
      if (alert.severity === 'CRITICAL') {
        soundEffects.playDanger();
      } else if (alert.severity === 'WARNING') {
        soundEffects.playWarning();
      }
    }
  },

  acknowledgeAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    }));
    soundEffects.playClick();
  },

  dismissAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    }));
    soundEffects.playClick();
  },

  clearDismissed: () => {
    set((state) => ({
      alerts: state.alerts.filter((a) => !a.acknowledged),
    }));
    soundEffects.playClick();
  },

  clearAll: () => {
    set({ alerts: [] });
    soundEffects.playClick();
  },

  toggleAudio: () => {
    set((state) => {
      const nextAudio = !state.audioEnabled;
      soundEffects.enabled = nextAudio;
      return { audioEnabled: nextAudio, soundMuted: !nextAudio };
    });
  },

  toggleSound: () => {
    get().toggleAudio();
  },

  triggerEmergencyLockdown: (enable: boolean) => {
    set({ emergencyLockdown: enable });
    if (enable) {
      soundEffects.playDanger();
    }
  },
}));
