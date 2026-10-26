import { FanSpeed, CompressorState } from './types';

export const SCHEMA_VERSION = 1;

export const DEFAULT_FAN_POWER_WATTS: Record<FanSpeed, number> = {
  off: 0,
  low: 12,
  medium: 28,
  high: 45,
};

export const DEFAULT_AC_POWER_WATTS: Record<CompressorState | 'off' | 'low' | 'medium' | 'high', number> = {
  off: 0,
  cooling: 1450,
  resting: 75,
  low: 75,
  medium: 800,
  high: 1450,
};

export const DEFAULT_COOLER_POWER_WATTS: Record<CompressorState | 'off' | 'low' | 'medium' | 'high', number> = {
  off: 0,
  cooling: 180,
  resting: 30,
  low: 90,
  medium: 140,
  high: 190,
};

export const SYSTEM_DEFAULTS = {
  INDOOR_TEMP_C: 28,
  OUTDOOR_TEMP_C: 38,
  RELATIVE_HUMIDITY_PCT: 45,
  CONVENTIONAL_SETPOINT_C: 24,
  SMARTAIR_SETPOINT_C: 26,
  HYSTERESIS_DELTA_C: 0.5,
  VACANCY_DELAY_SECONDS: 20,
  AC_ACTIVATION_DELAY_SECONDS: 300,
  AC_COOLING_STEP_SECONDS: 5,
  HIGH_HUMIDITY_THRESHOLD_PCT: 65,
  SMART_CARE_THRESHOLD_KG: 10,
  MAX_LOAD_KG: 50,
  PACKET_SIMULATED_LATENCY_MS: 750,
  MAX_TIMESERIES_POINTS: 1000,
  MAX_LOG_ENTRIES: 300,
};

export const COMFORT_LIMITS = {
  OPTIMAL_MIN_TEMP: 24,
  OPTIMAL_MAX_TEMP: 26.5,
  OPTIMAL_MIN_HUMIDITY: 35,
  OPTIMAL_MAX_HUMIDITY: 60,
  FAN_PERCEIVED_COOLING_OFFSET: {
    off: 0,
    low: 1.0,
    medium: 1.8,
    high: 2.5,
  },
};
