import { Request, Response } from 'express';
import { TelemetryModel } from '../models/Telemetry.js';
import { telemetryEngine } from '../services/telemetryEngine.js';
import { MineZoneId } from '../types/dashboard.js';

export const getLiveTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone } = req.query;
    if (zone && zone !== 'all') {
      const packet = telemetryEngine.getZonePacket(zone as MineZoneId);
      res.json({ success: true, data: packet });
      return;
    }
    const allPackets = telemetryEngine.getAllZonePackets();
    res.json({ success: true, data: allPackets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHistoricalTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = '24h', zone } = req.query;
    let cutoff = new Date();

    if (timeframe === '1h') cutoff = new Date(Date.now() - 3600000);
    else if (timeframe === '24h') cutoff = new Date(Date.now() - 86400000);
    else if (timeframe === '7d') cutoff = new Date(Date.now() - 7 * 86400000);
    else if (timeframe === '30d') cutoff = new Date(Date.now() - 30 * 86400000);

    const query: any = { timestamp: { $gte: cutoff } };
    if (zone && zone !== 'all') {
      query.zone = zone;
    }

    const records = await TelemetryModel.find(query)
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();

    if (records.length === 0) {
      // Fallback generated points if database was freshly initialized
      const fallbackPoints = Array.from({ length: 20 }).map((_, i) => {
        const time = new Date(Date.now() - (20 - i) * 60000);
        return {
          timeLabel: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: time.getTime(),
          ch4: +(0.4 + Math.random() * 0.25).toFixed(2),
          co: +(10 + Math.random() * 4).toFixed(1),
          temp: +(24.0 + Math.random() * 1.5).toFixed(1),
          humidity: +(56 + Math.random() * 6).toFixed(1),
          pressure: +(1013 + Math.random() * 2).toFixed(1),
          o2: +(20.9 + Math.random() * 0.1).toFixed(1),
          airVelocity: +(1.5 + Math.random() * 0.4).toFixed(1),
          complianceRate: 94,
          compositeSafetyIndex: 92,
        };
      });
      res.json({ success: true, data: fallbackPoints });
      return;
    }

    const formattedPoints = records.map((r) => {
      const d = new Date(r.timestamp);
      return {
        timeLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: d.getTime(),
        ch4: r.methane_CH4,
        co: r.carbonMonoxide_CO,
        temp: r.temperature,
        humidity: r.humidity,
        pressure: r.pressure,
        o2: r.oxygen_O2,
        airVelocity: r.airVelocity_ms,
        complianceRate: 95,
        compositeSafetyIndex: r.methane_CH4 > 1.25 ? 45 : r.methane_CH4 > 0.75 ? 72 : 94,
      };
    });

    res.json({ success: true, data: formattedPoints });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
