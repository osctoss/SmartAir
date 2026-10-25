import { CompressorState, CoolingType } from '@/domain/types';

export interface ThermalParameters {
  heatTransferCoeff: number; // Wall/window drift rate (approx 0.15 degC / hour / degC delta)
  coolingCoeff: number;      // AC extraction rate (approx 4.5 degC / hour when active)
}

export const DEFAULT_THERMAL_PARAMS: ThermalParameters = {
  heatTransferCoeff: 0.25,
  coolingCoeff: 5.2,
};

/**
 * Pure discrete-time thermal model.
 *
 * Fundamental Rule:
 * Fan blade airflow induces air velocity and convective skin cooling which increases
 * perceived human comfort; it does NOT directly subtract degrees from ambient air temperature.
 * Temperature changes strictly via environmental exchange and active AC/cooler extraction.
 */
export function stepIndoorTemperature(
  currentIndoorTempC: number,
  outdoorTempC: number,
  coolingEnabled: boolean,
  coolingType: CoolingType,
  compressorState: CompressorState,
  setpointC: number,
  deltaSimHours: number,
  params: ThermalParameters = DEFAULT_THERMAL_PARAMS,
): number {
  if (deltaSimHours <= 0) return currentIndoorTempC;

  // 1. Natural Heat Ingress / Egress toward outdoor temperature
  const tempDeltaToOutdoor = outdoorTempC - currentIndoorTempC;
  const driftDelta = tempDeltaToOutdoor * params.heatTransferCoeff * deltaSimHours;

  // 2. Active Mechanical Cooling (AC or Evaporative Cooler)
  let coolingDelta = 0;
  if (coolingEnabled && compressorState === 'cooling' && currentIndoorTempC > setpointC) {
    const coolingStrength = coolingType === 'ac' ? params.coolingCoeff : params.coolingCoeff * 0.65;
    const tempDeltaToSetpoint = currentIndoorTempC - setpointC;
    coolingDelta = Math.min(tempDeltaToSetpoint, coolingStrength * deltaSimHours);
  }

  const nextIndoorTempC = currentIndoorTempC + driftDelta - coolingDelta;

  // Clamp within realistic room boundary
  return Math.min(Math.max(nextIndoorTempC, 12), 48);
}
