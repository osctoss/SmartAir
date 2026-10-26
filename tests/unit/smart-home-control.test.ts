import { describe, it, expect } from 'vitest';
import { stepIndoorTemperature } from '@/simulation/smart-home/thermal-model';
import { calculateComfortScore } from '@/simulation/smart-home/comfort';
import { evaluateSmartHomeRules } from '@/simulation/smart-home/control-rules';
import {
  integrateEnergyStep,
  computeEnergyComparison,
} from '@/simulation/smart-home/energy-model';

describe('Smart Home Comfort & Energy Logic (Phase 7)', () => {
  it('integrates watt-hours to kWh correctly', () => {
    // 30 Watts for 1 hour = 0.03 kWh
    const energy = integrateEnergyStep(30, 1);
    expect(energy).toBeCloseTo(0.03, 5);

    // 1500 Watts for 30 minutes (0.5 hours) = 0.75 kWh
    const energyAc = integrateEnergyStep(1500, 0.5);
    expect(energyAc).toBeCloseTo(0.75, 5);
  });

  it('computes energy savings safely without dividing by zero', () => {
    const zeroBaseline = computeEnergyComparison(0, 0, 0, 0);
    expect(zeroBaseline.savingsPercentage).toBe(0);
    expect(Number.isFinite(zeroBaseline.savingsPercentage)).toBe(true);

    const typicalSavings = computeEnergyComparison(0.05, 1.2, 0.04, 0.9);
    // Baseline = 1.25, SmartAir = 0.94, delta = 0.31 => 24.8%
    expect(typicalSavings.savingsPercentage).toBeCloseTo(24.8, 1);
  });

  it('strict physical rule: fan speed does not directly lower air temperature', () => {
    // Stepping with fan running (cooling off)
    const initialTemp = 28.0;
    const outdoorTemp = 38.0;

    const nextTemp = stepIndoorTemperature(
      initialTemp,
      outdoorTemp,
      false, // cooling off
      'ac',
      'off',
      24,
      0.1, // 0.1 hours
    );

    // Temperature must drift toward outdoor temp (warmer), NOT drop because of the fan
    expect(nextTemp).toBeGreaterThan(initialTemp);
  });

  it('evaluates thermostat hysteresis avoiding rapid compressor switching', () => {
    // Setpoint 26°C. Band is [25.5°C, 26.5°C]
    // Indoor temp = 26.2°C (between 25.5 and 26.5), currently resting
    const inBandResting = evaluateSmartHomeRules({
      simTimeMs: 1000,
      indoorTempC: 26.2,
      relativeHumidityPct: 45,
      occupancy: 'present',
      currentVacancyTimerSeconds: null,
      fanAutoMode: true,
      quietMode: false,
      quietSpeedLimit: 'low',
      currentFanSpeed: 'low',
      coolingEnabled: true,
      coolingType: 'ac',
      coolingSetpointC: 26.0,
      currentCompressorState: 'resting',
      vacancyDelaySeconds: 60,
      deltaSimSeconds: 1,
    });

    // Should remain resting (has not crossed 26.5°C)
    expect(inBandResting.nextCompressorState).toBe('resting');

    // Crosses 26.6°C -> should trigger cooling
    const aboveBand = evaluateSmartHomeRules({
      simTimeMs: 2000,
      indoorTempC: 26.6,
      relativeHumidityPct: 45,
      occupancy: 'present',
      currentVacancyTimerSeconds: null,
      fanAutoMode: true,
      quietMode: false,
      quietSpeedLimit: 'low',
      currentFanSpeed: 'low',
      coolingEnabled: true,
      coolingType: 'ac',
      coolingSetpointC: 26.0,
      currentCompressorState: 'resting',
      vacancyDelaySeconds: 60,
      deltaSimSeconds: 1,
    });
    expect(aboveBand.nextCompressorState).toBe('cooling');
  });

  it('caps fan speed under Quiet Mode regardless of high demand', () => {
    const quietRun = evaluateSmartHomeRules({
      simTimeMs: 1000,
      indoorTempC: 32.0, // High demand temp!
      relativeHumidityPct: 60,
      occupancy: 'present',
      currentVacancyTimerSeconds: null,
      fanAutoMode: true,
      quietMode: true, // Quiet mode active!
      quietSpeedLimit: 'low',
      currentFanSpeed: 'off',
      coolingEnabled: true,
      coolingType: 'ac',
      coolingSetpointC: 26.0,
      currentCompressorState: 'cooling',
      vacancyDelaySeconds: 60,
      deltaSimSeconds: 1,
    });

    expect(quietRun.nextFanSpeed).toBe('low');
  });

  it('starts vacancy countdown and shuts fan off when timer expires', () => {
    // First tick with absent occupant -> starts 60s countdown
    const startTimer = evaluateSmartHomeRules({
      simTimeMs: 1000,
      indoorTempC: 28.0,
      relativeHumidityPct: 45,
      occupancy: 'absent',
      currentVacancyTimerSeconds: null,
      fanAutoMode: true,
      quietMode: false,
      quietSpeedLimit: 'low',
      currentFanSpeed: 'medium',
      coolingEnabled: true,
      coolingType: 'ac',
      coolingSetpointC: 26.0,
      currentCompressorState: 'resting',
      vacancyDelaySeconds: 60,
      deltaSimSeconds: 1,
    });
    expect(startTimer.nextVacancyTimerSeconds).toBe(60);
    expect(startTimer.nextFanSpeed).toBe('low');

    // Timer expires (0 seconds left) -> turns fan off
    const expireTimer = evaluateSmartHomeRules({
      simTimeMs: 61000,
      indoorTempC: 28.0,
      relativeHumidityPct: 45,
      occupancy: 'absent',
      currentVacancyTimerSeconds: 1,
      fanAutoMode: true,
      quietMode: false,
      quietSpeedLimit: 'low',
      currentFanSpeed: 'medium',
      coolingEnabled: true,
      coolingType: 'ac',
      coolingSetpointC: 26.0,
      currentCompressorState: 'resting',
      vacancyDelaySeconds: 60,
      deltaSimSeconds: 1,
    });
    expect(expireTimer.nextFanSpeed).toBe('off');
  });

  it('keeps comfort score strictly between 0 and 100 and applies offsets', () => {
    const optimal = calculateComfortScore(25.0, 45, 'low');
    expect(optimal.score).toBeGreaterThanOrEqual(85);

    const hotHumid = calculateComfortScore(38.0, 90, 'off');
    expect(hotHumid.score).toBeLessThan(30);
    expect(hotHumid.score).toBeGreaterThanOrEqual(0);

    // Turning on fan airflow increases comfort in responsive range
    const warmNoFan = calculateComfortScore(30.0, 65, 'off');
    const warmWithFan = calculateComfortScore(30.0, 65, 'high');
    expect(warmWithFan.score).toBeGreaterThan(warmNoFan.score);
  });
});
