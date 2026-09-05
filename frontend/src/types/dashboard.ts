export type SafetyStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export type MineZoneId = 'Shaft-01' | 'Tunnel-A04' | 'Gas-Zone-B12' | 'Conveyor-C02' | 'Excavation-Face';

export type ATEXZoneRating = 'ATEX Zone 0' | 'ATEX Zone 1' | 'ATEX Zone 2';

export interface TelemetryPacket {
  nodeId: string;
  zone: MineZoneId;
  depthMeters: number;
  methane_CH4: number;       // % by volume: DGMS Safe < 0.75% | Action 0.75-1.25% | Critical > 1.25%
  carbonMonoxide_CO: number; // ppm: Safe < 25 | Warning 25-50 | Critical > 50
  temperature: number;       // °C: Safe 20-28 | Warning 28-35 | Critical > 35
  humidity: number;          // %: Safe 40-70 | Warning 70-85 | Critical > 85
  pressure: number;          // hPa: Safe 980-1025 | Warning <975 or >1030
  oxygen_O2: number;         // %: Safe 20.8-21.0% | Warning 19.5-20.5% | Critical < 19.5%
  airVelocity_ms: number;    // m/s: Nominal 0.5 - 2.5 m/s | Warning < 0.5 | High > 4.0 m/s
  airQualityIndex: number;   // AQI: Safe 0-50 | Warning 51-100 | Critical > 100
  atexZone: ATEXZoneRating;
  sectionPowerState: 'ACTIVE' | 'CUTOFF';
  ventilationFanState: 'NORMAL' | 'OVERDRIVE' | 'OFFLINE';
  timestamp: number;
  status: SafetyStatus;
}

export interface PPEComplianceState {
  helmet: boolean;
  safetyJacket: boolean;
  respiratorMask: boolean;
  steelBoots: boolean;
  gloves: boolean;
}

export interface WorkerInferenceResult {
  workerId: string;
  name: string;
  role: string;
  zone: MineZoneId;
  bloodGroup: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'B-' | 'A-';
  emergencyContact: string;
  shiftStartTimestamp: number;
  undergroundMinutes: number;
  maxShiftMinutes: number;
  photoUrl?: string;
  confidence: number;
  ppeCompliance: PPEComplianceState;
  verdict: 'ALL CORRECT' | 'SOMETHING IS MISSING!';
  missingItems: ('Helmet' | 'Safety Jacket' | 'Respirator Mask' | 'Steel Boots' | 'Protective Gloves')[];
  turnstileBarrierState: 'LOCKED' | 'UNLOCKED';
  lastScanned: number;
}

export interface SupervisorSignature {
  supervisorName: string;
  badgeId: string;
  correctiveAction: string;
  signedAt: number;
}

export interface IncidentAlert {
  id: string;
  title: string;
  description: string;
  severity: SafetyStatus;
  zone: MineZoneId;
  timestamp: number;
  acknowledged: boolean;
  regulatoryClause: string;
  category: 'PPE_VIOLATION' | 'GAS_LEAK' | 'THERMAL_RISK' | 'PRESSURE_DROP' | 'EVACUATION';
  mitigationStep: string;
  supervisorSignature?: SupervisorSignature;
  telemetrySnapshot?: Partial<TelemetryPacket>;
  workerSnapshot?: Partial<WorkerInferenceResult>;
}

export interface ZoneRiskMetric {
  zone: string;
  gasRisk: number;       // 0 - 100
  thermalRisk: number;   // 0 - 100
  ventilationRisk: number; // 0 - 100
  ppeCompliance: number; // 0 - 100
  overallRisk: number;   // 0 - 100
  status: SafetyStatus;
}

export interface HistoricalTelemetryPoint {
  timeLabel: string;
  timestamp: number;
  ch4: number;
  co: number;
  temp: number;
  humidity: number;
  pressure: number;
  o2: number;
  airVelocity: number;
  complianceRate: number;
  compositeSafetyIndex: number;
}

export type SimulationScenarioId = 
  | 'NOMINAL_OPERATIONS'
  | 'GAS_LEAK_ZONE_B'
  | 'PPE_NON_COMPLIANCE'
  | 'HIGH_THERMAL_ALERT'
  | 'EMERGENCY_EVACUATION';

