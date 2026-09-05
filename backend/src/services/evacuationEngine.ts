import { MineZoneId, TelemetryPacket, EvacuationPath } from '../types/dashboard.js';

interface GraphNode {
  id: string;
  zone: MineZoneId | 'Surface-Exit';
  pos: [number, number, number];
  neighbors: string[];
}

class EvacuationEngine {
  private nodes: Record<string, GraphNode> = {
    'SURFACE_EXIT': {
      id: 'SURFACE_EXIT',
      zone: 'Surface-Exit',
      pos: [0, 5.0, 0],
      neighbors: ['MAIN_LIFT'],
    },
    'MAIN_LIFT': {
      id: 'MAIN_LIFT',
      zone: 'Shaft-01',
      pos: [0, 2.5, 0],
      neighbors: ['SURFACE_EXIT', 'JUNCTION_A', 'CENTRAL_JUNCTION'],
    },
    'JUNCTION_A': {
      id: 'JUNCTION_A',
      zone: 'Tunnel-A04',
      pos: [-1.5, 0.2, 0],
      neighbors: ['MAIN_LIFT', 'TUNNEL_A_END', 'CENTRAL_JUNCTION'],
    },
    'TUNNEL_A_END': {
      id: 'TUNNEL_A_END',
      zone: 'Tunnel-A04',
      pos: [-3.8, 0.2, 0],
      neighbors: ['JUNCTION_A'],
    },
    'CENTRAL_JUNCTION': {
      id: 'CENTRAL_JUNCTION',
      zone: 'Shaft-01',
      pos: [0.5, -2.0, 0.2],
      neighbors: ['MAIN_LIFT', 'JUNCTION_A', 'CONVEYOR_C', 'GAS_ZONE_B', 'DEEP_EXCAVATION'],
    },
    'GAS_ZONE_B': {
      id: 'GAS_ZONE_B',
      zone: 'Gas-Zone-B12',
      pos: [3.8, -3.2, 0],
      neighbors: ['CENTRAL_JUNCTION'],
    },
    'CONVEYOR_C': {
      id: 'CONVEYOR_C',
      zone: 'Conveyor-C02',
      pos: [0, -1.8, 3.2],
      neighbors: ['CENTRAL_JUNCTION'],
    },
    'DEEP_EXCAVATION': {
      id: 'DEEP_EXCAVATION',
      zone: 'Excavation-Face',
      pos: [0, -5.5, 0],
      neighbors: ['CENTRAL_JUNCTION'],
    },
  };

  private zoneOrigins: Record<MineZoneId, string> = {
    'Shaft-01': 'MAIN_LIFT',
    'Tunnel-A04': 'TUNNEL_A_END',
    'Gas-Zone-B12': 'GAS_ZONE_B',
    'Conveyor-C02': 'CONVEYOR_C',
    'Excavation-Face': 'DEEP_EXCAVATION',
  };

  public calculateSafeRoutes(telemetryPackets: Record<MineZoneId, TelemetryPacket>): Record<MineZoneId, EvacuationPath> {
    const routes: Record<MineZoneId, EvacuationPath> = {} as any;
    const zones: MineZoneId[] = ['Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face'];

    for (const zone of zones) {
      const originNodeId = this.zoneOrigins[zone];
      const waypoints: [number, number, number][] = [];

      // Determine hazardous zones
      const isGasZoneHazard = (telemetryPackets['Gas-Zone-B12']?.methane_CH4 || 0) >= 1.25;
      const isDeepFaceHazard = (telemetryPackets['Excavation-Face']?.temperature || 0) >= 36;

      let pathStatus: 'CLEAR' | 'HAZARD_REROUTED' | 'NO_SAFE_ROUTE' = 'CLEAR';
      let warningMessage = undefined;

      if (originNodeId === 'GAS_ZONE_B') {
        waypoints.push(this.nodes['GAS_ZONE_B'].pos);
        waypoints.push(this.nodes['CENTRAL_JUNCTION'].pos);
        waypoints.push(this.nodes['JUNCTION_A'].pos); // Route through A away from shaft contamination
        waypoints.push(this.nodes['MAIN_LIFT'].pos);
        waypoints.push(this.nodes['SURFACE_EXIT'].pos);
        if (isGasZoneHazard) {
          pathStatus = 'HAZARD_REROUTED';
          warningMessage = 'Primary Gas Section compromised. Diverting via Auxiliary Airway #1.';
        }
      } else if (originNodeId === 'TUNNEL_A_END') {
        waypoints.push(this.nodes['TUNNEL_A_END'].pos);
        waypoints.push(this.nodes['JUNCTION_A'].pos);
        waypoints.push(this.nodes['MAIN_LIFT'].pos);
        waypoints.push(this.nodes['SURFACE_EXIT'].pos);
      } else if (originNodeId === 'CONVEYOR_C') {
        waypoints.push(this.nodes['CONVEYOR_C'].pos);
        waypoints.push(this.nodes['CENTRAL_JUNCTION'].pos);
        waypoints.push(this.nodes['MAIN_LIFT'].pos);
        waypoints.push(this.nodes['SURFACE_EXIT'].pos);
      } else if (originNodeId === 'DEEP_EXCAVATION') {
        waypoints.push(this.nodes['DEEP_EXCAVATION'].pos);
        waypoints.push(this.nodes['CENTRAL_JUNCTION'].pos);
        waypoints.push(this.nodes['MAIN_LIFT'].pos);
        waypoints.push(this.nodes['SURFACE_EXIT'].pos);
        if (isDeepFaceHazard) {
          pathStatus = 'HAZARD_REROUTED';
          warningMessage = 'Thermal surge at Longwall Face. Ascending to Central Hoist.';
        }
      } else {
        waypoints.push(this.nodes['MAIN_LIFT'].pos);
        waypoints.push(this.nodes['SURFACE_EXIT'].pos);
      }

      routes[zone] = {
        zone,
        originNodeId,
        exitNodeId: 'SURFACE_EXIT',
        waypoints,
        estimatedEvacuationSeconds: waypoints.length * 45, // approx 45s per segment
        pathStatus,
        warningMessage,
      };
    }

    return routes;
  }
}

export const evacuationEngine = new EvacuationEngine();
