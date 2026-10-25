import {
  FanSpeed,
  CompressorState,
  OccupancyState,
  CoolingType,
} from '@/domain/types';
import { DomainEvent } from '@/domain/events';

export interface SmartHomeEvaluationInputs {
  simTimeMs: number;
  indoorTempC: number;
  relativeHumidityPct: number;
  occupancy: OccupancyState;
  currentVacancyTimerSeconds: number | null;
  fanAutoMode: boolean;
  quietMode: boolean;
  quietSpeedLimit: FanSpeed;
  currentFanSpeed: FanSpeed;
  coolingEnabled: boolean;
  coolingType: CoolingType;
  coolingSetpointC: number;
  currentCompressorState: CompressorState;
  vacancyDelaySeconds: number;
  deltaSimSeconds: number;
}

export interface SmartHomeEvaluationResult {
  nextFanSpeed: FanSpeed;
  nextCompressorState: CompressorState;
  nextVacancyTimerSeconds: number | null;
  events: DomainEvent[];
}

export function evaluateSmartHomeRules(
  inputs: SmartHomeEvaluationInputs,
): SmartHomeEvaluationResult {
  const events: DomainEvent[] = [];
  let nextFanSpeed = inputs.currentFanSpeed;
  let nextCompressorState = inputs.currentCompressorState;
  let nextVacancyTimerSeconds = inputs.currentVacancyTimerSeconds;

  // -------------------------------------------------------------
  // 1. Vacancy Timer & Auto-Off Logic
  // -------------------------------------------------------------
  if (inputs.occupancy === 'absent') {
    if (nextVacancyTimerSeconds === null) {
      // Start vacancy countdown
      nextVacancyTimerSeconds = inputs.vacancyDelaySeconds;
      events.push({
        id: `evt-vac-start-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'VACANCY_TIMER_STARTED',
        summary: `Occupancy absent: started ${inputs.vacancyDelaySeconds}s auto-off countdown.`,
        severity: 'notice',
      });
    } else {
      // Decrement timer
      nextVacancyTimerSeconds = Math.max(0, nextVacancyTimerSeconds - inputs.deltaSimSeconds);
      if (nextVacancyTimerSeconds === 0 && inputs.currentFanSpeed !== 'off') {
        nextFanSpeed = 'off';
        events.push({
          id: `evt-fan-off-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'FAN_AUTO_OFF',
          summary: 'Vacancy timeout reached (room empty). Fan turned off automatically to save energy.',
          severity: 'warning',
        });
      }
    }
  } else {
    // Occupancy is present
    if (nextVacancyTimerSeconds !== null) {
      // Occupancy returned, cancel timer
      nextVacancyTimerSeconds = null;
      events.push({
        id: `evt-vac-cancel-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'VACANCY_TIMER_CANCELLED',
        summary: 'Occupant presence detected. Vacancy auto-off timer cancelled.',
        severity: 'info',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. AC Thermostat Hysteresis (±0.5°C band)
  // -------------------------------------------------------------
  if (inputs.coolingEnabled) {
    const upperLimit = inputs.coolingSetpointC + 0.5;
    const lowerLimit = inputs.coolingSetpointC - 0.5;

    if (inputs.indoorTempC >= upperLimit && inputs.currentCompressorState !== 'cooling') {
      nextCompressorState = 'cooling';
      events.push({
        id: `evt-ac-cool-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'COOLING_STATE_CHANGED',
        oldState: inputs.currentCompressorState,
        newState: 'cooling',
        indoorTemp: inputs.indoorTempC,
        targetTemp: inputs.coolingSetpointC,
        summary: `Room temp (${inputs.indoorTempC.toFixed(1)}°C) exceeded upper band (${upperLimit}°C). Compressor started.`,
        severity: 'notice',
      });
    } else if (inputs.indoorTempC <= lowerLimit && inputs.currentCompressorState === 'cooling') {
      nextCompressorState = 'resting';
      events.push({
        id: `evt-ac-rest-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'COOLING_STATE_CHANGED',
        oldState: 'cooling',
        newState: 'resting',
        indoorTemp: inputs.indoorTempC,
        targetTemp: inputs.coolingSetpointC,
        summary: `Room temp (${inputs.indoorTempC.toFixed(1)}°C) reached setpoint lower band (${lowerLimit}°C). Compressor resting.`,
        severity: 'info',
      });
    }
  } else {
    nextCompressorState = 'off';
  }

  // -------------------------------------------------------------
  // 3. Autonomous Fan Speed Selection & Quiet Mode Override
  // -------------------------------------------------------------
  if (inputs.fanAutoMode && inputs.occupancy === 'present') {
    let targetSpeed: FanSpeed = 'low';

    // Temperature demand evaluation
    if (inputs.indoorTempC > inputs.coolingSetpointC + 3.0) {
      targetSpeed = 'high';
    } else if (inputs.indoorTempC > inputs.coolingSetpointC + 0.8) {
      targetSpeed = 'medium';
    } else {
      targetSpeed = 'low';
    }

    // Quiet mode cap takes strict precedence
    if (inputs.quietMode && (targetSpeed === 'medium' || targetSpeed === 'high')) {
      const originalDemand = targetSpeed;
      targetSpeed = inputs.quietSpeedLimit; // Defaults to 'low'
      if (inputs.currentFanSpeed !== targetSpeed) {
        events.push({
          id: `evt-quiet-cap-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'FAN_STATE_CHANGED',
          oldSpeed: inputs.currentFanSpeed,
          newSpeed: targetSpeed,
          reason: `Quiet Mode active: capped fan at "${targetSpeed}" (demand was "${originalDemand}") to minimize acoustic noise.`,
          summary: `Quiet Mode context override capped fan speed at ${targetSpeed}.`,
          severity: 'info',
        });
      }
    } else if (inputs.currentFanSpeed !== targetSpeed) {
      events.push({
        id: `evt-fan-auto-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'FAN_STATE_CHANGED',
        oldSpeed: inputs.currentFanSpeed,
        newSpeed: targetSpeed,
        reason: `Auto Comfort algorithm selected "${targetSpeed}" to maintain operative comfort.`,
        summary: `Auto-selected fan speed: ${targetSpeed} (Indoor: ${inputs.indoorTempC.toFixed(1)}°C)`,
        severity: 'info',
      });
    }

    nextFanSpeed = targetSpeed;
  }

  return {
    nextFanSpeed,
    nextCompressorState,
    nextVacancyTimerSeconds,
    events,
  };
}
