import { TelemetryPacket, MineZoneId, SafetyStatus } from '../types/dashboard.js';
import { TelemetryModel } from '../models/Telemetry.js';
import { wsService } from './websocketService.js';
import { predictiveEngine } from './predictiveEngine.js';
import { interlockEngine } from './interlockEngine.js';
import { evacuationEngine } from './evacuationEngine.js';
import { ENV } from '../config/env.js';

class TelemetryEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private tickCounter = 0;
  private lastPredictiveAlertTimestamp: Record<MineZoneId, number> = {
    'Shaft-01': 0,
    'Tunnel-A04': 0,
    'Gas-Zone-B12': 0,
    'Conveyor-C02': 0,
    'Excavation-Face': 0,
  };

  private currentPackets: Record<MineZoneId, TelemetryPacket> = {
    'Shaft-01': {
      nodeId: 'NODE-SHAFT-01',
      zone: 'Shaft-01',
      depthMeters: 300,
      methane_CH4: 0.25,
      carbonMonoxide_CO: 8.5,
      temperature: 22.1,
      humidity: 52.0,
      pressure: 1018.0,
      oxygen_O2: 20.9,
      airVelocity_ms: 2.1,
      airQualityIndex: 18,
      atexZone: 'ATEX Zone 2',
      sectionPowerState: 'ACTIVE',
      ventilationFanState: 'NORMAL',
      timestamp: Date.now(),
      status: 'NOMINAL',
    },
    'Tunnel-A04': {
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
    },
    'Gas-Zone-B12': {
      nodeId: 'NODE-B12',
      zone: 'Gas-Zone-B12',
      depthMeters: 1200,
      methane_CH4: 0.88,
      carbonMonoxide_CO: 22.0,
      temperature: 29.4,
      humidity: 68.0,
      pressure: 1008.0,
      oxygen_O2: 20.4,
      airVelocity_ms: 1.2,
      airQualityIndex: 54,
      atexZone: 'ATEX Zone 1',
      sectionPowerState: 'ACTIVE',
      ventilationFanState: 'NORMAL',
      timestamp: Date.now(),
      status: 'WARNING',
    },
    'Conveyor-C02': {
      nodeId: 'NODE-C02',
      zone: 'Conveyor-C02',
      depthMeters: 920,
      methane_CH4: 0.38,
      carbonMonoxide_CO: 14.2,
      temperature: 26.0,
      humidity: 61.5,
      pressure: 1012.0,
      oxygen_O2: 20.8,
      airVelocity_ms: 1.8,
      airQualityIndex: 30,
      atexZone: 'ATEX Zone 2',
      sectionPowerState: 'ACTIVE',
      ventilationFanState: 'NORMAL',
      timestamp: Date.now(),
      status: 'NOMINAL',
    },
    'Excavation-Face': {
      nodeId: 'NODE-EXCAV',
      zone: 'Excavation-Face',
      depthMeters: 1450,
      methane_CH4: 0.72,
      carbonMonoxide_CO: 28.5,
      temperature: 31.2,
      humidity: 78.0,
      pressure: 996.0,
      oxygen_O2: 20.1,
      airVelocity_ms: 0.8,
      airQualityIndex: 68,
      atexZone: 'ATEX Zone 1',
      sectionPowerState: 'ACTIVE',
      ventilationFanState: 'NORMAL',
      timestamp: Date.now(),
      status: 'WARNING',
    },
  };

  public start() {
    if (this.intervalId) return;

    console.log('[CoalGuard Engine] Starting Telemetry Jitter, Predictive AI & Interlocking Loop...');
    const zones: MineZoneId[] = [
      'Shaft-01',
      'Tunnel-A04',
      'Gas-Zone-B12',
      'Conveyor-C02',
      'Excavation-Face',
    ];
    let zoneIndex = 0;

    this.intervalId = setInterval(async () => {
      this.tickCounter++;
      const zone = zones[zoneIndex % zones.length];
      zoneIndex++;

      const current = this.currentPackets[zone];
      const ch4Noise = (Math.random() - 0.49) * 0.02;
      const coNoise = (Math.random() - 0.5) * 0.4;
      const tempNoise = (Math.random() - 0.5) * 0.1;
      const humNoise = (Math.random() - 0.5) * 0.3;

      const newCh4 = Math.max(0.1, +(current.methane_CH4 + ch4Noise).toFixed(2));
      const newCo = Math.max(2, +(current.carbonMonoxide_CO + coNoise).toFixed(1));
      const newTemp = +(current.temperature + tempNoise).toFixed(1);
      const newHum = Math.max(20, Math.min(99, +(current.humidity + humNoise).toFixed(1)));

      let status: SafetyStatus = 'NOMINAL';
      if (newCh4 >= 1.25 || newCo > 50 || newTemp > 35) {
        status = 'CRITICAL';
      } else if (newCh4 >= 0.75 || newCo > 25 || newTemp > 28) {
        status = 'WARNING';
      }

      // 1. Evaluate Automated Interlocking System
      const interlockZoneState = interlockEngine.getZoneState(zone);
      const rawPacket: TelemetryPacket = {
        ...current,
        methane_CH4: newCh4,
        carbonMonoxide_CO: newCo,
        temperature: newTemp,
        humidity: newHum,
        sectionPowerState: interlockZoneState.sectionPower,
        ventilationFanState: interlockZoneState.ventilationFan,
        timestamp: Date.now(),
        status,
      };

      const interlockResult = interlockEngine.evaluateTelemetry(rawPacket);

      // Reflect any automated interlock trips in the broadcasted packet
      const updatedInterlock = interlockEngine.getZoneState(zone);
      const updatedPacket: TelemetryPacket = {
        ...rawPacket,
        sectionPowerState: updatedInterlock.sectionPower,
        ventilationFanState: updatedInterlock.ventilationFan,
      };

      this.currentPackets[zone] = updatedPacket;

      // 2. Feed to Predictive Hazard Engine
      const predictiveMetric = predictiveEngine.recordReading(updatedPacket);

      // Check if predictive warning alert should be triggered
      if (
        predictiveMetric.predictiveRiskLevel === 'IMMINENT_BREACH' &&
        predictiveMetric.timeToBreachSeconds !== null &&
        Date.now() - this.lastPredictiveAlertTimestamp[zone] > 60000 // Throttled to 1 per min
      ) {
        this.lastPredictiveAlertTimestamp[zone] = Date.now();
        wsService.broadcastIncidentAlert({
          id: `PRED-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `PREDICTIVE WARNING: ${zone}`,
          description: `CH4 accelerating at +${predictiveMetric.ch4VelocityPercentPerMin}%/min. Projected threshold breach in ~${Math.round(predictiveMetric.timeToBreachSeconds / 60)} mins.`,
          severity: 'WARNING',
          zone,
          timestamp: Date.now(),
          acknowledged: false,
          category: 'GAS_LEAK',
          regulatoryClause: 'Predictive Atmospheric Standard (IS/IEC 60079)',
          mitigationStep: 'Engage auxiliary scrubber fans in advance to arrest gas acceleration.',
        });
      }

      // Broadcast telemetry packet
      wsService.broadcastTelemetry(updatedPacket);

      // If interlocking tripped, broadcast updated interlock system state immediately
      if (interlockResult.powerChanged || interlockResult.fanChanged) {
        wsService.broadcastInterlockState(interlockEngine.getSystemState());
      }

      // Periodically (every 5 ticks ~ 6 seconds), broadcast predictive metrics & evacuation routes
      if (this.tickCounter % 5 === 0) {
        const allPredictive = predictiveEngine.getAllZoneMetrics(this.currentPackets);
        wsService.broadcastPredictiveHazard(allPredictive);

        const safeRoutes = evacuationEngine.calculateSafeRoutes(this.currentPackets);
        wsService.broadcastEvacuationRoutes(safeRoutes);
      }

      // Persist to Supabase asynchronously (sample 1 in 5 readings)
      if (Math.random() < 0.25) {
        try {
          await TelemetryModel.create({
            ...updatedPacket,
            timestamp: new Date(updatedPacket.timestamp),
          });
        } catch (err) {
          // Ignore DB transient errors during startup
        }
      }
    }, ENV.TELEMETRY_INTERVAL_MS);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getZonePacket(zone: MineZoneId): TelemetryPacket {
    return this.currentPackets[zone];
  }

  public getAllZonePackets(): Record<MineZoneId, TelemetryPacket> {
    return this.currentPackets;
  }

  public setZonePacket(zone: MineZoneId, packet: TelemetryPacket) {
    this.currentPackets[zone] = packet;
    wsService.broadcastTelemetry(packet);
    predictiveEngine.recordReading(packet);
    interlockEngine.evaluateTelemetry(packet);
  }
}

export const telemetryEngine = new TelemetryEngine();
