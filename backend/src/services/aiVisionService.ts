import { PPEComplianceState, WorkerInferenceResult } from '../types/dashboard.js';
import { WorkerModel } from '../models/Worker.js';
import { ScanLogModel } from '../models/ScanLog.js';
import { wsService } from './websocketService.js';

export class AIVisionService {
  public static evaluatePPE(compliance: PPEComplianceState): {
    verdict: 'ALL CORRECT' | 'SOMETHING IS MISSING!';
    missingItems: ('Helmet' | 'Safety Jacket' | 'Respirator Mask' | 'Steel Boots' | 'Protective Gloves')[];
    barrierState: 'LOCKED' | 'UNLOCKED';
  } {
    const missing: ('Helmet' | 'Safety Jacket' | 'Respirator Mask' | 'Steel Boots' | 'Protective Gloves')[] = [];

    if (!compliance.helmet) missing.push('Helmet');
    if (!compliance.safetyJacket) missing.push('Safety Jacket');
    if (!compliance.respiratorMask) missing.push('Respirator Mask');
    if (!compliance.steelBoots) missing.push('Steel Boots');
    if (!compliance.gloves) missing.push('Protective Gloves');

    const isAllCorrect = missing.length === 0;

    return {
      verdict: isAllCorrect ? 'ALL CORRECT' : 'SOMETHING IS MISSING!',
      missingItems: missing,
      barrierState: isAllCorrect ? 'UNLOCKED' : 'LOCKED',
    };
  }

  public static async processWorkerScan(
    workerId: string,
    complianceInput?: Partial<PPEComplianceState>,
    confidence: number = 98.5
  ): Promise<WorkerInferenceResult> {
    const worker = await WorkerModel.findOne({ workerId });

    const ppe: PPEComplianceState = {
      helmet: complianceInput?.helmet ?? worker?.ppeCompliance?.helmet ?? true,
      safetyJacket: complianceInput?.safetyJacket ?? worker?.ppeCompliance?.safetyJacket ?? true,
      respiratorMask: complianceInput?.respiratorMask ?? worker?.ppeCompliance?.respiratorMask ?? true,
      steelBoots: complianceInput?.steelBoots ?? worker?.ppeCompliance?.steelBoots ?? true,
      gloves: complianceInput?.gloves ?? worker?.ppeCompliance?.gloves ?? true,
    };

    const evaluation = this.evaluatePPE(ppe);

    const shiftStart = worker?.shiftStartTimestamp ? new Date(worker.shiftStartTimestamp).getTime() : Date.now() - 4 * 3600000;
    const undergroundMinutes = Math.floor((Date.now() - shiftStart) / 60000);

    const result: WorkerInferenceResult = {
      workerId: worker?.workerId || workerId,
      name: worker?.name || 'Underground Miner',
      role: worker?.role || 'Excavation Technician',
      zone: worker?.zone || 'Tunnel-A04',
      bloodGroup: worker?.bloodGroup || 'O+',
      emergencyContact: worker?.emergencyContact || '+91 98000 00000',
      shiftStartTimestamp: shiftStart,
      undergroundMinutes,
      maxShiftMinutes: worker?.maxShiftMinutes || 480,
      photoUrl: worker?.photoUrl || '/assets/miners/rajesh.jpg',
      confidence,
      ppeCompliance: ppe,
      verdict: evaluation.verdict,
      missingItems: evaluation.missingItems,
      turnstileBarrierState: evaluation.barrierState,
      lastScanned: Date.now(),
    };

    // Update worker state in Supabase DB / in-memory store
    if (worker) {
      await WorkerModel.updateOne(
        { workerId: worker.workerId },
        {
          ppeCompliance: ppe,
          lastScanned: new Date(),
        }
      );
    }

    // Log to ScanLog
    try {
      await ScanLogModel.create({
        workerId: result.workerId,
        name: result.name,
        zone: result.zone,
        confidence: result.confidence,
        helmet: ppe.helmet,
        safetyJacket: ppe.safetyJacket,
        respiratorMask: ppe.respiratorMask,
        steelBoots: ppe.steelBoots,
        gloves: ppe.gloves,
        verdict: result.verdict,
        missingItems: result.missingItems,
        turnstileState: result.turnstileBarrierState,
        timestamp: new Date(),
      });
    } catch (e) {
      // transient logging error
    }

    // Broadcast over WebSocket stream to dashboard
    wsService.broadcastWorkerInference(result);

    return result;
  }
}
