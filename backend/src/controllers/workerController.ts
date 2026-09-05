import { Request, Response } from 'express';
import { WorkerModel } from '../models/Worker.js';
import { AIVisionService } from '../services/aiVisionService.js';

export const getWorkerRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone } = req.query;
    const filter: any = { activeUnderground: true };
    if (zone && zone !== 'ALL') {
      filter.zone = zone;
    }

    const workers = await WorkerModel.find(filter).lean();
    res.json({ success: true, count: workers.length, data: workers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const scanWorkerPPE = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId, ppeCompliance, confidence } = req.body;
    if (!workerId) {
      res.status(400).json({ success: false, error: 'Worker ID is required' });
      return;
    }

    const result = await AIVisionService.processWorkerScan(workerId, ppeCompliance, confidence);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const worker = await WorkerModel.create(req.body);
    res.status(201).json({ success: true, data: worker });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
