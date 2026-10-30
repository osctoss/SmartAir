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
  occupancyCount?: number;
  currentVacancyTimerSeconds: number | null;
  fanAutoMode: boolean;
  quietMode: boolean;
  quietSpeedLimit: FanSpeed;
  currentFanSpeed: FanSpeed;
  defaultFanSpeed?: FanSpeed;
  coolingEnabled: boolean;
  coolingType?: CoolingType;
  coolingSetpointC: number;
  currentCompressorState: CompressorState;
  vacancyDelaySeconds?: number;
  deltaSimSeconds: number;
  acInstalled?: boolean;
  acActivationDelayRemainingSeconds?: number | null;
  coolingStepAccumulatorSeconds?: number;
  coolingStepSeconds?: number;
  outdoorTempC?: number;
  coolerInstalled?: boolean;
  coolerEnabled?: boolean;
  highHumidityThresholdPct?: number;
  humidityProtectionTriggered?: boolean;
}

export interface SmartHomeEvaluationResult {
  nextFanSpeed: FanSpeed;
  nextCompressorState: CompressorState;
  nextVacancyTimerSeconds: number | null;
  nextAcActivationDelaySeconds: number | null;
  nextCoolingStepAccumulatorSeconds: number;
  nextIndoorTempC: number;
  nextCoolerEnabled: boolean;
  humidityProtectionTriggered: boolean;
  events: DomainEvent[];
}

