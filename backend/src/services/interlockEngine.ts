import { MineZoneId, TelemetryPacket, InterlockZoneState, InterlockSystemState, InterlockAuditLog, InterlockCommand } from '../types/dashboard.js';

class InterlockEngine {
  private autoContainmentArmed = true;

  private zoneStates: Record<MineZoneId, InterlockZoneState> = {
    'Shaft-01': {
      zone: 'Shaft-01',
      sectionPower: 'ACTIVE',
      ventilationFan: 'NORMAL',
      turnstileGating: 'UNLOCKED',
      autoInterlockArmed: true,
    },
    'Tunnel-A04': {
      zone: 'Tunnel-A04',
      sectionPower: 'ACTIVE',
      ventilationFan: 'NORMAL',
      turnstileGating: 'UNLOCKED',
      autoInterlockArmed: true,
    },
    'Gas-Zone-B12': {
      zone: 'Gas-Zone-B12',
      sectionPower: 'ACTIVE',
      ventilationFan: 'NORMAL',
      turnstileGating: 'UNLOCKED',
      autoInterlockArmed: true,
    },
    'Conveyor-C02': {
      zone: 'Conveyor-C02',
      sectionPower: 'ACTIVE',
      ventilationFan: 'NORMAL',
      turnstileGating: 'UNLOCKED',
      autoInterlockArmed: true,
    },
    'Excavation-Face': {
      zone: 'Excavation-Face',
      sectionPower: 'ACTIVE',
      ventilationFan: 'NORMAL',
      turnstileGating: 'UNLOCKED',
      autoInterlockArmed: true,
    },
  };

  private auditLogs: InterlockAuditLog[] = [];
  private maxAuditLogs = 50;

  public evaluateTelemetry(packet: TelemetryPacket): { powerChanged: boolean; fanChanged: boolean } {
    const { zone, methane_CH4, temperature } = packet;
    const current = this.zoneStates[zone];
    if (!current) return { powerChanged: false, fanChanged: false };

    let powerChanged = false;
    let fanChanged = false;

    // Safety Interlock Rule 1: DGMS CH4 >= 1.25% Trip
    if (methane_CH4 >= 1.25 && this.autoContainmentArmed && current.autoInterlockArmed) {
      if (current.sectionPower !== 'CUTOFF') {
        current.sectionPower = 'CUTOFF';
        current.turnstileGating = 'LOCKED';
        current.lastTripTimestamp = Date.now();
        current.lastTripReason = `Methane surge ${methane_CH4}% exceeds 1.25% DGMS limit.`;
        powerChanged = true;

        this.addAuditLog({
          zone,
          action: 'AUTO_TRIP_POWER',
          initiatedBy: 'AUTOMATED_SAFETY_ENGINE',
          reason: `Automatic DGMS Sec. 153 Trip: CH4 = ${methane_CH4}%`,
          sensorTriggerValue: `${methane_CH4}% CH4`,
        });
      }

      if (current.ventilationFan !== 'OVERDRIVE') {
        current.ventilationFan = 'OVERDRIVE';
        fanChanged = true;

        this.addAuditLog({
          zone,
          action: 'AUTO_OVERDRIVE_FAN',
          initiatedBy: 'AUTOMATED_SAFETY_ENGINE',
          reason: `Scrubber Fan overdrive engaged for rapid gas purge (CH4 = ${methane_CH4}%)`,
          sensorTriggerValue: `${methane_CH4}% CH4`,
        });
      }
    } else if (temperature >= 38.0 && this.autoContainmentArmed && current.autoInterlockArmed) {
      // Safety Interlock Rule 2: High Thermal Overheat Trip
      if (current.ventilationFan !== 'OVERDRIVE') {
        current.ventilationFan = 'OVERDRIVE';
        fanChanged = true;
        this.addAuditLog({
          zone,
          action: 'AUTO_OVERDRIVE_FAN',
          initiatedBy: 'AUTOMATED_SAFETY_ENGINE',
          reason: `Chilled ventilation overdrive for thermal spike (Temp = ${temperature}°C)`,
          sensorTriggerValue: `${temperature}°C`,
        });
      }
    }

    return { powerChanged, fanChanged };
  }

