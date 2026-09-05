import { create } from 'zustand';
import {
  TelemetryPacket,
  MineZoneId,
  SafetyStatus,
  HistoricalTelemetryPoint,
  ZoneRiskMetric,
  PredictiveHazardMetric,
  InterlockSystemState,
  EvacuationPath,
} from '../types/dashboard';

interface TelemetryState {
  currentPacket: TelemetryPacket;
  activeZone: MineZoneId;
  zonePackets: Record<MineZoneId, TelemetryPacket>;
  zoneRisks: ZoneRiskMetric[];
  historicalSeries: HistoricalTelemetryPoint[];
  mineSafetyIndex: number; // 0 to 100
  overallStatus: SafetyStatus;
  selected3DNode: string | null;
  cameraPreset: 'orbit' | 'shaft' | 'gasZone' | 'conveyor';
  emergencyEvacuationActive: boolean;

  // Predictive Atmospheric Engine & Interlocking state
  predictiveMetrics: Record<MineZoneId, PredictiveHazardMetric>;
  interlockState: InterlockSystemState | null;
  evacuationRoutes: Record<MineZoneId, EvacuationPath>;
  isReplayModalOpen: boolean;
  replayIncidentId: string | null;

  // Actions
  updateTelemetry: (packet: TelemetryPacket) => void;
  setActiveZone: (zone: MineZoneId) => void;
  setSelected3DNode: (nodeId: string | null) => void;
  setCameraPreset: (preset: 'orbit' | 'shaft' | 'gasZone' | 'conveyor') => void;
  setEmergencyEvacuation: (active: boolean) => void;
  calculateMineSafetyIndex: () => void;
  setPredictiveMetrics: (metrics: Record<MineZoneId, PredictiveHazardMetric>) => void;
  setInterlockState: (state: InterlockSystemState) => void;
  setEvacuationRoutes: (routes: Record<MineZoneId, EvacuationPath>) => void;
  openReplayModal: (incidentId?: string) => void;
  closeReplayModal: () => void;
}

const DEFAULT_PACKET: TelemetryPacket = {
  nodeId: 'NODE-A04',
  zone: 'Tunnel-A04',
  depthMeters: 750,
  methane_CH4: 0.45,
  carbonMonoxide_CO: 12.0,
  temperature: 24.8,
  humidity: 58.4,
  pressure: 1013.2,
  oxygen_O2: 20.9,
  airVelocity_ms: 1.6,
  airQualityIndex: 24,
  atexZone: 'ATEX Zone 2',
  sectionPowerState: 'ACTIVE',
  ventilationFanState: 'NORMAL',
  timestamp: Date.now(),
  status: 'NOMINAL',
};

const INITIAL_ZONE_PACKETS: Record<MineZoneId, TelemetryPacket> = {
  'Shaft-01': { ...DEFAULT_PACKET, nodeId: 'NODE-SHAFT-01', zone: 'Shaft-01', depthMeters: 300, methane_CH4: 0.25, temperature: 22.1, atexZone: 'ATEX Zone 2' },
  'Tunnel-A04': { ...DEFAULT_PACKET, nodeId: 'NODE-A04', zone: 'Tunnel-A04', depthMeters: 750, methane_CH4: 0.45, temperature: 24.8, atexZone: 'ATEX Zone 2' },
  'Gas-Zone-B12': { ...DEFAULT_PACKET, nodeId: 'NODE-B12', zone: 'Gas-Zone-B12', depthMeters: 1200, methane_CH4: 0.88, temperature: 29.4, atexZone: 'ATEX Zone 1', status: 'WARNING' },
  'Conveyor-C02': { ...DEFAULT_PACKET, nodeId: 'NODE-C02', zone: 'Conveyor-C02', depthMeters: 920, methane_CH4: 0.38, temperature: 26.0, atexZone: 'ATEX Zone 2' },
  'Excavation-Face': { ...DEFAULT_PACKET, nodeId: 'NODE-EXCAV', zone: 'Excavation-Face', depthMeters: 1450, methane_CH4: 0.72, temperature: 31.2, atexZone: 'ATEX Zone 1' },
};

