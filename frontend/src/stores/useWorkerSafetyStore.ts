import { create } from 'zustand';
import { WorkerInferenceResult, PPEComplianceState } from '../types/dashboard';
import { soundEffects } from '../services/soundEffects';

interface WorkerSafetyState {
  currentWorker: WorkerInferenceResult;
  workerQueue: WorkerInferenceResult[];
  activeWorkerIndex: number;
  cameraMode: 'simulated' | 'webcam';
  isScanning: boolean;
  complianceRateToday: number; // 0-100%
  totalWorkersMonitored: number;
  totalViolationsLogged: number;

  // Actions
  setWorker: (worker: WorkerInferenceResult) => void;
  nextWorker: () => void;
  setCameraMode: (mode: 'simulated' | 'webcam') => void;
  togglePPEItem: (item: keyof PPEComplianceState) => void;
  setScanning: (scanning: boolean) => void;
}

const SAMPLE_WORKERS: WorkerInferenceResult[] = [
  {
    workerId: 'MINER-4091',
    name: 'Rajesh Kumar',
    role: 'Deep Shaft Operator',
    zone: 'Tunnel-A04',
    bloodGroup: 'O+',
    emergencyContact: '+91 98450 12890',
    shiftStartTimestamp: Date.now() - 4.5 * 3600000,
    undergroundMinutes: 270,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    confidence: 99.2,
    ppeCompliance: {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    },
    verdict: 'ALL CORRECT',
    missingItems: [],
    turnstileBarrierState: 'UNLOCKED',
    lastScanned: Date.now(),
  },
  {
    workerId: 'MINER-8422',
    name: 'Devendra Singh',
    role: 'Excavation Drill Master',
    zone: 'Gas-Zone-B12',
    bloodGroup: 'B+',
    emergencyContact: '+91 98231 44520',
    shiftStartTimestamp: Date.now() - 3.2 * 3600000,
    undergroundMinutes: 192,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    confidence: 97.8,
    ppeCompliance: {
      helmet: false,
      safetyJacket: true,
      respiratorMask: false,
      steelBoots: true,
      gloves: false,
    },
    verdict: 'SOMETHING IS MISSING!',
    missingItems: ['Helmet', 'Respirator Mask', 'Protective Gloves'],
    turnstileBarrierState: 'LOCKED',
    lastScanned: Date.now() - 45000,
  },
  {
    workerId: 'MINER-1290',
    name: 'Amitabh Sharma',
    role: 'Ventilation Tech',
    zone: 'Shaft-01',
    bloodGroup: 'A+',
    emergencyContact: '+91 94120 77310',
    shiftStartTimestamp: Date.now() - 6.8 * 3600000,
    undergroundMinutes: 408,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    confidence: 98.6,
    ppeCompliance: {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    },
    verdict: 'ALL CORRECT',
    missingItems: [],
    turnstileBarrierState: 'UNLOCKED',
    lastScanned: Date.now() - 90000,
  },
  {
    workerId: 'MINER-6743',
    name: 'Sunil Mondal',
    role: 'Conveyor Loader',
    zone: 'Conveyor-C02',
    bloodGroup: 'AB+',
    emergencyContact: '+91 91560 99401',
    shiftStartTimestamp: Date.now() - 5.1 * 3600000,
    undergroundMinutes: 306,
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    confidence: 96.4,
    ppeCompliance: {
      helmet: false,
      safetyJacket: true,
      respiratorMask: false,
      steelBoots: true,
      gloves: false,
    },
    verdict: 'SOMETHING IS MISSING!',
    missingItems: ['Helmet', 'Respirator Mask', 'Protective Gloves'],
    turnstileBarrierState: 'LOCKED',
    lastScanned: Date.now() - 140000,
  },
];

export const useWorkerSafetyStore = create<WorkerSafetyState>((set, get) => ({
  currentWorker: SAMPLE_WORKERS[0],
  workerQueue: SAMPLE_WORKERS,
  activeWorkerIndex: 0,
  cameraMode: 'simulated',
  isScanning: true,
  complianceRateToday: 94.6,
  totalWorkersMonitored: 48,
  totalViolationsLogged: 3,

  setWorker: (worker) => set({ currentWorker: worker }),

  nextWorker: () => {
    const { workerQueue, activeWorkerIndex } = get();
    const nextIdx = (activeWorkerIndex + 1) % workerQueue.length;
    const nextWorker = workerQueue[nextIdx];

    set({
      activeWorkerIndex: nextIdx,
      currentWorker: nextWorker,
      isScanning: true,
    });

    if (nextWorker.verdict === 'ALL CORRECT') {
      soundEffects.playSuccess();
    } else {
      soundEffects.playWarning();
    }
  },

  setCameraMode: (mode) => set({ cameraMode: mode }),

  togglePPEItem: (item) => {
    const { currentWorker } = get();
    const newCompliance = {
      ...currentWorker.ppeCompliance,
      [item]: !currentWorker.ppeCompliance[item],
    };

    const missing: ('Helmet' | 'Safety Jacket' | 'Respirator Mask' | 'Steel Boots' | 'Protective Gloves')[] = [];
    if (!newCompliance.helmet) missing.push('Helmet');
    if (!newCompliance.safetyJacket) missing.push('Safety Jacket');
    if (!newCompliance.respiratorMask) missing.push('Respirator Mask');
    if (!newCompliance.steelBoots) missing.push('Steel Boots');
    if (!newCompliance.gloves) missing.push('Protective Gloves');

    const isAllCorrect = missing.length === 0;
    const newVerdict = isAllCorrect ? 'ALL CORRECT' : 'SOMETHING IS MISSING!';

    const updatedWorker: WorkerInferenceResult = {
      ...currentWorker,
      ppeCompliance: newCompliance,
      missingItems: missing,
      verdict: newVerdict,
      turnstileBarrierState: isAllCorrect ? 'UNLOCKED' : 'LOCKED',
      lastScanned: Date.now(),
    };

    set({ currentWorker: updatedWorker });

    if (isAllCorrect) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playWarning();
    }
  },

  setScanning: (scanning) => set({ isScanning: scanning }),
}));
