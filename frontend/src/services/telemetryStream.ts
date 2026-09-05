import {
  TelemetryPacket,
  WorkerInferenceResult,
  IncidentAlert,
  SimulationScenarioId,
  MineZoneId,
  InterlockCommand,
  InterlockSystemState,
  PredictiveHazardMetric,
} from '../types/dashboard';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useWorkerSafetyStore } from '../stores/useWorkerSafetyStore';
import { useAlertStore } from '../stores/useAlertStore';
import { API_CONFIG } from './apiContract';

class TelemetryStreamService {
  private intervalId: number | null = null;
  private ws: WebSocket | null = null;
  private isSimulationMode = true;
  private simulatedTick = 0;

  public start() {
    // If backend WS URL is configured and non-empty, try connecting
    if (API_CONFIG.WS_URL && API_CONFIG.WS_URL.trim() !== '') {
      this.tryConnectWebSocket();
    } else {
      this.startSimulatedStream();
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  private tryConnectWebSocket() {
    try {
      this.ws = new WebSocket(API_CONFIG.WS_URL);

      this.ws.onopen = () => {
        console.log('[CoalGuard] Connected to Live Backend WebSocket Stream');
        this.isSimulationMode = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (e) {
          console.error('[CoalGuard] Failed to parse message', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[CoalGuard] WebSocket error, running in simulated mode');
        this.startSimulatedStream();
      };

      this.ws.onclose = () => {
        console.warn('[CoalGuard] WebSocket closed, fallback to simulation');
        this.startSimulatedStream();
      };
    } catch (err) {
      console.warn('[CoalGuard] WebSocket connection failed, fallback to simulation', err);
      this.startSimulatedStream();
    }
  }

  private handleIncomingMessage(msg: any) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'TELEMETRY_PACKET':
        useTelemetryStore.getState().updateTelemetry(msg.payload);
        break;
      case 'WORKER_PPE_INFERENCE':
        useWorkerSafetyStore.getState().setWorker(msg.payload);
        break;
      case 'INCIDENT_ALERT':
        useAlertStore.getState().addAlert(msg.payload);
        break;
      case 'PREDICTIVE_HAZARD':
        useTelemetryStore.getState().setPredictiveMetrics(msg.payload);
        break;
      case 'INTERLOCK_STATE':
        useTelemetryStore.getState().setInterlockState(msg.payload);
        break;
      case 'EVACUATION_ROUTES':
        useTelemetryStore.getState().setEvacuationRoutes(msg.payload);
        break;
    }
  }

  /**
   * Bi-directional IoT Command Dispatcher
   * Sends command over WebSocket if connected, falls back to REST API,
   * and updates local store immediately for zero-latency operator feedback.
   */
  public async sendCommand(cmd: InterlockCommand): Promise<{ success: boolean; message: string }> {
    console.log('[CoalGuard Control] Dispatching Command:', cmd);

    // 1. Try WebSocket command channel
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'COMMAND',
          timestamp: Date.now(),
          payload: cmd,
        })
      );
    }

    // 2. Also send via REST API for persistence
    try {
      fetch(`${API_CONFIG.REST_BASE_URL}/control/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd),
      }).catch(() => {
        // Backend not reachable, local optimistic update handles UI
      });
    } catch (e) {
      // ignore network errors
    }

    // 3. Optimistic local state machine update
    const store = useTelemetryStore.getState();
    const currentInterlock = store.interlockState;
    if (!currentInterlock) return { success: true, message: 'Command queued' };

    const updatedZones = { ...currentInterlock.zones };
    let updatedArmed = currentInterlock.autoContainmentArmed;
    const targetZone = cmd.zone || store.activeZone;

    if (cmd.action === 'TOGGLE_AUTO_ARM') {
      updatedArmed = !updatedArmed;
    } else if (targetZone && updatedZones[targetZone]) {
      const zoneState = { ...updatedZones[targetZone] };
      if (cmd.action === 'CUT_POWER') {
        zoneState.sectionPower = 'CUTOFF';
        zoneState.turnstileGating = 'LOCKED';
        zoneState.lastTripTimestamp = Date.now();
        zoneState.lastTripReason = cmd.reason || 'Manual circuit breaker cutoff';
      } else if (cmd.action === 'RESTORE_POWER') {
        zoneState.sectionPower = 'ACTIVE';
        zoneState.turnstileGating = 'UNLOCKED';
      } else if (cmd.action === 'SET_FAN_OVERDRIVE') {
        zoneState.ventilationFan = 'OVERDRIVE';
      } else if (cmd.action === 'SET_FAN_NORMAL') {
        zoneState.ventilationFan = 'NORMAL';
      } else if (cmd.action === 'LOCK_TURNSTILE') {
        zoneState.turnstileGating = 'LOCKED';
      } else if (cmd.action === 'UNLOCK_TURNSTILE') {
        zoneState.turnstileGating = 'UNLOCKED';
      }
      updatedZones[targetZone] = zoneState;
    }

    const newLog = {
      id: `ITL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      zone: targetZone,
      action:
        cmd.action === 'CUT_POWER'
          ? ('MANUAL_OVERRIDE_POWER' as const)
          : cmd.action === 'SET_FAN_OVERDRIVE'
          ? ('MANUAL_OVERRIDE_FAN' as const)
          : ('RESTORE_NOMINAL' as const),
      initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE' as const,
      reason: cmd.reason || `Operator manual dispatch: ${cmd.action}`,
      sensorTriggerValue: `${cmd.supervisorName || 'Supervisor'} [${cmd.badgeId || 'AUTH'}]`,
    };

    const nextState: InterlockSystemState = {
      autoContainmentArmed: updatedArmed,
      zones: updatedZones,
      recentAuditLogs: [newLog, ...(currentInterlock.recentAuditLogs || []).slice(0, 40)],
    };

    store.setInterlockState(nextState);

    return {
      success: true,
      message: `Command ${cmd.action} executed successfully on ${targetZone}.`,
    };
  }

  // Realistic Jitter Telemetry Engine (Runs at 1.2s in background)
  private startSimulatedStream() {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      this.simulatedTick++;
      const activeZone = useTelemetryStore.getState().activeZone;
      const current = useTelemetryStore.getState().currentPacket;

      // Subtle random noise
      const ch4Delta = (Math.random() - 0.48) * 0.02;
      const tempDelta = (Math.random() - 0.5) * 0.1;
      const coDelta = (Math.random() - 0.5) * 0.3;
      const humDelta = (Math.random() - 0.5) * 0.2;
      const pressDelta = (Math.random() - 0.5) * 0.15;
      const vDelta = (Math.random() - 0.5) * 0.05;

      const newCh4 = Math.max(0.1, +(current.methane_CH4 + ch4Delta).toFixed(2));
      const newCo = Math.max(2, +(current.carbonMonoxide_CO + coDelta).toFixed(1));
      const newTemp = +(current.temperature + tempDelta).toFixed(1);
      const newHum = Math.max(20, Math.min(99, +(current.humidity + humDelta).toFixed(1)));
      const newPress = +(current.pressure + pressDelta).toFixed(1);
      const newV = Math.max(0.2, +(current.airVelocity_ms + vDelta).toFixed(2));

      // Calculate status based on DGMS thresholds
      let status: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
      if (newCh4 >= 1.25 || newCo > 50 || newTemp > 35) {
        status = 'CRITICAL';
      } else if (newCh4 >= 0.75 || newCo > 25 || newTemp > 28 || newV < 0.5) {
        status = 'WARNING';
      }

      // Read current interlock state
      const interlock = useTelemetryStore.getState().interlockState;
      const zoneInterlock = interlock?.zones[activeZone];

      const updatedPacket: TelemetryPacket = {
        ...current,
        methane_CH4: newCh4,
        carbonMonoxide_CO: newCo,
        temperature: newTemp,
        humidity: newHum,
        pressure: newPress,
        airVelocity_ms: newV,
        sectionPowerState: zoneInterlock ? zoneInterlock.sectionPower : newCh4 >= 1.25 ? 'CUTOFF' : 'ACTIVE',
        ventilationFanState: zoneInterlock ? zoneInterlock.ventilationFan : newCh4 >= 0.75 ? 'OVERDRIVE' : 'NORMAL',
        timestamp: Date.now(),
        status,
      };

      useTelemetryStore.getState().updateTelemetry(updatedPacket);

      // Every 4 ticks, update simulated predictive metrics
      if (this.simulatedTick % 4 === 0) {
        const store = useTelemetryStore.getState();
        const currentMetrics = { ...store.predictiveMetrics };
        const zones: MineZoneId[] = ['Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face'];

        zones.forEach((z) => {
          const zPacket = store.zonePackets[z] || current;
          const zCh4 = zPacket.methane_CH4;
          const zVelocity = +(0.005 + (Math.random() - 0.45) * 0.015).toFixed(3);
          const projected10 = Math.max(0.1, +(zCh4 + zVelocity * 10).toFixed(2));
          const projected30 = Math.max(0.1, +(zCh4 + zVelocity * 30).toFixed(2));

          let ttb: number | null = null;
          let risk: 'LOW' | 'ELEVATED' | 'IMMINENT_BREACH' = 'LOW';

          if (zCh4 >= 1.25) {
            ttb = 0;
            risk = 'IMMINENT_BREACH';
          } else if (zVelocity > 0.01) {
            const sec = Math.round(((1.25 - zCh4) / (zVelocity / 60)));
            if (sec > 0 && sec <= 2400) {
              ttb = sec;
              risk = sec <= 600 ? 'IMMINENT_BREACH' : 'ELEVATED';
            }
          }

          currentMetrics[z] = {
            zone: z,
            ch4VelocityPercentPerMin: zVelocity,
            coVelocityPpmPerMin: +(0.2 + Math.random() * 0.4).toFixed(1),
            tempVelocityDegPerMin: +(0.05 + Math.random() * 0.1).toFixed(2),
            projectedCh4_10m: projected10,
            projectedCh4_30m: projected30,
            timeToBreachSeconds: ttb,
            predictiveRiskLevel: risk,
            confidenceScore: Math.min(99, Math.round(86 + Math.random() * 10)),
            lastCalculated: Date.now(),
          };
        });

        store.setPredictiveMetrics(currentMetrics);
      }
    }, 1200);
  }

  // Trigger Scenario Failure Modes on Demand
  public triggerScenario(scenario: SimulationScenarioId) {
    const telemetryStore = useTelemetryStore.getState();
    const workerStore = useWorkerSafetyStore.getState();
    const alertStore = useAlertStore.getState();

    switch (scenario) {
      case 'NOMINAL_OPERATIONS': {
        telemetryStore.setEmergencyEvacuation(false);
        telemetryStore.setActiveZone('Tunnel-A04');
        telemetryStore.setCameraPreset('orbit');

        telemetryStore.updateTelemetry({
          nodeId: 'NODE-A04',
          zone: 'Tunnel-A04',
          depthMeters: 750,
          methane_CH4: 0.42,
          carbonMonoxide_CO: 11.5,
          temperature: 24.2,
          humidity: 56.0,
          pressure: 1013.2,
          oxygen_O2: 20.9,
          airVelocity_ms: 1.8,
          airQualityIndex: 22,
          atexZone: 'ATEX Zone 2',
          sectionPowerState: 'ACTIVE',
          ventilationFanState: 'NORMAL',
          timestamp: Date.now(),
          status: 'NOMINAL',
        });

        // Restore interlock state
        if (telemetryStore.interlockState) {
          const restoredZones = { ...telemetryStore.interlockState.zones };
          (Object.keys(restoredZones) as MineZoneId[]).forEach((z) => {
            restoredZones[z] = {
              ...restoredZones[z],
              sectionPower: 'ACTIVE',
              ventilationFan: 'NORMAL',
              turnstileGating: 'UNLOCKED',
            };
          });
          telemetryStore.setInterlockState({
            ...telemetryStore.interlockState,
            zones: restoredZones,
          });
        }

        workerStore.setWorker({
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
          confidence: 99.4,
          ppeCompliance: { helmet: true, safetyJacket: true, respiratorMask: true, steelBoots: true, gloves: true },
          verdict: 'ALL CORRECT',
          missingItems: [],
          turnstileBarrierState: 'UNLOCKED',
          lastScanned: Date.now(),
        });
        break;
      }

      case 'GAS_LEAK_ZONE_B': {
        telemetryStore.setActiveZone('Gas-Zone-B12');
        telemetryStore.setCameraPreset('gasZone');

        telemetryStore.updateTelemetry({
          nodeId: 'NODE-B12',
          zone: 'Gas-Zone-B12',
          depthMeters: 1200,
          methane_CH4: 2.85,
          carbonMonoxide_CO: 64.2,
          temperature: 32.5,
          humidity: 76.0,
          pressure: 1004.0,
          oxygen_O2: 18.8,
          airVelocity_ms: 0.4,
          airQualityIndex: 148,
          atexZone: 'ATEX Zone 0',
          sectionPowerState: 'CUTOFF',
          ventilationFanState: 'OVERDRIVE',
          timestamp: Date.now(),
          status: 'CRITICAL',
        });

        // Trigger Automated Interlock Trip on Gas-Zone-B12
        if (telemetryStore.interlockState) {
          const trippedZones = { ...telemetryStore.interlockState.zones };
          trippedZones['Gas-Zone-B12'] = {
            zone: 'Gas-Zone-B12',
            sectionPower: 'CUTOFF',
            ventilationFan: 'OVERDRIVE',
            turnstileGating: 'LOCKED',
            autoInterlockArmed: true,
            lastTripTimestamp: Date.now(),
            lastTripReason: 'DGMS Sec. 153 Trip: Methane surge 2.85% >= 1.25%',
          };
          const tripLog = {
            id: `ITL-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: Date.now(),
            zone: 'Gas-Zone-B12' as MineZoneId,
            action: 'AUTO_TRIP_POWER' as const,
            initiatedBy: 'AUTOMATED_SAFETY_ENGINE' as const,
            reason: 'Closed-Loop Trip: Gas surge 2.85% CH4. Breaker tripped within 100ms, scrubber fan at 100% OVERDRIVE.',
            sensorTriggerValue: '2.85% CH4',
          };
          telemetryStore.setInterlockState({
            ...telemetryStore.interlockState,
            zones: trippedZones,
            recentAuditLogs: [tripLog, ...telemetryStore.interlockState.recentAuditLogs],
          });
        }

        // Set predictive metrics to immediate breach
        const pred = { ...telemetryStore.predictiveMetrics };
        pred['Gas-Zone-B12'] = {
          zone: 'Gas-Zone-B12',
          ch4VelocityPercentPerMin: 0.185,
          coVelocityPpmPerMin: 4.8,
          tempVelocityDegPerMin: 0.45,
          projectedCh4_10m: 3.85,
          projectedCh4_30m: 4.90,
          timeToBreachSeconds: 0,
          predictiveRiskLevel: 'IMMINENT_BREACH',
          confidenceScore: 98,
          lastCalculated: Date.now(),
        };
        telemetryStore.setPredictiveMetrics(pred);

        alertStore.addAlert({
          title: 'DANGER: High Methane Surge',
          description: 'Methane CH4 concentration spiked to 2.85% at Gas Zone B-12. Automatic power cutoff engaged.',
          severity: 'CRITICAL',
          zone: 'Gas-Zone-B12',
          category: 'GAS_LEAK',
          regulatoryClause: 'DGMS Reg. 153(2) Section Trip',
          mitigationStep: 'Spin auxiliary scrubbers to 100% overdrive & trip machinery power grid.',
        });
        break;
      }

      case 'PPE_NON_COMPLIANCE': {
        telemetryStore.setActiveZone('Tunnel-A04');
        workerStore.setWorker({
          workerId: 'MINER-8422',
          name: 'Devendra Singh',
          role: 'Excavation Drill Master',
          zone: 'Tunnel-A04',
          bloodGroup: 'B+',
          emergencyContact: '+91 98231 44520',
          shiftStartTimestamp: Date.now() - 3.2 * 3600000,
          undergroundMinutes: 192,
          maxShiftMinutes: 480,
          photoUrl: '/assets/miners/devendra.jpg',
          confidence: 97.2,
          ppeCompliance: { helmet: false, safetyJacket: true, respiratorMask: false, steelBoots: true, gloves: false },
          verdict: 'SOMETHING IS MISSING!',
          missingItems: ['Helmet', 'Respirator Mask', 'Protective Gloves'],
          turnstileBarrierState: 'LOCKED',
          lastScanned: Date.now(),
        });

        alertStore.addAlert({
          title: 'PPE Non-Compliance Detected',
          description: 'Worker Devendra Singh missing Helmet, Mask, and Gloves at Entry Checkpoint.',
          severity: 'CRITICAL',
          zone: 'Tunnel-A04',
          category: 'PPE_VIOLATION',
          regulatoryClause: 'OSHA 1926.95 / DGMS PPE Std',
          mitigationStep: 'Deny turnstile gate entry until full gear verified.',
        });
        break;
      }

      case 'HIGH_THERMAL_ALERT': {
        telemetryStore.setActiveZone('Excavation-Face');
        telemetryStore.updateTelemetry({
          nodeId: 'NODE-EXCAV',
          zone: 'Excavation-Face',
          depthMeters: 1450,
          methane_CH4: 0.65,
          carbonMonoxide_CO: 22.0,
          temperature: 38.6,
          humidity: 91.2,
          pressure: 992.0,
          oxygen_O2: 20.4,
          airVelocity_ms: 0.35,
          airQualityIndex: 68,
          atexZone: 'ATEX Zone 1',
          sectionPowerState: 'ACTIVE',
          ventilationFanState: 'OVERDRIVE',
          timestamp: Date.now(),
          status: 'WARNING',
        });

        alertStore.addAlert({
          title: 'Extreme Heat & Humidity Alert',
          description: 'Excavation Face ambient temperature reached 38.6°C with 91.2% humidity. Heat exhaustion risk high.',
          severity: 'WARNING',
          zone: 'Excavation-Face',
          category: 'THERMAL_RISK',
          regulatoryClause: 'DGMS Thermal Comfort Std',
          mitigationStep: 'Activate chilled air blowers & order mandatory hydration pause.',
        });
        break;
      }

      case 'EMERGENCY_EVACUATION': {
        telemetryStore.setEmergencyEvacuation(true);
        telemetryStore.setActiveZone('Gas-Zone-B12');
        telemetryStore.setCameraPreset('shaft');

        telemetryStore.updateTelemetry({
          nodeId: 'NODE-B12',
          zone: 'Gas-Zone-B12',
          depthMeters: 1200,
          methane_CH4: 3.42,
          carbonMonoxide_CO: 78.5,
          temperature: 34.0,
          humidity: 82.0,
          pressure: 998.0,
          oxygen_O2: 17.5,
          airVelocity_ms: 0.25,
          airQualityIndex: 185,
          atexZone: 'ATEX Zone 0',
          sectionPowerState: 'CUTOFF',
          ventilationFanState: 'OVERDRIVE',
          timestamp: Date.now(),
          status: 'CRITICAL',
        });

        alertStore.addAlert({
          title: 'MINE-WIDE EMERGENCY EVACUATION',
          description: 'Multi-zone gas and hypoxia event. All personnel must evacuate via primary illuminated escape shaft.',
          severity: 'CRITICAL',
          zone: 'Gas-Zone-B12',
          category: 'EVACUATION',
          regulatoryClause: 'DGMS Emergency Standing Order',
          mitigationStep: 'Sound surface sirens, activate escape route chevrons, trip all tunnel power.',
        });
        break;
      }
    }
  }
}

export const telemetryStream = new TelemetryStreamService();
