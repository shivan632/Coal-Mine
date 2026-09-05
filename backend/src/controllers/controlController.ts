import { Request, Response } from 'express';
import { interlockEngine } from '../services/interlockEngine.js';
import { wsService } from '../services/websocketService.js';
import { InterlockCommand, MineZoneId } from '../types/dashboard.js';

export const getInterlockStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const state = interlockEngine.getSystemState();
    res.json({ success: true, data: state });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const executeInterlockCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const cmd: InterlockCommand = req.body;
    if (!cmd.action) {
      res.status(400).json({ success: false, error: 'Command action is required' });
      return;
    }

    const result = interlockEngine.executeCommand(cmd);
    wsService.broadcastInterlockState(result.state);

    res.json({
      success: result.success,
      message: result.message,
      data: result.state,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setPowerState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone, state, action, supervisorName, badgeId, reason } = req.body;
    const targetZone: MineZoneId = zone || 'Gas-Zone-B12';

    let resolvedAction: 'CUT_POWER' | 'RESTORE_POWER' = 'CUT_POWER';
    if (action === 'CUT_POWER' || action === 'RESTORE_POWER') {
      resolvedAction = action;
    } else if (state === 'ACTIVE') {
      resolvedAction = 'RESTORE_POWER';
    } else if (state === 'CUTOFF') {
      resolvedAction = 'CUT_POWER';
    }

    const cmd: InterlockCommand = {
      action: resolvedAction,
      zone: targetZone,
      supervisorName: supervisorName || 'Control Room Operator',
      badgeId: badgeId || 'AUTH-SEC-401',
      reason: reason || `Manual section breaker override to ${resolvedAction}`,
    };

    const result = interlockEngine.executeCommand(cmd);
    wsService.broadcastInterlockState(result.state);

    res.json({
      success: result.success,
      message: result.message,
      data: result.state,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setVentilationState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone, fanState, action, supervisorName, badgeId, reason } = req.body;
    const targetZone: MineZoneId = zone || 'Gas-Zone-B12';

    let resolvedAction: 'SET_FAN_OVERDRIVE' | 'SET_FAN_NORMAL' = 'SET_FAN_OVERDRIVE';
    if (action === 'SET_FAN_OVERDRIVE' || action === 'SET_FAN_NORMAL') {
      resolvedAction = action;
    } else if (fanState === 'OVERDRIVE') {
      resolvedAction = 'SET_FAN_OVERDRIVE';
    } else if (fanState === 'NORMAL') {
      resolvedAction = 'SET_FAN_NORMAL';
    }

    const cmd: InterlockCommand = {
      action: resolvedAction,
      zone: targetZone,
      supervisorName: supervisorName || 'Ventilation Engineer',
      badgeId: badgeId || 'AUTH-VENT-102',
      reason: reason || `Manual scrubber speed shift to ${resolvedAction}`,
    };

    const result = interlockEngine.executeCommand(cmd);
    wsService.broadcastInterlockState(result.state);

    res.json({
      success: result.success,
      message: result.message,
      data: result.state,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleAutoInterlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supervisorName, badgeId, reason } = req.body;

    const cmd: InterlockCommand = {
      action: 'TOGGLE_AUTO_ARM',
      supervisorName: supervisorName || 'Chief Safety Officer',
      badgeId: badgeId || 'AUTH-DIRECTOR-01',
      reason: reason || 'Automated safety loop toggle authorization',
    };

    const result = interlockEngine.executeCommand(cmd);
    wsService.broadcastInterlockState(result.state);

    res.json({
      success: result.success,
      message: result.message,
      data: result.state,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
