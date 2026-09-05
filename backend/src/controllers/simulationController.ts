import { Request, Response } from 'express';
import { SimulationScenarioId } from '../types/dashboard.js';
import { telemetryEngine } from '../services/telemetryEngine.js';
import { AIVisionService } from '../services/aiVisionService.js';
import { wsService } from '../services/websocketService.js';

export const triggerScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.body as { scenarioId: SimulationScenarioId };

    switch (scenarioId) {
      case 'NOMINAL_OPERATIONS': {
        telemetryEngine.setZonePacket('Tunnel-A04', {
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
        await AIVisionService.processWorkerScan('MINER-4091', {
          helmet: true,
          safetyJacket: true,
          respiratorMask: true,
          steelBoots: true,
          gloves: true,
        });
        break;
      }

      case 'GAS_LEAK_ZONE_B': {
        telemetryEngine.setZonePacket('Gas-Zone-B12', {
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

        wsService.broadcastIncidentAlert({
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          title: 'DANGER: High Methane Surge',
          description: 'Methane CH4 concentration spiked to 2.85% at Gas Zone B-12.',
          severity: 'CRITICAL',
          zone: 'Gas-Zone-B12',
          timestamp: Date.now(),
          acknowledged: false,
          category: 'GAS_LEAK',
          regulatoryClause: 'DGMS Reg. 153(2) Section Trip',
          mitigationStep: 'Spin auxiliary scrubbers to 100% overdrive & trip machinery power grid.',
        });
        break;
      }

      case 'PPE_NON_COMPLIANCE': {
        await AIVisionService.processWorkerScan('MINER-8422', {
          helmet: false,
          safetyJacket: true,
          respiratorMask: false,
          steelBoots: true,
          gloves: false,
        });

        wsService.broadcastIncidentAlert({
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          title: 'PPE Non-Compliance Detected',
          description: 'Miner Devendra Singh missing Helmet, Mask, and Gloves at Entry Checkpoint.',
          severity: 'CRITICAL',
          zone: 'Tunnel-A04',
          timestamp: Date.now(),
          acknowledged: false,
          category: 'PPE_VIOLATION',
          regulatoryClause: 'OSHA 1926.95 / DGMS PPE Std',
          mitigationStep: 'Deny turnstile gate entry until full gear verified.',
        });
        break;
      }

      case 'HIGH_THERMAL_ALERT': {
        telemetryEngine.setZonePacket('Excavation-Face', {
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
        break;
      }

      case 'EMERGENCY_EVACUATION': {
        telemetryEngine.setZonePacket('Gas-Zone-B12', {
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

        wsService.broadcastIncidentAlert({
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          title: 'MINE-WIDE EMERGENCY EVACUATION',
          description: 'Multi-zone gas and hypoxia event. All personnel must evacuate.',
          severity: 'CRITICAL',
          zone: 'Gas-Zone-B12',
          timestamp: Date.now(),
          acknowledged: false,
          category: 'EVACUATION',
          regulatoryClause: 'DGMS Emergency Standing Order',
          mitigationStep: 'Sound surface sirens, activate escape route chevrons.',
        });
        break;
      }
    }

    res.json({ success: true, message: `Scenario ${scenarioId} activated.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