  public executeCommand(cmd: InterlockCommand): { success: boolean; message: string; state: InterlockSystemState } {
    const { action, zone, supervisorName = 'System Supervisor', badgeId = 'AUTH-SUPERVISOR', reason = 'Manual command' } = cmd;

    if (action === 'TOGGLE_AUTO_ARM') {
      this.autoContainmentArmed = !this.autoContainmentArmed;
      this.addAuditLog({
        zone: zone || 'Shaft-01',
        action: this.autoContainmentArmed ? 'RESTORE_NOMINAL' : 'MANUAL_OVERRIDE_POWER',
        initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE',
        reason: `Auto Interlock Loop ${this.autoContainmentArmed ? 'ARMED' : 'DISARMED'} by ${supervisorName} [${badgeId}]. ${reason}`,
      });
      return {
        success: true,
        message: `Automated interlocking protection is now ${this.autoContainmentArmed ? 'ARMED' : 'DISARMED'}.`,
        state: this.getSystemState(),
      };
    }

    if (!zone || !this.zoneStates[zone]) {
      return {
        success: false,
        message: `Invalid zone specified: ${zone}`,
        state: this.getSystemState(),
      };
    }

    const target = this.zoneStates[zone];

    switch (action) {
      case 'CUT_POWER':
        target.sectionPower = 'CUTOFF';
        target.turnstileGating = 'LOCKED';
        this.addAuditLog({
          zone,
          action: 'MANUAL_OVERRIDE_POWER',
          initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE',
          reason: `Manual breaker trip by ${supervisorName} [${badgeId}]: ${reason}`,
        });
        break;

      case 'RESTORE_POWER':
        target.sectionPower = 'ACTIVE';
        target.turnstileGating = 'UNLOCKED';
        this.addAuditLog({
          zone,
          action: 'RESTORE_NOMINAL',
          initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE',
          reason: `Power grid manually re-energized by ${supervisorName} [${badgeId}]: ${reason}`,
        });
        break;

      case 'SET_FAN_OVERDRIVE':
        target.ventilationFan = 'OVERDRIVE';
        this.addAuditLog({
          zone,
          action: 'MANUAL_OVERRIDE_FAN',
          initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE',
          reason: `Ventilation scrubber set to 100% overdrive by ${supervisorName} [${badgeId}]`,
        });
        break;

      case 'SET_FAN_NORMAL':
        target.ventilationFan = 'NORMAL';
        this.addAuditLog({
          zone,
          action: 'RESTORE_NOMINAL',
          initiatedBy: 'SUPERVISOR_MANUAL_OVERRIDE',
          reason: `Ventilation scrubber restored to normal by ${supervisorName} [${badgeId}]`,
        });
        break;

      case 'LOCK_TURNSTILE':
        target.turnstileGating = 'LOCKED';
        break;

      case 'UNLOCK_TURNSTILE':
        target.turnstileGating = 'UNLOCKED';
        break;
    }

    return {
      success: true,
      message: `Interlock command ${action} executed successfully on ${zone}.`,
      state: this.getSystemState(),
    };
  }

  public getSystemState(): InterlockSystemState {
    return {
      autoContainmentArmed: this.autoContainmentArmed,
      zones: this.zoneStates,
      recentAuditLogs: this.auditLogs,
    };
  }

  public getZoneState(zone: MineZoneId): InterlockZoneState {
    return this.zoneStates[zone];
  }

  private addAuditLog(log: Omit<InterlockAuditLog, 'id' | 'timestamp'>) {
    const fullLog: InterlockAuditLog = {
      id: `ITL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      ...log,
    };
    this.auditLogs.unshift(fullLog);
    if (this.auditLogs.length > this.maxAuditLogs) {
      this.auditLogs.pop();
    }
  }
}

export const interlockEngine = new InterlockEngine();
