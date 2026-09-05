import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import {
  BackendStreamEnvelope,
  TelemetryPacket,
  WorkerInferenceResult,
  IncidentAlert,
  PredictiveHazardMetric,
  InterlockSystemState,
  EvacuationPath,
  MineZoneId,
  InterlockCommand,
} from '../types/dashboard.js';
import { interlockEngine } from './interlockEngine.js';

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: HTTPServer, path: string = '/api/v1/mine-safety/stream') {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log(`[CoalGuard WS] Client Connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send initial heartbeat handshake and current interlock state
      const heartbeat: BackendStreamEnvelope = {
        type: 'HEARTBEAT',
        timestamp: Date.now(),
        payload: { status: 'OK', latencyMs: 12 },
      };
      ws.send(JSON.stringify(heartbeat));

      // Send current interlocking state immediately upon connection
      const interlockEnvelope: BackendStreamEnvelope = {
        type: 'INTERLOCK_STATE',
        timestamp: Date.now(),
        payload: interlockEngine.getSystemState(),
      };
      ws.send(JSON.stringify(interlockEnvelope));

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          console.log('[CoalGuard WS] Received message from client:', parsed.type);

          if (parsed.type === 'COMMAND' && parsed.payload) {
            const cmd = parsed.payload as InterlockCommand;
            const res = interlockEngine.executeCommand(cmd);

            // Broadcast the resulting state to all clients
            this.broadcastInterlockState(res.state);
          }
        } catch (e) {
          // ignore non-json messages
        }
      });

      ws.on('close', () => {
        console.log('[CoalGuard WS] Client Disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('[CoalGuard WS Client Error]', err);
        this.clients.delete(ws);
      });
    });

    console.log(`[CoalGuard WS] WebSocket Server mounted at ${path}`);
  }

  public broadcast(envelope: BackendStreamEnvelope) {
    const payloadStr = JSON.stringify(envelope);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payloadStr);
      }
    }
  }

  public broadcastTelemetry(packet: TelemetryPacket) {
    this.broadcast({
      type: 'TELEMETRY_PACKET',
      timestamp: packet.timestamp,
      payload: packet,
    });
  }

  public broadcastWorkerInference(worker: WorkerInferenceResult) {
    this.broadcast({
      type: 'WORKER_PPE_INFERENCE',
      timestamp: worker.lastScanned,
      payload: worker,
    });
  }

  public broadcastIncidentAlert(alert: IncidentAlert) {
    this.broadcast({
      type: 'INCIDENT_ALERT',
      timestamp: alert.timestamp,
      payload: alert,
    });
  }

  public broadcastPredictiveHazard(metrics: Record<MineZoneId, PredictiveHazardMetric>) {
    this.broadcast({
      type: 'PREDICTIVE_HAZARD',
      timestamp: Date.now(),
      payload: metrics,
    });
  }

  public broadcastInterlockState(state: InterlockSystemState) {
    this.broadcast({
      type: 'INTERLOCK_STATE',
      timestamp: Date.now(),
      payload: state,
    });
  }

  public broadcastEvacuationRoutes(routes: Record<MineZoneId, EvacuationPath>) {
    this.broadcast({
      type: 'EVACUATION_ROUTES',
      timestamp: Date.now(),
      payload: routes,
    });
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();
