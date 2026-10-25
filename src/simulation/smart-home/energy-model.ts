import { FanSpeed, CompressorState } from '@/domain/types';
import { DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';

export interface PowerReadings {
  fanWatts: number;
  coolingWatts: number;
  totalWatts: number;
}

export function calculatePowerWatts(
  fanSpeed: FanSpeed,
  compressorState: CompressorState,
  coolingEnabled: boolean,
  fanPowerTable = DEFAULT_FAN_POWER_WATTS,
  coolingPowerTable = DEFAULT_AC_POWER_WATTS,
): PowerReadings {
  const fanWatts = fanPowerTable[fanSpeed] || 0;
  const coolingWatts = coolingEnabled ? coolingPowerTable[compressorState] || 0 : 0;
  return {
    fanWatts,
    coolingWatts,
    totalWatts: fanWatts + coolingWatts,
  };
}

/**
 * Energy integration formula:
 * energyKWh += watts * elapsedHours / 1000
 */
export function integrateEnergyStep(
  powerWatts: number,
  deltaSimHours: number,
): number {
  if (deltaSimHours <= 0 || powerWatts <= 0) return 0;
  return (powerWatts * deltaSimHours) / 1000;
}

export interface EnergyComparisonResult {
  baselineFanKWh: number;
  baselineCoolingKWh: number;
  baselineTotalKWh: number;
  smartAirFanKWh: number;
  smartAirCoolingKWh: number;
  smartAirTotalKWh: number;
  absoluteDeltaKWh: number;
  savingsPercentage: number;
}

/**
 * Fair comparison calculation:
 * Strict rule: Never hardcode 12-18% into results; compute purely from integration.
 * Safe division prevents NaN or Infinity if baseline consumed 0 kWh.
 */
export function computeEnergyComparison(
  baselineFanKWh: number,
  baselineCoolingKWh: number,
  smartAirFanKWh: number,
  smartAirCoolingKWh: number,
): EnergyComparisonResult {
  const baselineTotalKWh = baselineFanKWh + baselineCoolingKWh;
  const smartAirTotalKWh = smartAirFanKWh + smartAirCoolingKWh;

  const absoluteDeltaKWh = baselineTotalKWh - smartAirTotalKWh;

  const savingsPercentage =
    baselineTotalKWh > 0.0001
      ? Math.round(((baselineTotalKWh - smartAirTotalKWh) / baselineTotalKWh) * 1000) / 10
      : 0;

  return {
    baselineFanKWh: Math.round(baselineFanKWh * 1000) / 1000,
    baselineCoolingKWh: Math.round(baselineCoolingKWh * 1000) / 1000,
    baselineTotalKWh: Math.round(baselineTotalKWh * 1000) / 1000,
    smartAirFanKWh: Math.round(smartAirFanKWh * 1000) / 1000,
    smartAirCoolingKWh: Math.round(smartAirCoolingKWh * 1000) / 1000,
    smartAirTotalKWh: Math.round(smartAirTotalKWh * 1000) / 1000,
    absoluteDeltaKWh: Math.round(absoluteDeltaKWh * 1000) / 1000,
    savingsPercentage,
  };
}
