import { MineZoneId, SafetyStatus, SupervisorSignature, TelemetryPacket, WorkerInferenceResult } from '../types/dashboard.js';
import { getSupabaseClient } from '../config/supabase.js';

export interface IIncident {
  id?: string;
  incidentId: string;
  title: string;
  description: string;
  severity: SafetyStatus;
  zone: MineZoneId;
  timestamp: Date | string | number;
  acknowledged: boolean;
  regulatoryClause: string;
  category: 'PPE_VIOLATION' | 'GAS_LEAK' | 'THERMAL_RISK' | 'PRESSURE_DROP' | 'EVACUATION';
  mitigationStep: string;
  supervisorSignature?: SupervisorSignature;
  telemetrySnapshot?: Partial<TelemetryPacket>;
  workerSnapshot?: Partial<WorkerInferenceResult>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// In-memory fallback cache
const fallbackIncidents: Map<string, IIncident> = new Map();

const mapRowToIncident = (row: any): IIncident => {
  return {
    id: row.id,
    incidentId: row.incident_id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    zone: row.zone,
    timestamp: row.timestamp,
    acknowledged: row.acknowledged,
    regulatoryClause: row.regulatory_clause,
    category: row.category,
    mitigationStep: row.mitigation_step,
    supervisorSignature: typeof row.supervisor_signature === 'string'
      ? JSON.parse(row.supervisor_signature)
      : row.supervisor_signature,
    telemetrySnapshot: typeof row.telemetry_snapshot === 'string'
      ? JSON.parse(row.telemetry_snapshot)
      : row.telemetry_snapshot,
    workerSnapshot: typeof row.worker_snapshot === 'string'
      ? JSON.parse(row.worker_snapshot)
      : row.worker_snapshot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapIncidentToRow = (incident: Partial<IIncident>): any => {
  const row: any = {};
  if (incident.incidentId !== undefined) row.incident_id = incident.incidentId;
  if (incident.title !== undefined) row.title = incident.title;
  if (incident.description !== undefined) row.description = incident.description;
  if (incident.severity !== undefined) row.severity = incident.severity;
  if (incident.zone !== undefined) row.zone = incident.zone;
  if (incident.timestamp !== undefined) {
    row.timestamp = new Date(incident.timestamp).toISOString();
  }
  if (incident.acknowledged !== undefined) row.acknowledged = incident.acknowledged;
  if (incident.regulatoryClause !== undefined) row.regulatory_clause = incident.regulatoryClause;
  if (incident.category !== undefined) row.category = incident.category;
  if (incident.mitigationStep !== undefined) row.mitigation_step = incident.mitigationStep;
  if (incident.supervisorSignature !== undefined) row.supervisor_signature = incident.supervisorSignature;
  if (incident.telemetrySnapshot !== undefined) row.telemetry_snapshot = incident.telemetrySnapshot;
  if (incident.workerSnapshot !== undefined) row.worker_snapshot = incident.workerSnapshot;
  return row;
};

export const IncidentModel = {
  find(filter?: { acknowledged?: boolean }) {
    let limitCount = 50;

    const execute = async (): Promise<IIncident[]> => {
      const client = getSupabaseClient();
      if (client) {
        try {
          let query = client
            .from('incidents')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limitCount);

          if (filter?.acknowledged !== undefined) {
            query = query.eq('acknowledged', filter.acknowledged);
          }

          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            return data.map(mapRowToIncident);
          }
        } catch (err) {
          // fallback
        }
      }

      let list = Array.from(fallbackIncidents.values());
      if (filter?.acknowledged !== undefined) {
        list = list.filter((i) => i.acknowledged === filter.acknowledged);
      }
      return list
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limitCount);
    };

    return {
      sort(_criteria: any) {
        return this;
      },
      limit(n: number) {
        limitCount = n;
        return this;
      },
      lean() {
        return execute();
      },
      then(resolve: any, reject: any) {
        return execute().then(resolve, reject);
      },
    };
  },

  async findOne(filter: { incidentId: string }): Promise<IIncident | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('incidents')
          .select('*')
          .eq('incident_id', filter.incidentId)
          .maybeSingle();

        if (!error && data) {
          return mapRowToIncident(data);
        }
      } catch (err) {
        // fallback
      }
    }

    return fallbackIncidents.get(filter.incidentId) || null;
  },

  async findOneAndUpdate(
    filter: { incidentId: string },
    update: Partial<IIncident> | any,
    options?: { new?: boolean }
  ): Promise<IIncident | null> {
    const existing = await this.findOne(filter);
    if (!existing) return null;

    const updatedData: IIncident = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };

    fallbackIncidents.set(filter.incidentId, updatedData);

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapIncidentToRow(update);
        row.updated_at = new Date().toISOString();

        const { data, error } = await client
          .from('incidents')
          .update(row)
          .eq('incident_id', filter.incidentId)
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToIncident(data);
        }
      } catch (err) {
        // in-memory update stored
      }
    }

    return updatedData;
  },

  async create(incidentData: Partial<IIncident>): Promise<IIncident> {
    const fullIncident: IIncident = {
      incidentId: incidentData.incidentId || `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: incidentData.title || 'Safety Alert',
      description: incidentData.description || 'Elevated sensor reading or protocol anomaly detected.',
      severity: incidentData.severity || 'WARNING',
      zone: incidentData.zone || 'Shaft-01',
      timestamp: incidentData.timestamp || new Date(),
      acknowledged: incidentData.acknowledged ?? false,
      regulatoryClause: incidentData.regulatoryClause || 'DGMS Standard Directive',
      category: incidentData.category || 'GAS_LEAK',
      mitigationStep: incidentData.mitigationStep || 'Follow SOP protocol.',
      supervisorSignature: incidentData.supervisorSignature,
      telemetrySnapshot: incidentData.telemetrySnapshot,
      workerSnapshot: incidentData.workerSnapshot,
    };

    fallbackIncidents.set(fullIncident.incidentId, fullIncident);

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapIncidentToRow(fullIncident);
        const { data, error } = await client
          .from('incidents')
          .upsert(row, { onConflict: 'incident_id' })
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToIncident(data);
        }
      } catch (err) {
        // in-memory fallback stored
      }
    }

    return fullIncident;
  },

  async insertMany(incidents: Partial<IIncident>[]): Promise<IIncident[]> {
    const results: IIncident[] = [];
    for (const inc of incidents) {
      const created = await this.create(inc);
      results.push(created);
    }
    return results;
  },

  async deleteMany(): Promise<void> {
    fallbackIncidents.clear();
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('incidents').delete().neq('incident_id', '');
      } catch (err) {
        // ignore
      }
    }
  },
};
