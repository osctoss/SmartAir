import { describe, it, expect } from 'vitest';
import { calculateComfortScore } from '@/simulation/smart-home/comfort';

describe('Comfort Model & Illustrative Index', () => {
  it('bounds comfort score between 0 and 100 under all conditions', () => {
    // Extreme heat and humidity
    const extremeHot = calculateComfortScore(50, 95, 'off');
    expect(extremeHot.score).toBeGreaterThanOrEqual(0);
    expect(extremeHot.score).toBeLessThanOrEqual(100);

    // Extreme cold
    const extremeCold = calculateComfortScore(5, 20, 'high');
    expect(extremeCold.score).toBeGreaterThanOrEqual(0);
    expect(extremeCold.score).toBeLessThanOrEqual(100);

    // Ideal thermal neutral conditions (~25°C, 50% RH)
    const ideal = calculateComfortScore(25, 50, 'low');
    expect(ideal.score).toBeGreaterThan(80);
    expect(ideal.score).toBeLessThanOrEqual(100);
  });

  it('penalizes comfort when relative humidity is uncomfortably high', () => {
    const temp = 29;
    const comfortableRh = calculateComfortScore(temp, 45, 'medium');
    const muggyRh = calculateComfortScore(temp, 85, 'medium');

    expect(muggyRh.score).toBeLessThan(comfortableRh.score);
  });

  it('increases perceived comfort at warm temperatures when fan speed increases', () => {
    const temp = 30;
    const rh = 60;

    const noFan = calculateComfortScore(temp, rh, 'off');
    const highFan = calculateComfortScore(temp, rh, 'high');

    expect(highFan.operativeTempC).toBeLessThan(noFan.operativeTempC);
    expect(highFan.score).toBeGreaterThan(noFan.score);
  });
});
