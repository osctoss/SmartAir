import { describe, it, expect } from 'vitest';
import { stepIndoorTemperature } from '@/simulation/smart-home/thermal-model';

describe('Thermal Model (Physics Engine)', () => {
  it('does NOT subtract physical temperature degrees via fan airflow alone', () => {
    // Airflow cools human skin via convective heat transfer, but does not remove sensible heat from the room air
    const indoorTemp = 30.0;
    const outdoorTemp = 30.0;
    const deltaHours = 0.5;

    // AC is off, only fan is running in room
    const resultWithoutAc = stepIndoorTemperature(
      indoorTemp,
      outdoorTemp,
      false, // cooling disabled
      'ac',
      'off',
      24,
      deltaHours,
    );

    // Temperature should remain unchanged when indoor equals outdoor and cooling is disabled
    expect(resultWithoutAc).toBeCloseTo(30.0, 1);
  });

  it('drops indoor temperature steadily when AC compressor is cooling', () => {
    const indoorTemp = 32.0;
    const outdoorTemp = 38.0;
    const targetSetpoint = 25.0;
    const deltaHours = 0.25; // 15 sim minutes

    const cooledTemp = stepIndoorTemperature(
      indoorTemp,
      outdoorTemp,
      true, // cooling enabled
      'ac',
      'cooling',
      targetSetpoint,
      deltaHours,
    );

    // Indoor temp should drop towards the target setpoint
    expect(cooledTemp).toBeLessThan(indoorTemp);
  });

  it('heats up indoor room through building envelope when outdoor is hotter and cooling is off', () => {
    const indoorTemp = 24.0;
    const outdoorTemp = 40.0;
    const deltaHours = 0.5;

    const warmedTemp = stepIndoorTemperature(
      indoorTemp,
      outdoorTemp,
      false,
      'ac',
      'off',
      24,
      deltaHours,
    );

    expect(warmedTemp).toBeGreaterThan(indoorTemp);
  });
});
