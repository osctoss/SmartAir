import { CompressorState, CoolingType } from '@/domain/types';

export function stepRelativeHumidity(
  currentRhPct: number,
  outdoorRhPct: number,
  coolingEnabled: boolean,
  coolingType: CoolingType,
  compressorState: CompressorState,
  deltaSimHours: number,
): number {
  if (deltaSimHours <= 0) return currentRhPct;

  // Natural drift toward outdoor humidity
  const driftRate = 0.2;
  const drift = (outdoorRhPct - currentRhPct) * driftRate * deltaSimHours;

  // Active AC dehumidification or Cooler humidification
  let applianceEffect = 0;
  if (coolingEnabled && compressorState === 'cooling') {
    if (coolingType === 'ac') {
      // AC removes moisture toward ~45%
      if (currentRhPct > 45) {
        applianceEffect = -4.0 * deltaSimHours;
      }
    } else {
      // Evaporative cooler adds moisture
      if (currentRhPct < 75) {
        applianceEffect = 6.0 * deltaSimHours;
      }
    }
  }

  const nextRh = currentRhPct + drift + applianceEffect;
  return Math.min(Math.max(nextRh, 15), 95);
}
