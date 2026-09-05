import { Request, Response } from 'express';

let gateState: 'LOCKED' | 'UNLOCKED' = 'LOCKED';
let manualOverrideActive = false;

export const getTurnstileState = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      gateId: 'GATE-04',
      gateState: manualOverrideActive ? 'UNLOCKED' : gateState,
      manualOverrideActive,
      gpioPin: 14,
      comPort: 'COM3',
      baudRate: 115200,
    },
  });
};

export const setTurnstileOverride = async (req: Request, res: Response): Promise<void> => {
  const { override } = req.body;
  manualOverrideActive = !!override;
  res.json({
    success: true,
    message: `Manual turnstile override set to ${manualOverrideActive}`,
    data: { manualOverrideActive },
  });
};
