import { describe, it, expect } from 'vitest';
import {
  calculatePowerWatts,
  integrateEnergyStep,
  computeEnergyComparison,
} from '@/simulation/smart-home/energy-model';

describe('Energy Model & Integration Arithmetic', () => {
  it('calculates instantaneous power correctly from fan and compressor state', () => {
    // Fan high (45W) + AC cooling (1450W)
    const runningPower = calculatePowerWatts('high', 'cooling', true);
    expect(runningPower.fanWatts).toBe(45);
    expect(runningPower.coolingWatts).toBe(1450);
    expect(runningPower.totalWatts).toBe(1495);

    // AC disabled: coolingWatts should be 0
    const fanOnlyPower = calculatePowerWatts('medium', 'cooling', false);
    expect(fanOnlyPower.fanWatts).toBe(28);
    expect(fanOnlyPower.coolingWatts).toBe(0);
    expect(fanOnlyPower.totalWatts).toBe(28);
  });

  it('integrates watt-hours into kilowatt-hours accurately', () => {
    // 1000 Watts running for 1 hour = 1.0 kWh
    const oneKWh = integrateEnergyStep(1000, 1.0);
    expect(oneKWh).toBe(1.0);

    // 500 Watts running for 30 minutes (0.5 hour) = 0.25 kWh
    const quarterKWh = integrateEnergyStep(500, 0.5);
    expect(quarterKWh).toBe(0.25);

    // 0 Watts or 0 hours = 0 kWh
    expect(integrateEnergyStep(0, 5)).toBe(0);
    expect(integrateEnergyStep(1000, 0)).toBe(0);
  });

  it('safely handles zero-energy baseline without NaN or Infinity', () => {
    // Both baseline and smartAir consumed 0 kWh
    const resultZero = computeEnergyComparison(0, 0, 0, 0);
    expect(resultZero.baselineTotalKWh).toBe(0);
    expect(resultZero.smartAirTotalKWh).toBe(0);
    expect(resultZero.savingsPercentage).toBe(0);
    expect(Number.isNaN(resultZero.savingsPercentage)).toBe(false);
  });

  it('computes honest savings percentage dynamically based on integration', () => {
    // Baseline: 10 kWh, SmartAir: 7.5 kWh -> 25% savings
    const comparison = computeEnergyComparison(2.0, 8.0, 1.5, 6.0);
    expect(comparison.baselineTotalKWh).toBe(10.0);
    expect(comparison.smartAirTotalKWh).toBe(7.5);
    expect(comparison.absoluteDeltaKWh).toBe(2.5);
    expect(comparison.savingsPercentage).toBe(25.0);
  });
});