const INITIAL_PREDICTIVE_METRICS: Record<MineZoneId, PredictiveHazardMetric> = {
  'Shaft-01': {
    zone: 'Shaft-01',
    ch4VelocityPercentPerMin: 0.002,
    coVelocityPpmPerMin: 0.1,
    tempVelocityDegPerMin: 0.05,
    projectedCh4_10m: 0.27,
    projectedCh4_30m: 0.31,
    timeToBreachSeconds: null,
    predictiveRiskLevel: 'LOW',
    confidenceScore: 92,
    lastCalculated: Date.now(),
  },
  'Tunnel-A04': {
    zone: 'Tunnel-A04',
    ch4VelocityPercentPerMin: 0.005,
    coVelocityPpmPerMin: 0.2,
    tempVelocityDegPerMin: 0.08,
    projectedCh4_10m: 0.50,
    projectedCh4_30m: 0.60,
    timeToBreachSeconds: null,
    predictiveRiskLevel: 'LOW',
    confidenceScore: 89,
    lastCalculated: Date.now(),
  },
  'Gas-Zone-B12': {
    zone: 'Gas-Zone-B12',
    ch4VelocityPercentPerMin: 0.038,
    coVelocityPpmPerMin: 1.4,
    tempVelocityDegPerMin: 0.22,
    projectedCh4_10m: 1.26,
    projectedCh4_30m: 2.02,
    timeToBreachSeconds: 580, // ~9.6 mins to breach 1.25%
    predictiveRiskLevel: 'IMMINENT_BREACH',
    confidenceScore: 95,
    lastCalculated: Date.now(),
  },
  'Conveyor-C02': {
    zone: 'Conveyor-C02',
    ch4VelocityPercentPerMin: 0.003,
    coVelocityPpmPerMin: 0.1,
    tempVelocityDegPerMin: 0.06,
    projectedCh4_10m: 0.41,
    projectedCh4_30m: 0.47,
    timeToBreachSeconds: null,
    predictiveRiskLevel: 'LOW',
    confidenceScore: 88,
    lastCalculated: Date.now(),
  },
  'Excavation-Face': {
    zone: 'Excavation-Face',
    ch4VelocityPercentPerMin: 0.012,
    coVelocityPpmPerMin: 0.6,
    tempVelocityDegPerMin: 0.28,
    projectedCh4_10m: 0.84,
    projectedCh4_30m: 1.08,
    timeToBreachSeconds: 1650, // ~27.5 mins
    predictiveRiskLevel: 'ELEVATED',
    confidenceScore: 91,
    lastCalculated: Date.now(),
  },
};

const INITIAL_INTERLOCK_STATE: InterlockSystemState = {
  autoContainmentArmed: true,
  zones: {
    'Shaft-01': { zone: 'Shaft-01', sectionPower: 'ACTIVE', ventilationFan: 'NORMAL', turnstileGating: 'UNLOCKED', autoInterlockArmed: true },
    'Tunnel-A04': { zone: 'Tunnel-A04', sectionPower: 'ACTIVE', ventilationFan: 'NORMAL', turnstileGating: 'UNLOCKED', autoInterlockArmed: true },
    'Gas-Zone-B12': { zone: 'Gas-Zone-B12', sectionPower: 'ACTIVE', ventilationFan: 'NORMAL', turnstileGating: 'UNLOCKED', autoInterlockArmed: true },
    'Conveyor-C02': { zone: 'Conveyor-C02', sectionPower: 'ACTIVE', ventilationFan: 'NORMAL', turnstileGating: 'UNLOCKED', autoInterlockArmed: true },
    'Excavation-Face': { zone: 'Excavation-Face', sectionPower: 'ACTIVE', ventilationFan: 'NORMAL', turnstileGating: 'UNLOCKED', autoInterlockArmed: true },
  },
  recentAuditLogs: [
    {
      id: 'ITL-INIT-01',
      timestamp: Date.now() - 3600000,
      zone: 'Gas-Zone-B12',
      action: 'RESTORE_NOMINAL',
      initiatedBy: 'AUTOMATED_SAFETY_ENGINE',
      reason: 'Safety Containment Loop ARMED (DGMS Reg. 153 Active Protection)',
      sensorTriggerValue: 'Nominal Baseline',
    },
  ],
};

