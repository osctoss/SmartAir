import { FanSpeed } from '@/domain/types';
import { COMFORT_LIMITS } from '@/domain/constants';

export interface ComfortScoreBreakdown {
  score: number;
  operativeTempC: number;
  fanCoolingOffsetC: number;
  tempPenalty: number;
  humidityPenalty: number;
  ratingLabel: 'Optimal' | 'Comfortable' | 'Warm' | 'Uncomfortable' | 'Poor';
}

/**
 * Calculates a bounded (0-100) illustrative comfort index based on operative temperature,
 * fan air velocity offset, and relative humidity.
 *
 * NOTE: Illustrative software model for simulation purposes; not a certified clinical or ASHRAE comfort index.
 */
export function calculateComfortScore(
  indoorTempC: number,
  relativeHumidityPct: number,
  fanSpeed: FanSpeed,
): ComfortScoreBreakdown {
  // 1. Fan perceived air velocity cooling offset
  const fanCoolingOffsetC = COMFORT_LIMITS.FAN_PERCEIVED_COOLING_OFFSET[fanSpeed];

  // Perceived Operative Temperature = Indoor Air Temp - Fan Airflow Benefit
  const operativeTempC = indoorTempC - fanCoolingOffsetC;

  // 2. Temperature deviation penalty from ideal (24°C - 26°C)
  let tempPenalty = 0;
  if (operativeTempC < COMFORT_LIMITS.OPTIMAL_MIN_TEMP) {
    tempPenalty = (COMFORT_LIMITS.OPTIMAL_MIN_TEMP - operativeTempC) * 8;
  } else if (operativeTempC > COMFORT_LIMITS.OPTIMAL_MAX_TEMP) {
    tempPenalty = (operativeTempC - COMFORT_LIMITS.OPTIMAL_MAX_TEMP) * 11;
  }

  // 3. Humidity penalty (ideal 40% - 60%)
  let humidityPenalty = 0;
  if (relativeHumidityPct > COMFORT_LIMITS.OPTIMAL_MAX_HUMIDITY) {
    humidityPenalty = (relativeHumidityPct - COMFORT_LIMITS.OPTIMAL_MAX_HUMIDITY) * 0.75;
  } else if (relativeHumidityPct < COMFORT_LIMITS.OPTIMAL_MIN_HUMIDITY) {
    humidityPenalty = (COMFORT_LIMITS.OPTIMAL_MIN_HUMIDITY - relativeHumidityPct) * 0.45;
  }

  // 4. Compute composite score bounded 0 - 100
  const rawScore = 100 - tempPenalty - humidityPenalty;
  const score = Math.round(Math.min(Math.max(rawScore, 0), 100));

  let ratingLabel: ComfortScoreBreakdown['ratingLabel'] = 'Comfortable';
  if (score >= 85) ratingLabel = 'Optimal';
  else if (score >= 70) ratingLabel = 'Comfortable';
  else if (score >= 50) ratingLabel = 'Warm';
  else if (score >= 30) ratingLabel = 'Uncomfortable';
  else ratingLabel = 'Poor';

  return {
    score,
    operativeTempC: Math.round(operativeTempC * 10) / 10,
    fanCoolingOffsetC,
    tempPenalty: Math.round(tempPenalty * 10) / 10,
    humidityPenalty: Math.round(humidityPenalty * 10) / 10,
    ratingLabel,
  };
}
