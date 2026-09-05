import { TelemetryPacket, MineZoneId, SafetyStatus, ATEXZoneRating } from '../types/dashboard.js';
import { getSupabaseClient } from '../config/supabase.js';

export interface ITelemetry extends Omit<TelemetryPacket, 'timestamp'> {
  id?: string;
  timestamp: Date | string | number;
  createdAt?: Date | string;
}

// In-memory circular buffer for fast local fallback
const fallbackTelemetryBuffer: ITelemetry[] = [];
const MAX_BUFFER_SIZE = 200;

const mapRowToTelemetry = (row: any): ITelemetry => {
  return {
    id: row.id,
    nodeId: row.node_id,
    zone: row.zone,
    depthMeters: Number(row.depth_meters),
    methane_CH4: Number(row.methane_ch4),
    carbonMonoxide_CO: Number(row.carbon_monoxide_co),
    temperature: Number(row.temperature),
    humidity: Number(row.humidity),
    pressure: Number(row.pressure),
    oxygen_O2: Number(row.oxygen_o2),
    airVelocity_ms: Number(row.air_velocity_ms),
    airQualityIndex: Number(row.air_quality_index),
    atexZone: row.atex_zone as ATEXZoneRating,
    sectionPowerState: row.section_power_state,
    ventilationFanState: row.ventilation_fan_state,
    status: row.status as SafetyStatus,
    timestamp: row.timestamp,
  };
};

const mapTelemetryToRow = (t: Partial<ITelemetry>): any => {
  return {
    node_id: t.nodeId,
    zone: t.zone,
    depth_meters: t.depthMeters,
    methane_ch4: t.methane_CH4,
    carbon_monoxide_co: t.carbonMonoxide_CO,
    temperature: t.temperature,
    humidity: t.humidity,
    pressure: t.pressure,
    oxygen_o2: t.oxygen_O2,
    air_velocity_ms: t.airVelocity_ms,
    air_quality_index: t.airQualityIndex,
    atex_zone: t.atexZone,
    section_power_state: t.sectionPowerState || 'ACTIVE',
    ventilation_fan_state: t.ventilationFanState || 'NORMAL',
    status: t.status || 'NOMINAL',
    timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
  };
};

export const TelemetryModel = {
  find(query?: { timestamp?: { $gte?: Date }; zone?: string }) {
    let limitCount = 100;
    let sortAscending = true;

    const execute = async (): Promise<ITelemetry[]> => {
      const client = getSupabaseClient();
      if (client) {
        try {
          let req = client
            .from('telemetry')
            .select('*')
            .order('timestamp', { ascending: sortAscending })
            .limit(limitCount);

          if (query?.timestamp?.$gte) {
            req = req.gte('timestamp', new Date(query.timestamp.$gte).toISOString());
          }
          if (query?.zone && query.zone !== 'all') {
            req = req.eq('zone', query.zone);
          }

          const { data, error } = await req;
          if (!error && data && data.length > 0) {
            return data.map(mapRowToTelemetry);
          }
        } catch (err) {
          // fallback
        }
      }

      // Memory buffer fallback
      let list = [...fallbackTelemetryBuffer];
      if (query?.timestamp?.$gte) {
        const cutoffTime = new Date(query.timestamp.$gte).getTime();
        list = list.filter((r) => new Date(r.timestamp).getTime() >= cutoffTime);
      }
      if (query?.zone && query.zone !== 'all') {
        list = list.filter((r) => r.zone === query.zone);
      }

      list.sort((a, b) => {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortAscending ? diff : -diff;
      });

      return list.slice(0, limitCount);
    };

    return {
      sort(criteria: any) {
        if (criteria?.timestamp === -1) {
          sortAscending = false;
        } else {
          sortAscending = true;
        }
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

  async create(packet: Partial<ITelemetry>): Promise<ITelemetry> {
    const fullItem: ITelemetry = {
      nodeId: packet.nodeId || 'NODE-01',
      zone: packet.zone || 'Shaft-01',
      depthMeters: packet.depthMeters || 300,
      methane_CH4: packet.methane_CH4 ?? 0.2,
      carbonMonoxide_CO: packet.carbonMonoxide_CO ?? 8.0,
      temperature: packet.temperature ?? 22.0,
      humidity: packet.humidity ?? 50.0,
      pressure: packet.pressure ?? 1013.0,
      oxygen_O2: packet.oxygen_O2 ?? 20.9,
      airVelocity_ms: packet.airVelocity_ms ?? 1.5,
      airQualityIndex: packet.airQualityIndex ?? 20,
      atexZone: packet.atexZone || 'ATEX Zone 2',
      sectionPowerState: packet.sectionPowerState || 'ACTIVE',
      ventilationFanState: packet.ventilationFanState || 'NORMAL',
      status: packet.status || 'NOMINAL',
      timestamp: packet.timestamp || new Date(),
    };

    fallbackTelemetryBuffer.push(fullItem);
    if (fallbackTelemetryBuffer.length > MAX_BUFFER_SIZE) {
      fallbackTelemetryBuffer.shift();
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const row = mapTelemetryToRow(fullItem);
        const { data, error } = await client
          .from('telemetry')
          .insert(row)
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapRowToTelemetry(data);
        }
      } catch (err) {
        // memory buffer has the reading
      }
    }

    return fullItem;
  },
};
