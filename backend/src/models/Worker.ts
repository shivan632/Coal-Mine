import { MineZoneId } from '../types/dashboard.js';
import { getSupabaseClient } from '../config/supabase.js';

export interface IWorker {
  id?: string;
  workerId: string;
  name: string;
  role: string;
  zone: MineZoneId;
  bloodGroup: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'B-' | 'A-';
  emergencyContact: string;
  shiftStartTimestamp: Date | string | number;
  maxShiftMinutes: number;
  photoUrl?: string;
  activeUnderground: boolean;
  lastScanned?: Date | string | number;
  ppeCompliance: {
    helmet: boolean;
    safetyJacket: boolean;
    respiratorMask: boolean;
    steelBoots: boolean;
    gloves: boolean;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// In-memory fallback cache
const fallbackWorkers: Map<string, IWorker> = new Map();

// Helper to map Supabase snake_case row to IWorker
const mapRowToWorker = (row: any): IWorker => {
  return {
    id: row.id,
    workerId: row.worker_id,
    name: row.name,
    role: row.role,
    zone: row.zone,
    bloodGroup: row.blood_group,
    emergencyContact: row.emergency_contact,
    shiftStartTimestamp: row.shift_start_timestamp,
    maxShiftMinutes: row.max_shift_minutes,
    photoUrl: row.photo_url,
    activeUnderground: row.active_underground,
    lastScanned: row.last_scanned,
    ppeCompliance: typeof row.ppe_compliance === 'string' ? JSON.parse(row.ppe_compliance) : (row.ppe_compliance || {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Helper to map IWorker to Supabase snake_case row
const mapWorkerToRow = (worker: Partial<IWorker>): any => {
  const row: any = {};
  if (worker.workerId !== undefined) row.worker_id = worker.workerId;
  if (worker.name !== undefined) row.name = worker.name;
  if (worker.role !== undefined) row.role = worker.role;
  if (worker.zone !== undefined) row.zone = worker.zone;
  if (worker.bloodGroup !== undefined) row.blood_group = worker.bloodGroup;
  if (worker.emergencyContact !== undefined) row.emergency_contact = worker.emergencyContact;
  if (worker.shiftStartTimestamp !== undefined) {
    row.shift_start_timestamp = new Date(worker.shiftStartTimestamp).toISOString();
  }
  if (worker.maxShiftMinutes !== undefined) row.max_shift_minutes = worker.maxShiftMinutes;
  if (worker.photoUrl !== undefined) row.photo_url = worker.photoUrl;
  if (worker.activeUnderground !== undefined) row.active_underground = worker.activeUnderground;
  if (worker.lastScanned !== undefined) {
    row.last_scanned = new Date(worker.lastScanned).toISOString();
  }
  if (worker.ppeCompliance !== undefined) row.ppe_compliance = worker.ppeCompliance;
  return row;
};

export const WorkerModel = {
  find(filter?: { zone?: string; activeUnderground?: boolean }) {
    const execute = async (): Promise<IWorker[]> => {
      const client = getSupabaseClient();
      if (client) {
        try {
          let query = client.from('workers').select('*');
          if (filter?.activeUnderground !== undefined) {
            query = query.eq('active_underground', filter.activeUnderground);
          }
          if (filter?.zone && filter.zone !== 'ALL') {
            query = query.eq('zone', filter.zone);
          }

          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            return data.map(mapRowToWorker);
          }
        } catch (err) {
          // fallback to memory cache
        }
      }

      // Fallback to in-memory store
      let list = Array.from(fallbackWorkers.values());
      if (filter?.activeUnderground !== undefined) {
        list = list.filter((w) => w.activeUnderground === filter.activeUnderground);
      }
      if (filter?.zone && filter.zone !== 'ALL') {
        list = list.filter((w) => w.zone === filter.zone);
      }
      return list;
    };

    return {
      lean() {
        return execute();
      },
      then(resolve: any, reject: any) {
        return execute().then(resolve, reject);
      },
    };
  },

  async findOne(filter: { workerId: string }): Promise<IWorker | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('workers')
          .select('*')
          .eq('worker_id', filter.workerId)
          .maybeSingle();

        if (!error && data) {
          return mapRowToWorker(data);
        }
      } catch (err) {
        // fallback to memory cache
      }
    }

    return fallbackWorkers.get(filter.workerId) || null;
  },

  async create(workerData: Partial<IWorker>): Promise<IWorker> {
    const fullWorker: IWorker = {
      workerId: workerData.workerId || `MINER-${Math.floor(1000 + Math.random() * 9000)}`,
      name: workerData.name || 'Miner',
      role: workerData.role || 'Operator',
      zone: workerData.zone || 'Shaft-01',
      bloodGroup: workerData.bloodGroup || 'O+',
      emergencyContact: workerData.emergencyContact || '+91 98000 00000',
      shiftStartTimestamp: workerData.shiftStartTimestamp || new Date(),
      maxShiftMinutes: workerData.maxShiftMinutes || 480,
      photoUrl: workerData.photoUrl || '/assets/miners/rajesh.jpg',
      activeUnderground: workerData.activeUnderground ?? true,
      lastScanned: workerData.lastScanned || new Date(),
      ppeCompliance: workerData.ppeCompliance || {
        helmet: true,
        safetyJacket: true,
        respiratorMask: true,
        steelBoots: true,
        gloves: true,
      },
    };

    fallbackWorkers.set(fullWorker.workerId, fullWorker);

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapWorkerToRow(fullWorker);
        const { data, error } = await client
          .from('workers')
          .upsert(row, { onConflict: 'worker_id' })
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToWorker(data);
        }
      } catch (err) {
        // in-memory fallback holds the data
      }
    }

    return fullWorker;
  },

  async updateOne(filter: { workerId: string }, updates: Partial<IWorker>): Promise<IWorker | null> {
    const existing = await this.findOne(filter);
    if (!existing) return null;

    const merged: IWorker = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    fallbackWorkers.set(filter.workerId, merged);

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapWorkerToRow(updates);
        row.updated_at = new Date().toISOString();

        const { data, error } = await client
          .from('workers')
          .update(row)
          .eq('worker_id', filter.workerId)
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToWorker(data);
        }
      } catch (err) {
        // in-memory holds the update
      }
    }

    return merged;
  },

  async insertMany(workers: Partial<IWorker>[]): Promise<IWorker[]> {
    const createdList: IWorker[] = [];
    for (const w of workers) {
      const created = await this.create(w);
      createdList.push(created);
    }
    return createdList;
  },

  async deleteMany(): Promise<void> {
    fallbackWorkers.clear();
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('workers').delete().neq('worker_id', '');
      } catch (err) {
        // ignore
      }
    }
  },
};