const INITIAL_EVACUATION_ROUTES: Record<MineZoneId, EvacuationPath> = {
  'Shaft-01': {
    zone: 'Shaft-01',
    originNodeId: 'MAIN_LIFT',
    exitNodeId: 'SURFACE_EXIT',
    waypoints: [[0, 2.5, 0], [0, 5.0, 0]],
    estimatedEvacuationSeconds: 90,
    pathStatus: 'CLEAR',
  },
  'Tunnel-A04': {
    zone: 'Tunnel-A04',
    originNodeId: 'TUNNEL_A_END',
    exitNodeId: 'SURFACE_EXIT',
    waypoints: [[-3.8, 0.2, 0], [-1.5, 0.2, 0], [0, 2.5, 0], [0, 5.0, 0]],
    estimatedEvacuationSeconds: 180,
    pathStatus: 'CLEAR',
  },
  'Gas-Zone-B12': {
    zone: 'Gas-Zone-B12',
    originNodeId: 'GAS_ZONE_B',
    exitNodeId: 'SURFACE_EXIT',
    waypoints: [[3.8, -3.2, 0], [0.5, -2.0, 0.2], [-1.5, 0.2, 0], [0, 2.5, 0], [0, 5.0, 0]],
    estimatedEvacuationSeconds: 225,
    pathStatus: 'CLEAR',
  },
  'Conveyor-C02': {
    zone: 'Conveyor-C02',
    originNodeId: 'CONVEYOR_C',
    exitNodeId: 'SURFACE_EXIT',
    waypoints: [[0, -1.8, 3.2], [0.5, -2.0, 0.2], [0, 2.5, 0], [0, 5.0, 0]],
    estimatedEvacuationSeconds: 180,
    pathStatus: 'CLEAR',
  },
  'Excavation-Face': {
    zone: 'Excavation-Face',
    originNodeId: 'DEEP_EXCAVATION',
    exitNodeId: 'SURFACE_EXIT',
    waypoints: [[0, -5.5, 0], [0.5, -2.0, 0.2], [0, 2.5, 0], [0, 5.0, 0]],
    estimatedEvacuationSeconds: 270,
    pathStatus: 'CLEAR',
  },
};

