import { FanSpeed, CompressorState, CoolingType } from '@/domain/types';
import { stepIndoorTemperature } from './thermal-model';
import { calculateComfortScore } from './comfort';
import { evaluateSmartHomeRules } from './control-rules';
import { calculatePowerWatts, integrateEnergyStep } from './energy-model';

export interface EnergyLabConfig {
  durationMinutes: number;
  initialIndoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  occupancySchedule: 'always-present' | 'vacates-at-30m';
  coolingType: CoolingType;
  baselineSetpointC: number;
  baselineFanSpeed: FanSpeed;
  smartAirSetpointC: number;
}

export interface EnergyLabStepPoint {
  minute: number;
  simTimeSeconds: number;
  outdoorTempC: number;

  // Conventional Baseline Strategy
  baselineIndoorTempC: number;
  baselineFanSpeed: FanSpeed;
  baselineCompressorState: CompressorState;
  baselineComfortScore: number;
  baselinePowerWatts: number;
  baselineCumulativeKWh: number;

  // SmartAir Strategy
  smartAirIndoorTempC: number;
  smartAirFanSpeed: FanSpeed;
  smartAirCompressorState: CompressorState;
  smartAirComfortScore: number;
  smartAirPowerWatts: number;
  smartAirCumulativeKWh: number;
}

export interface EnergyLabRunResult {
  points: EnergyLabStepPoint[];
  totalBaselineKWh: number;
  totalSmartAirKWh: number;
  absoluteDiffKWh: number;
  savingsPercentage: number;
  avgBaselineComfort: number;
  avgSmartAirComfort: number;
}

export function runEnergyLabBenchmark(config: EnergyLabConfig): EnergyLabRunResult {
  const points: EnergyLabStepPoint[] = [];
  const stepSeconds = 60; // 1-minute discrete time steps
  const stepHours = stepSeconds / 3600;
  const totalSteps = config.durationMinutes;

  // Stream A: Conventional Baseline State
  let bIndoorTemp = config.initialIndoorTempC;
  let bCompressor: CompressorState = 'cooling';
  let bCumulativeKWh = 0;

  // Stream B: SmartAir State
  let sIndoorTemp = config.initialIndoorTempC;
  let sFanSpeed: FanSpeed = 'low';
  let sCompressor: CompressorState = 'resting';
  let sVacancyTimer: number | null = null;
  let sCumulativeKWh = 0;

  let sumBaselineComfort = 0;
  let sumSmartAirComfort = 0;

  for (let m = 0; m <= totalSteps; m++) {
    const simTimeMs = m * 60 * 1000;
    const isOccupied = config.occupancySchedule === 'always-present' || m < 30;
    const occupancyState = isOccupied ? 'present' : 'absent';

    // 1. Evaluate Conventional Baseline
    // Simple thermostat: cooling if > baselineSetpoint + 0.5C, resting if < baselineSetpoint - 0.5C
    if (bIndoorTemp >= config.baselineSetpointC + 0.5) {
      bCompressor = 'cooling';
    } else if (bIndoorTemp <= config.baselineSetpointC - 0.5) {
      bCompressor = 'resting';
    }
    const bPower = calculatePowerWatts(config.baselineFanSpeed, bCompressor, true);
    if (m > 0) {
      bCumulativeKWh += integrateEnergyStep(bPower.totalWatts, stepHours);
      bIndoorTemp = stepIndoorTemperature(
        bIndoorTemp,
        config.outdoorTempC,
        true,
        config.coolingType,
        bCompressor,
        config.baselineSetpointC,
        stepHours,
      );
    }
    const bComfort = calculateComfortScore(bIndoorTemp, config.relativeHumidityPct, config.baselineFanSpeed);

    // 2. Evaluate SmartAir Strategy
    const smartAirRules = evaluateSmartHomeRules({
      simTimeMs,
      indoorTempC: sIndoorTemp,
      relativeHumidityPct: config.relativeHumidityPct,
      occupancy: occupancyState,
      currentVacancyTimerSeconds: sVacancyTimer,
      fanAutoMode: true,
      quietMode: false,
      quietSpeedLimit: 'low',
      currentFanSpeed: sFanSpeed,
      coolingEnabled: true,
      coolingType: config.coolingType,
      coolingSetpointC: config.smartAirSetpointC,
      currentCompressorState: sCompressor,
      vacancyDelaySeconds: 60,
      deltaSimSeconds: stepSeconds,
    });

    sFanSpeed = smartAirRules.nextFanSpeed;
    sCompressor = smartAirRules.nextCompressorState;
    sVacancyTimer = smartAirRules.nextVacancyTimerSeconds;

    const sPower = calculatePowerWatts(sFanSpeed, sCompressor, true);
    if (m > 0) {
      sCumulativeKWh += integrateEnergyStep(sPower.totalWatts, stepHours);
      sIndoorTemp = stepIndoorTemperature(
        sIndoorTemp,
        config.outdoorTempC,
        true,
        config.coolingType,
        sCompressor,
        config.smartAirSetpointC,
        stepHours,
      );
    }
    const sComfort = calculateComfortScore(sIndoorTemp, config.relativeHumidityPct, sFanSpeed);

    sumBaselineComfort += bComfort.score;
    sumSmartAirComfort += sComfort.score;

    points.push({
      minute: m,
      simTimeSeconds: m * 60,
      outdoorTempC: config.outdoorTempC,
      baselineIndoorTempC: Math.round(bIndoorTemp * 10) / 10,
      baselineFanSpeed: config.baselineFanSpeed,
      baselineCompressorState: bCompressor,
      baselineComfortScore: bComfort.score,
      baselinePowerWatts: bPower.totalWatts,
      baselineCumulativeKWh: Math.round(bCumulativeKWh * 1000) / 1000,
      smartAirIndoorTempC: Math.round(sIndoorTemp * 10) / 10,
      smartAirFanSpeed: sFanSpeed,
      smartAirCompressorState: sCompressor,
      smartAirComfortScore: sComfort.score,
      smartAirPowerWatts: sPower.totalWatts,
      smartAirCumulativeKWh: Math.round(sCumulativeKWh * 1000) / 1000,
    });
  }

  const absoluteDiffKWh = Math.round((bCumulativeKWh - sCumulativeKWh) * 1000) / 1000;
  const savingsPercentage =
    bCumulativeKWh > 0.001
      ? Math.round(((bCumulativeKWh - sCumulativeKWh) / bCumulativeKWh) * 1000) / 10
      : 0;

  return {
    points,
    totalBaselineKWh: Math.round(bCumulativeKWh * 1000) / 1000,
    totalSmartAirKWh: Math.round(sCumulativeKWh * 1000) / 1000,
    absoluteDiffKWh,
    savingsPercentage,
    avgBaselineComfort: Math.round(sumBaselineComfort / (totalSteps + 1)),
    avgSmartAirComfort: Math.round(sumSmartAirComfort / (totalSteps + 1)),
  };
}
