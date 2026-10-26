export interface HumidityModelResult {
  nextRhPct: number;
  trend: 'rising' | 'stable' | 'recovering';
}

/**
 * Simplified, physically grounded relative humidity simulation.
 *
 * Rules:
 * 1. An evaporative cooler introduces water vapor while active (+RH).
 * 2. An active AC compressor condenses moisture down toward ~45% RH.
 * 3. When cooler/AC are off, humidity gradually approaches ambient outdoor equilibrium
 *    via natural air exchange: newHumidity = current + rate * (outdoorRh - current).
 * 4. Fan circulates air but does NOT dehumidify. Air cannot dry below outdoor equilibrium.
 * 5. Relative humidity is strictly clamped between 0% and 100%.
 */
export function stepRelativeHumidity(
  currentRhPct: number,
  outdoorRhPct: number,
  coolerActive: boolean,
  acActive: boolean,
  deltaSimHours: number,
  recoveryRatePerHour: number = 0.5,
): HumidityModelResult {
  if (deltaSimHours <= 0) {
    return { nextRhPct: currentRhPct, trend: 'stable' };
  }

  // 1. Evaporative Cooler Active: increases room humidity
  if (coolerActive) {
    const moistureAdditionRate = 25; // ~25% RH per hour when actively evaporating
    const nextRh = Math.min(100, currentRhPct + moistureAdditionRate * deltaSimHours);
    return {
      nextRhPct: Math.round(nextRh * 10) / 10,
      trend: 'rising',
    };
  }

  // 2. Air Conditioner Active: condenses water vapor down to comfort threshold (~45%)
  if (acActive) {
    if (currentRhPct > 45) {
      const dehumidificationRate = 12; // ~12% RH per hour
      const nextRh = Math.max(45, currentRhPct - dehumidificationRate * deltaSimHours);
      return {
        nextRhPct: Math.round(nextRh * 10) / 10,
        trend: 'recovering',
      };
    }
    return { nextRhPct: currentRhPct, trend: 'stable' };
  }

  // 3. Cooler and AC OFF: Natural air exchange toward ambient outdoor equilibrium
  const equilibriumRh = Math.min(100, Math.max(0, outdoorRhPct));
  const rhDelta = equilibriumRh - currentRhPct;

  if (Math.abs(rhDelta) < 0.2) {
    return { nextRhPct: currentRhPct, trend: 'stable' };
  }

  const recoveryStep = rhDelta * recoveryRatePerHour * deltaSimHours;
  let nextRh = currentRhPct + recoveryStep;

  // Never drop below equilibrium floor if outside air is more humid
  if (equilibriumRh >= currentRhPct && nextRh < currentRhPct) {
    nextRh = currentRhPct;
  }
  // Never drop below outdoor equilibrium merely because fan is on
  if (equilibriumRh <= currentRhPct && nextRh < equilibriumRh) {
    nextRh = equilibriumRh;
  }

  const clamped = Math.min(100, Math.max(0, Math.round(nextRh * 10) / 10));
  const trend = clamped > currentRhPct ? 'rising' : clamped < currentRhPct ? 'recovering' : 'stable';

  return { nextRhPct: clamped, trend };
}