// ============================================================================
// 1. PREDICTIVE ATMOSPHERIC HAZARD TYPES
// ============================================================================
export interface PredictiveHazardMetric {
  zone: MineZoneId;
  ch4VelocityPercentPerMin: number;
  coVelocityPpmPerMin: number;
  tempVelocityDegPerMin: number;
  projectedCh4_10m: number;
  projectedCh4_30m: number;
  timeToBreachSeconds: number | null;
  predictiveRiskLevel: 'LOW' | 'ELEVATED' | 'IMMINENT_BREACH';
  confidenceScore: number;
  lastCalculated: number;
}

// ============================================================================
// 2. AUTOMATED INTERLOCKING & CONTAINMENT TYPES
// ============================================================================
export interface InterlockZoneState {
  zone: MineZoneId;
  sectionPower: 'ACTIVE' | 'CUTOFF';
  ventilationFan: 'NORMAL' | 'OVERDRIVE' | 'OFFLINE';
  turnstileGating: 'LOCKED' | 'UNLOCKED';
  autoInterlockArmed: boolean;
  lastTripTimestamp?: number;
  lastTripReason?: string;
}

export interface InterlockAuditLog {
  id: string;
  timestamp: number;
  zone: MineZoneId;
  action: 'AUTO_TRIP_POWER' | 'AUTO_OVERDRIVE_FAN' | 'MANUAL_OVERRIDE_POWER' | 'MANUAL_OVERRIDE_FAN' | 'RESTORE_NOMINAL';
  initiatedBy: 'AUTOMATED_SAFETY_ENGINE' | 'SUPERVISOR_MANUAL_OVERRIDE';
  reason: string;
  sensorTriggerValue?: string;
}

export interface InterlockSystemState {
  autoContainmentArmed: boolean;
  zones: Record<MineZoneId, InterlockZoneState>;
  recentAuditLogs: InterlockAuditLog[];
}

export interface InterlockCommand {
  action: 'CUT_POWER' | 'RESTORE_POWER' | 'SET_FAN_OVERDRIVE' | 'SET_FAN_NORMAL' | 'LOCK_TURNSTILE' | 'UNLOCK_TURNSTILE' | 'TOGGLE_AUTO_ARM';
  zone?: MineZoneId;
  supervisorName?: string;
  badgeId?: string;
  reason?: string;
}

// ============================================================================
// 3. GEOFENCED EVACUATION & INCIDENT REPLAY TYPES
// ============================================================================
export interface EvacuationRouteNode {
  id: string;
  x: number;
  y: number;
  z: number;
  zone: MineZoneId;
  isExit: boolean;
  hazardLevel: 'SAFE' | 'WARNING' | 'TOXIC_BLOCKED';
}

export interface EvacuationPath {
  zone: MineZoneId;
  originNodeId: string;
  exitNodeId: string;
  waypoints: [number, number, number][];
  estimatedEvacuationSeconds: number;
  pathStatus: 'CLEAR' | 'HAZARD_REROUTED' | 'NO_SAFE_ROUTE';
  warningMessage?: string;
}

export interface ReplayTimelinePoint {
  offsetSeconds: number;
  timestamp: number;
  telemetry: Record<MineZoneId, Partial<TelemetryPacket>>;
  interlockState: Record<MineZoneId, { power: 'ACTIVE' | 'CUTOFF'; fan: 'NORMAL' | 'OVERDRIVE' }>;
  activeIncidents: Partial<IncidentAlert>[];
}

export interface IncidentReplayData {
  incident: IncidentAlert;
  timeline: ReplayTimelinePoint[];
  startTime: number;
  incidentTime: number;
  endTime: number;
}

export interface BackendStreamEnvelope {
  type: 
    | 'TELEMETRY_PACKET'
    | 'WORKER_PPE_INFERENCE'
    | 'INCIDENT_ALERT'
    | 'HEARTBEAT'
    | 'PREDICTIVE_HAZARD'
    | 'INTERLOCK_STATE'
    | 'EVACUATION_ROUTES'
    | 'COMMAND';
  timestamp: number;
  payload: any;
}