export function evaluateSmartHomeRules(
  inputs: SmartHomeEvaluationInputs,
): SmartHomeEvaluationResult {
  const events: DomainEvent[] = [];
  let nextFanSpeed = inputs.currentFanSpeed;
  let nextCompressorState = inputs.currentCompressorState;
  let nextVacancyTimerSeconds = inputs.currentVacancyTimerSeconds;
  let nextAcActivationDelaySeconds =
    inputs.acActivationDelayRemainingSeconds !== undefined
      ? inputs.acActivationDelayRemainingSeconds
      : null;
  let nextCoolingStepAccumulatorSeconds = inputs.coolingStepAccumulatorSeconds ?? 0;
  let nextIndoorTempC = inputs.indoorTempC;
  let nextCoolerEnabled = inputs.coolerEnabled ?? false;
  let humidityProtectionTriggered = inputs.humidityProtectionTriggered ?? false;

  const isAcInstalled = inputs.acInstalled !== false;
  const isCoolerInstalled = inputs.coolerInstalled ?? false;
  const vacancyDelaySec = inputs.vacancyDelaySeconds ?? 20;
  const coolingStepSec = inputs.coolingStepSeconds ?? 5;
  const highHumidityThreshold = inputs.highHumidityThresholdPct ?? 65;
  const outdoorT = inputs.outdoorTempC ?? 38;

  const isUnoccupied =
    inputs.occupancy === 'absent' ||
    (inputs.occupancyCount !== undefined && inputs.occupancyCount === 0);

  // -------------------------------------------------------------
  // Priority 1: Vacancy Countdown & Auto-Shutdown Sequence
  // -------------------------------------------------------------
  if (isUnoccupied) {
    // 1. Immediately turn OFF AC compressor if installed
    if (isAcInstalled && nextCompressorState !== 'off') {
      const oldState = nextCompressorState;
      nextCompressorState = 'off';
      events.push({
        id: `evt-ac-vac-off-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'COOLING_STATE_CHANGED',
        oldState,
        newState: 'off',
        indoorTemp: nextIndoorTempC,
        targetTemp: inputs.coolingSetpointC,
        summary: 'Room vacant — AC switched OFF.',
        severity: 'notice',
      });
    }

    // Cancel pending AC activation & cooling progression
    nextAcActivationDelaySeconds = null;
    nextCoolingStepAccumulatorSeconds = 0;

    // 2. Reduce fan to LOW RPM immediately upon becoming empty
    if (nextFanSpeed !== 'off' && nextFanSpeed !== 'low') {
      nextFanSpeed = 'low';
      events.push({
        id: `evt-fan-vac-low-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'FAN_SPEED_REDUCED_LOW_RPM',
        summary: 'Room vacant: fan reduced to LOW RPM.',
        severity: 'info',
      });
    }

    // 3. Start or advance 20-second vacancy countdown
    if (nextVacancyTimerSeconds === null) {
      nextVacancyTimerSeconds = vacancyDelaySec;
      events.push({
        id: `evt-vac-start-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'VACANCY_TIMER_STARTED',
        summary: `Vacancy timer: ${vacancyDelaySec} seconds remaining.`,
        severity: 'notice',
      });
    } else {
      nextVacancyTimerSeconds = Math.max(0, nextVacancyTimerSeconds - inputs.deltaSimSeconds);
      if (nextVacancyTimerSeconds === 0 && nextFanSpeed !== 'off') {
        nextFanSpeed = 'off';
        events.push({
          id: `evt-fan-off-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'FAN_AUTO_OFF',
          summary: 'No occupancy detected — fan switched OFF.',
          severity: 'warning',
        });
      }
    }

    return {
      nextFanSpeed,
      nextCompressorState,
      nextVacancyTimerSeconds,
      nextAcActivationDelaySeconds,
      nextCoolingStepAccumulatorSeconds,
      nextIndoorTempC,
      nextCoolerEnabled,
      humidityProtectionTriggered,
      events,
    };
  }

  // -------------------------------------------------------------
  // Occupancy Present (occupancyCount > 0)
  // -------------------------------------------------------------
  // Cancel vacancy timer if occupant is present
  if (nextVacancyTimerSeconds !== null) {
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

  // -------------------------------------------------------------
  // Priority 2: Cooler High-Humidity Protection
  // -------------------------------------------------------------
  if (isCoolerInstalled && nextCoolerEnabled) {
    if (inputs.relativeHumidityPct >= highHumidityThreshold) {
      nextCoolerEnabled = false;
      if (nextFanSpeed === 'off') {
        nextFanSpeed = inputs.defaultFanSpeed || 'medium';
      }
      if (!humidityProtectionTriggered) {
        humidityProtectionTriggered = true;
        events.push({
          id: `evt-humidity-trigger-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'HIGH_HUMIDITY_TRIGGERED',
          summary: `Humidity threshold exceeded (${inputs.relativeHumidityPct}%) — cooler switched OFF; fan switched ON.`,
          severity: 'alert',
        });
      }
    } else {
      humidityProtectionTriggered = false;
    }
  }

  // -------------------------------------------------------------
  // Priority 3: AC 5-Minute Activation Delay & Step-Cooling Progression
  // -------------------------------------------------------------
  let isUnderAcCoolingLock = false;

  if (isAcInstalled && inputs.coolingEnabled) {
    // 3A. Handle AC 5-minute Activation Delay
    if (nextAcActivationDelaySeconds !== null && nextAcActivationDelaySeconds > 0) {
      nextAcActivationDelaySeconds = Math.max(0, nextAcActivationDelaySeconds - inputs.deltaSimSeconds);

      if (nextAcActivationDelaySeconds === 0) {
        nextAcActivationDelaySeconds = null;

        events.push({
          id: `evt-ac-eval-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'AC_ACTIVATION_EVALUATED',
          summary: `Outdoor temperature checked: ${outdoorT}°C; AC setpoint: ${inputs.coolingSetpointC}°C.`,
          severity: 'info',
        });

        // Stage A: AC Activation
        if (nextIndoorTempC > inputs.coolingSetpointC) {
          nextCompressorState = 'cooling';
          nextCoolingStepAccumulatorSeconds = 0;
          events.push({
            id: `evt-ac-compressor-on-${inputs.simTimeMs}`,
            simTimeMs: inputs.simTimeMs,
            timestampIso: new Date().toISOString(),
            type: 'COOLING_STATE_CHANGED',
            oldState: inputs.currentCompressorState,
            newState: 'cooling',
            indoorTemp: nextIndoorTempC,
            targetTemp: inputs.coolingSetpointC,
            summary: 'AC compressor activated.',
            severity: 'notice',
          });

          // If room is already between setpoint and setpoint + 2°C, apply LOW RPM immediately
          if (nextIndoorTempC <= inputs.coolingSetpointC + 2) {
            nextFanSpeed = 'low';
            isUnderAcCoolingLock = true;
            events.push({
              id: `evt-fan-low-rpm-${inputs.simTimeMs}`,
              simTimeMs: inputs.simTimeMs,
              timestampIso: new Date().toISOString(),
              type: 'FAN_SPEED_REDUCED_LOW_RPM',
              summary: `Room reached ${nextIndoorTempC}°C — fan changed to LOW RPM.`,
              severity: 'info',
            });
          }
        } else {
          // Room already at or below setpoint: do not activate compressor
          nextCompressorState = 'off';
        }
      }
    }

    // 3B. Active AC Compressor Step Cooling (1°C every 5 seconds)
    // Thermostat threshold evaluation when no 5-minute delay is pending
    if (
      nextAcActivationDelaySeconds === null &&
      (nextCompressorState === 'resting' || nextCompressorState === 'off')
    ) {
      if (nextIndoorTempC > inputs.coolingSetpointC + 0.5) {
        const oldState = nextCompressorState;
        nextCompressorState = 'cooling';
        events.push({
          id: `evt-ac-hysteresis-cooling-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'COOLING_STATE_CHANGED',
          oldState,
          newState: 'cooling',
          indoorTemp: nextIndoorTempC,
          targetTemp: inputs.coolingSetpointC,
          summary: 'AC compressor activated (thermostat threshold crossed).',
          severity: 'notice',
        });
      }
    }

    if (nextCompressorState === 'cooling') {
      if (nextIndoorTempC <= inputs.coolingSetpointC + 2) {
        isUnderAcCoolingLock = true;
      }

      if (nextIndoorTempC > inputs.coolingSetpointC) {
        nextCoolingStepAccumulatorSeconds += inputs.deltaSimSeconds;

        while (nextCoolingStepAccumulatorSeconds >= coolingStepSec && nextIndoorTempC > inputs.coolingSetpointC) {
          nextCoolingStepAccumulatorSeconds -= coolingStepSec;
          nextIndoorTempC -= 1;

          // Stage D: Compressor Rest when setpoint reached
          if (nextIndoorTempC <= inputs.coolingSetpointC) {
            nextIndoorTempC = inputs.coolingSetpointC;
            nextCompressorState = 'off';
            nextFanSpeed = 'low';
            isUnderAcCoolingLock = true;
            nextCoolingStepAccumulatorSeconds = 0;
            events.push({
              id: `evt-compressor-rest-${inputs.simTimeMs}`,
              simTimeMs: inputs.simTimeMs,
              timestampIso: new Date().toISOString(),
              type: 'COMPRESSOR_REST',
              summary: 'Room reached AC setpoint — compressor switched OFF.',
              severity: 'info',
            });
            break;
          }

          // Stage C: Low-RPM fan operation at setpoint + 2°C
          if (nextIndoorTempC <= inputs.coolingSetpointC + 2) {
            isUnderAcCoolingLock = true;
            if (nextFanSpeed !== 'low') {
              nextFanSpeed = 'low';
              events.push({
                id: `evt-fan-low-rpm-${inputs.simTimeMs}`,
                simTimeMs: inputs.simTimeMs,
                timestampIso: new Date().toISOString(),
                type: 'FAN_SPEED_REDUCED_LOW_RPM',
                summary: `Room reached ${nextIndoorTempC}°C — fan changed to LOW RPM.`,
                severity: 'info',
              });
            }
          }
        }
      } else {
        // Room already at or below setpoint
        nextIndoorTempC = inputs.coolingSetpointC;
        nextCompressorState = 'off';
        nextFanSpeed = 'low';
        isUnderAcCoolingLock = true;
        nextCoolingStepAccumulatorSeconds = 0;
      }
    }
  } else {
    // AC is uninstalled or cooling is disabled (Power OFF)
    if (nextCompressorState !== 'off') {
      const oldState = nextCompressorState;
      nextCompressorState = 'off';
      events.push({
        id: `evt-ac-disabled-off-${inputs.simTimeMs}`,
        simTimeMs: inputs.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'COOLING_STATE_CHANGED',
        oldState,
        newState: 'off',
        indoorTemp: nextIndoorTempC,
        targetTemp: inputs.coolingSetpointC,
        summary: !isAcInstalled ? 'AC uninstalled — cooling shut down.' : 'AC switched OFF.',
        severity: 'notice',
      });
    }
    nextAcActivationDelaySeconds = null;
    nextCoolingStepAccumulatorSeconds = 0;
  }

  // -------------------------------------------------------------
  // Priority 4: Quiet Mode Override & Priority 5: Auto Fan Control
  // -------------------------------------------------------------
  if (!isUnderAcCoolingLock) {
    if (inputs.fanAutoMode) {
      let targetSpeed: FanSpeed = 'low';

      // Temperature demand evaluation
      if (nextIndoorTempC > inputs.coolingSetpointC + 3.0) {
        targetSpeed = 'high';
      } else if (nextIndoorTempC > inputs.coolingSetpointC + 0.8) {
        targetSpeed = 'medium';
      } else {
        targetSpeed = 'low';
      }

      // Quiet mode cap takes strict precedence
      if (inputs.quietMode && (targetSpeed === 'medium' || targetSpeed === 'high')) {
        const originalDemand = targetSpeed;
        targetSpeed = inputs.quietSpeedLimit; // Defaults to 'low'
        if (nextFanSpeed !== targetSpeed) {
          nextFanSpeed = targetSpeed;
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
      } else if (nextFanSpeed !== targetSpeed) {
        nextFanSpeed = targetSpeed;
        events.push({
          id: `evt-fan-auto-${inputs.simTimeMs}`,
          simTimeMs: inputs.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'FAN_STATE_CHANGED',
          oldSpeed: inputs.currentFanSpeed,
          newSpeed: targetSpeed,
          reason: `Auto Comfort algorithm selected "${targetSpeed}" to maintain operative comfort.`,
          summary: `Auto-selected fan speed: ${targetSpeed} (Indoor: ${nextIndoorTempC.toFixed(1)}°C)`,
          severity: 'info',
        });
      }

      // If fan was running, advance to target speed
      if (nextFanSpeed !== 'off') {
        nextFanSpeed = targetSpeed;
      }
    } else if (inputs.quietMode && (nextFanSpeed === 'medium' || nextFanSpeed === 'high')) {
      // Manual quiet mode clamp
      nextFanSpeed = inputs.quietSpeedLimit;
    }
  }

  return {
    nextFanSpeed,
    nextCompressorState,
    nextVacancyTimerSeconds,
    nextAcActivationDelaySeconds,
    nextCoolingStepAccumulatorSeconds,
    nextIndoorTempC,
    nextCoolerEnabled,
    humidityProtectionTriggered,
    events,
  };
}