const INITIAL_RISKS: ZoneRiskMetric[] = [
  { zone: 'Tunnel A-04', gasRisk: 22, thermalRisk: 26, ventilationRisk: 14, ppeCompliance: 98, overallRisk: 20, status: 'NOMINAL' },
  { zone: 'Gas Zone B-12', gasRisk: 72, thermalRisk: 58, ventilationRisk: 64, ppeCompliance: 84, overallRisk: 68, status: 'WARNING' },
  { zone: 'Shaft 01 Entry', gasRisk: 10, thermalRisk: 18, ventilationRisk: 12, ppeCompliance: 100, overallRisk: 12, status: 'NOMINAL' },
  { zone: 'Conveyor C-02', gasRisk: 34, thermalRisk: 40, ventilationRisk: 28, ppeCompliance: 94, overallRisk: 32, status: 'NOMINAL' },
  { zone: 'Deep Face D-01', gasRisk: 58, thermalRisk: 66, ventilationRisk: 52, ppeCompliance: 88, overallRisk: 59, status: 'WARNING' },
];

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  currentPacket: DEFAULT_PACKET,
  activeZone: 'Tunnel-A04',
  zonePackets: INITIAL_ZONE_PACKETS,
  zoneRisks: INITIAL_RISKS,
  historicalSeries: Array.from({ length: 20 }).map((_, i) => {
    const time = new Date(Date.now() - (20 - i) * 60000);
    return {
      timeLabel: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: time.getTime(),
      ch4: +(0.4 + Math.random() * 0.25).toFixed(2),
      co: +(10 + Math.random() * 4).toFixed(1),
      temp: +(24.0 + Math.random() * 1.5).toFixed(1),
      humidity: +(56 + Math.random() * 6).toFixed(1),
      pressure: +(1013 + Math.random() * 2).toFixed(1),
      o2: +(20.9 + Math.random() * 0.1).toFixed(1),
      airVelocity: +(1.5 + Math.random() * 0.4).toFixed(1),
      complianceRate: +(94 + Math.random() * 5).toFixed(1),
      compositeSafetyIndex: +(92 + Math.random() * 5).toFixed(1),
    };
  }),
  mineSafetyIndex: 94,
  overallStatus: 'NOMINAL',
  selected3DNode: null,
  cameraPreset: 'orbit',
  emergencyEvacuationActive: false,

  predictiveMetrics: INITIAL_PREDICTIVE_METRICS,
  interlockState: INITIAL_INTERLOCK_STATE,
  evacuationRoutes: INITIAL_EVACUATION_ROUTES,
  isReplayModalOpen: false,
  replayIncidentId: null,

  updateTelemetry: (packet: TelemetryPacket) => {
    set((state) => {
      const updatedZonePackets = {
        ...state.zonePackets,
        [packet.zone]: packet,
      };

      const now = new Date(packet.timestamp);
      const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newPoint: HistoricalTelemetryPoint = {
        timeLabel,
        timestamp: packet.timestamp,
        ch4: packet.methane_CH4,
        co: packet.carbonMonoxide_CO,
        temp: packet.temperature,
        humidity: packet.humidity,
        pressure: packet.pressure,
        o2: packet.oxygen_O2,
        airVelocity: packet.airVelocity_ms,
        complianceRate: 94,
        compositeSafetyIndex: state.mineSafetyIndex,
      };

      const newHistory = [...state.historicalSeries.slice(-29), newPoint];

      // DGMS & OSHA Regulatory Safety Check
      let overall: SafetyStatus = 'NOMINAL';
      if (packet.methane_CH4 >= 1.25 || packet.carbonMonoxide_CO > 50 || packet.temperature > 35 || packet.oxygen_O2 < 19.5) {
        overall = 'CRITICAL';
      } else if (packet.methane_CH4 >= 0.75 || packet.carbonMonoxide_CO > 25 || packet.temperature > 28 || packet.airVelocity_ms < 0.5) {
        overall = 'WARNING';
      }

      return {
        currentPacket: packet,
        zonePackets: updatedZonePackets,
        historicalSeries: newHistory,
        overallStatus: overall,
      };
    });
    get().calculateMineSafetyIndex();
  },

  setActiveZone: (zone: MineZoneId) => {
    set((state) => ({
      activeZone: zone,
      currentPacket: state.zonePackets[zone] || state.currentPacket,
    }));
  },

  setSelected3DNode: (nodeId: string | null) => set({ selected3DNode: nodeId }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setEmergencyEvacuation: (active) => set({ emergencyEvacuationActive: active }),

  setPredictiveMetrics: (metrics) => set({ predictiveMetrics: metrics }),
  setInterlockState: (state) => set({ interlockState: state }),
  setEvacuationRoutes: (routes) => set({ evacuationRoutes: routes }),

  openReplayModal: (incidentId?: string) =>
    set({ isReplayModalOpen: true, replayIncidentId: incidentId || 'ALT-SAMPLE-REPLAY' }),
  closeReplayModal: () => set({ isReplayModalOpen: false, replayIncidentId: null }),

  calculateMineSafetyIndex: () => {
    const { currentPacket } = get();
    let score = 100;
    
    // DGMS Methane Regulation
    if (currentPacket.methane_CH4 >= 1.25) score -= 45;
    else if (currentPacket.methane_CH4 >= 0.75) score -= (currentPacket.methane_CH4 - 0.75) * 40;

    // IS/IEC CO Regulation
    if (currentPacket.carbonMonoxide_CO > 50) score -= 30;
    else if (currentPacket.carbonMonoxide_CO > 25) score -= (currentPacket.carbonMonoxide_CO - 25) * 0.8;

    // Thermal limit
    if (currentPacket.temperature > 35) score -= 20;
    else if (currentPacket.temperature > 28) score -= (currentPacket.temperature - 28) * 2;

    // Hypoxia risk
    if (currentPacket.oxygen_O2 < 19.5) score -= 40;

    // Air stagnation penalty
    if (currentPacket.airVelocity_ms < 0.5) score -= 15;

    score = Math.max(8, Math.min(99, Math.round(score)));
    set({ mineSafetyIndex: score });
  },
}));
