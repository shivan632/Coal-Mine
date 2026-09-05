/// <reference types="vite/client" />
/**
 * ============================================================================
 * BACKEND TEAM INTEGRATION SPECIFICATION & DATA CONTRACTS
 * ============================================================================
 * 
 * Dear Backend Engineer:
 * This dashboard is architected with a decoupled real-time bridge.
 * You can stream live data to this UI using standard WebSockets, Server-Sent
 * Events (SSE), or REST polling.
 * 
 * 1. WEBSOCKET ENDPOINT:
 *    `ws://your-backend-host/api/v1/mine-safety/stream`
 * 
 * 2. TOPICS / EVENT TYPES:
 * 
 *    a) "TELEMETRY_PACKET" -> Environmental Sensors (CH4, CO, Temp, Hum, Press, O2)
 *       Payload Schema:
 *       {
 *         "nodeId": "SENS-UG-01",
 *         "zone": "Gas-Zone-B12",
 *         "depthMeters": 1250,
 *         "methane_CH4": 1.42,       // percentage (0-100)
 *         "carbonMonoxide_CO": 18.5, // ppm
 *         "temperature": 29.4,       // Celsius
 *         "humidity": 65.2,          // %
 *         "pressure": 1014.1,        // hPa
 *         "oxygen_O2": 20.8,         // %
 *         "airQualityIndex": 42,     // AQI
 *         "timestamp": 1724658000000,// Unix timestamp in ms
 *         "status": "NOMINAL" | "WARNING" | "CRITICAL"
 *       }
 * 
 *    b) "WORKER_PPE_INFERENCE" -> Edge Camera AI Computer Vision Stream
 *       Payload Schema:
 *       {
 *         "workerId": "MINER-8492",
 *         "name": "Alexander Vance",
 *         "role": "Excavation Specialist",
 *         "zone": "Tunnel-A04",
 *         "confidence": 98.4,
 *         "ppeCompliance": {
 *           "helmet": true,
 *           "safetyJacket": true,
 *           "respiratorMask": false,
 *           "steelBoots": true,
 *           "gloves": true
 *         },
 *         "verdict": "SOMETHING IS MISSING!",
 *         "missingItems": ["Respirator Mask"],
 *         "lastScanned": 1724658000000
 *       }
 * 
 *    c) "INCIDENT_ALERT" -> Real-time Emergency / Safety Dispatch
 *       Payload Schema:
 *       {
 *         "id": "ALT-9042",
 *         "title": "Methane Exceedance Detected",
 *         "description": "CH4 levels exceeded 2.2% threshold at Gas-Zone-B12.",
 *         "severity": "CRITICAL",
 *         "zone": "Gas-Zone-B12",
 *         "timestamp": 1724658000000,
 *         "acknowledged": false,
 *         "category": "GAS_LEAK",
 *         "mitigationStep": "Engage Auxiliary Scrubber Fan & Halt Tunnel Line"
 *       }
 * 
 * 3. REST REPLAY & HISTORICAL ARCHIVE:
 *    GET `/api/v1/telemetry/historical?timeframe=24h&zone=all`
 *    Returns: Array<HistoricalTelemetryPoint>
 * 
 * ============================================================================
 */

import {
  TelemetryPacket,
  WorkerInferenceResult,
  IncidentAlert,
  HistoricalTelemetryPoint,
  BackendStreamEnvelope,
} from '../types/dashboard';

export type { BackendStreamEnvelope };

export const API_CONFIG = {
  // Set to your backend WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/mine-safety/stream',
  REST_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  RECONNECT_INTERVAL_MS: 3000,
  MAX_RETRIES: 5,
};
