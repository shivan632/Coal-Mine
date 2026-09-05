import { getSupabaseClient } from '../config/supabase.js';

export interface IScanLog {
  id?: string;
  workerId: string;
  name: string;
  zone: string;
  confidence: number;
  helmet: boolean;
  safetyJacket: boolean;
  respiratorMask: boolean;
  steelBoots: boolean;
  gloves: boolean;
  verdict: 'ALL CORRECT' | 'SOMETHING IS MISSING!';
  missingItems: string[];
  turnstileState: 'LOCKED' | 'UNLOCKED';
  timestamp: Date | string | number;
  createdAt?: Date | string;
}

const fallbackScanLogs: IScanLog[] = [];
const MAX_SCAN_LOGS = 100;

const mapRowToScanLog = (row: any): IScanLog => {
  return {
    id: row.id,
    workerId: row.worker_id,
    name: row.name,
    zone: row.zone,
    confidence: Number(row.confidence),
    helmet: row.helmet,
    safetyJacket: row.safety_jacket,
    respiratorMask: row.respirator_mask,
    steelBoots: row.steel_boots,
    gloves: row.gloves,
    verdict: row.verdict,
    missingItems: typeof row.missing_items === 'string' ? JSON.parse(row.missing_items) : (row.missing_items || []),
    turnstileState: row.turnstile_state,
    timestamp: row.timestamp,
    createdAt: row.created_at,
  };
};

const mapScanLogToRow = (log: Partial<IScanLog>): any => {
  return {
    worker_id: log.workerId,
    name: log.name,
    zone: log.zone,
    confidence: log.confidence,
    helmet: log.helmet,
    safety_jacket: log.safetyJacket,
    respirator_mask: log.respiratorMask,
    steel_boots: log.steelBoots,
    gloves: log.gloves,
    verdict: log.verdict,
    missing_items: log.missingItems || [],
    turnstile_state: log.turnstileState,
    timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
  };
};

export const ScanLogModel = {
  async create(scanLogData: Partial<IScanLog>): Promise<IScanLog> {
    const fullLog: IScanLog = {
      workerId: scanLogData.workerId || 'MINER-0000',
      name: scanLogData.name || 'Miner',
      zone: scanLogData.zone || 'Shaft-01',
      confidence: scanLogData.confidence ?? 98.0,
      helmet: scanLogData.helmet ?? true,
      safetyJacket: scanLogData.safetyJacket ?? true,
      respiratorMask: scanLogData.respiratorMask ?? true,
      steelBoots: scanLogData.steelBoots ?? true,
      gloves: scanLogData.gloves ?? true,
      verdict: scanLogData.verdict || 'ALL CORRECT',
      missingItems: scanLogData.missingItems || [],
      turnstileState: scanLogData.turnstileState || 'UNLOCKED',
      timestamp: scanLogData.timestamp || new Date(),
    };

    fallbackScanLogs.push(fullLog);
    if (fallbackScanLogs.length > MAX_SCAN_LOGS) {
      fallbackScanLogs.shift();
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapScanLogToRow(fullLog);
        const { data, error } = await client
          .from('scan_logs')
          .insert(row)
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToScanLog(data);
        }
      } catch (err) {
        // memory buffer has the log
      }
    }

    return fullLog;
  },

  async find(filter?: { workerId?: string }): Promise<IScanLog[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client
          .from('scan_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (filter?.workerId) {
          query = query.eq('worker_id', filter.workerId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapRowToScanLog);
        }
      } catch (err) {
        // fallback
      }
    }

    let list = [...fallbackScanLogs];
    if (filter?.workerId) {
      list = list.filter((l) => l.workerId === filter.workerId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
};
