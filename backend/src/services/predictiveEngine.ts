import { MineZoneId, TelemetryPacket, PredictiveHazardMetric } from '../types/dashboard.js';

interface ZoneHistoryItem {
  timestamp: number;
  ch4: number;
  co: number;
  temp: number;
}

class PredictiveEngine {
  private history: Record<MineZoneId, ZoneHistoryItem[]> = {
    'Shaft-01': [],
    'Tunnel-A04': [],
    'Gas-Zone-B12': [],
    'Conveyor-C02': [],
    'Excavation-Face': [],
  };

  private maxHistoryLength = 30; // ~36 seconds of sliding history at 1.2s tick

  public recordReading(packet: TelemetryPacket): PredictiveHazardMetric {
    const { zone, methane_CH4, carbonMonoxide_CO, temperature, timestamp } = packet;

    if (!this.history[zone]) {
      this.history[zone] = [];
    }

    this.history[zone].push({
      timestamp,
      ch4: methane_CH4,
      co: carbonMonoxide_CO,
      temp: temperature,
    });

    if (this.history[zone].length > this.maxHistoryLength) {
      this.history[zone].shift();
    }

    return this.calculateMetrics(zone, methane_CH4);
  }

  public calculateMetrics(zone: MineZoneId, currentCh4: number): PredictiveHazardMetric {
    const list = this.history[zone] || [];

    if (list.length < 3) {
      return {
        zone,
        ch4VelocityPercentPerMin: 0.0,
        coVelocityPpmPerMin: 0.0,
        tempVelocityDegPerMin: 0.0,
        projectedCh4_10m: currentCh4,
        projectedCh4_30m: currentCh4,
        timeToBreachSeconds: null,
        predictiveRiskLevel: 'LOW',
        confidenceScore: 75.0,
        lastCalculated: Date.now(),
      };
    }

    // Linear regression slope: y = mx + c
    const n = list.length;
    const t0 = list[0].timestamp;
    
    let sumT = 0;
    let sumCh4 = 0;
    let sumCo = 0;
    let sumTemp = 0;
    let sumT2 = 0;
    let sumTCh4 = 0;
    let sumTCo = 0;
    let sumTTemp = 0;

    for (const item of list) {
      const tSec = (item.timestamp - t0) / 1000;
      sumT += tSec;
      sumCh4 += item.ch4;
      sumCo += item.co;
      sumTemp += item.temp;
      sumT2 += tSec * tSec;
      sumTCh4 += tSec * item.ch4;
      sumTCo += tSec * item.co;
      sumTTemp += tSec * item.temp;
    }

    const denominator = n * sumT2 - sumT * sumT;
    const slopePerSecCh4 = denominator !== 0 ? (n * sumTCh4 - sumT * sumCh4) / denominator : 0;
    const slopePerSecCo = denominator !== 0 ? (n * sumTCo - sumT * sumCo) / denominator : 0;
    const slopePerSecTemp = denominator !== 0 ? (n * sumTTemp - sumT * sumTemp) / denominator : 0;

    // Convert slope to per minute
    const ch4VelocityPercentPerMin = Number((slopePerSecCh4 * 60).toFixed(3));
    const coVelocityPpmPerMin = Number((slopePerSecCo * 60).toFixed(2));
    const tempVelocityDegPerMin = Number((slopePerSecTemp * 60).toFixed(2));

    const projectedCh4_10m = Math.max(0.1, Number((currentCh4 + ch4VelocityPercentPerMin * 10).toFixed(2)));
    const projectedCh4_30m = Math.max(0.1, Number((currentCh4 + ch4VelocityPercentPerMin * 30).toFixed(2)));

    let timeToBreachSeconds: number | null = null;
    const CRITICAL_CH4_THRESHOLD = 1.25;

    if (currentCh4 >= CRITICAL_CH4_THRESHOLD) {
      timeToBreachSeconds = 0;
    } else if (slopePerSecCh4 > 0.0001) {
      const remainingDelta = CRITICAL_CH4_THRESHOLD - currentCh4;
      const sec = remainingDelta / slopePerSecCh4;
      if (sec > 0 && sec <= 3600) { // Forecast within next 60 minutes
        timeToBreachSeconds = Math.round(sec);
      }
    }

    let predictiveRiskLevel: 'LOW' | 'ELEVATED' | 'IMMINENT_BREACH' = 'LOW';
    if (timeToBreachSeconds !== null && timeToBreachSeconds <= 1800) {
      predictiveRiskLevel = 'IMMINENT_BREACH';
    } else if (ch4VelocityPercentPerMin >= 0.04 || projectedCh4_10m >= 0.75 || tempVelocityDegPerMin >= 0.3) {
      predictiveRiskLevel = 'ELEVATED';
    }

    const confidenceScore = Math.min(99, Math.round(80 + list.length * 0.6));

    return {
      zone,
      ch4VelocityPercentPerMin,
      coVelocityPpmPerMin,
      tempVelocityDegPerMin,
      projectedCh4_10m,
      projectedCh4_30m,
      timeToBreachSeconds,
      predictiveRiskLevel,
      confidenceScore,
      lastCalculated: Date.now(),
    };
  }

  public getAllZoneMetrics(currentPackets: Record<MineZoneId, TelemetryPacket>): Record<MineZoneId, PredictiveHazardMetric> {
    const result: any = {};
    const zones: MineZoneId[] = ['Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face'];
    for (const z of zones) {
      result[z] = this.calculateMetrics(z, currentPackets[z]?.methane_CH4 || 0.4);
    }
    return result;
  }
}

export const predictiveEngine = new PredictiveEngine();
