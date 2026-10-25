import { create } from 'zustand';
import {
  FanSpeed,
  CompressorState,
  OccupancyState,
  SimulationRunState,
  Room,
} from '@/domain/types';
import { DomainEvent } from '@/domain/events';
import { SYSTEM_DEFAULTS, DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';

export interface TimeseriesPoint {
  simTimeMs: number;
  simTimeSeconds: number;
  indoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  comfortScore: number;
  fanWatts: number;
  coolingWatts: number;
  totalWatts: number;
  cumulativeKWh: number;
  fanSpeed: FanSpeed;
  compressorState: CompressorState;
}

interface SimulationState {
  // Target Room
  roomId: string | null;

  // Clock
  simTimeMs: number;
  runState: SimulationRunState;
  speedMultiplier: 1 | 5 | 20;

  // Environmental inputs
  indoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  occupancy: OccupancyState;
  vacancyTimerRemainingSeconds: number | null;

  // Actuator states
  fanSpeed: FanSpeed;
  fanAutoMode: boolean;
  quietMode: boolean;
  coolingEnabled: boolean;
  coolingSetpointC: number;
  compressorState: CompressorState;

  // Energy & Comfort metrics
  comfortScore: number;
  currentFanWatts: number;
  currentCoolingWatts: number;
  cumulativeFanKWh: number;
  cumulativeCoolingKWh: number;
  cumulativeTotalKWh: number;

  // Smart Care live parameters
  loadKg: number;
  loadPlacedOnFan: boolean;
  careEventDetected: boolean;

  // Fault states
  radioFault: boolean;
  gatewayFault: boolean;
  sirenFault: boolean;
  localAlarmFault: boolean;

  // History buffers
  timeseries: TimeseriesPoint[];
  logs: DomainEvent[];

  // Actions
  initRoomSimulation: (room: Room) => void;
  setRunState: (runState: SimulationRunState) => void;
  setSpeedMultiplier: (speed: 1 | 5 | 20) => void;
  updateInputs: (inputs: Partial<{
    indoorTempC: number;
    outdoorTempC: number;
    relativeHumidityPct: number;
    occupancy: OccupancyState;
    loadKg: number;
  }>) => void;
  setFanSpeed: (speed: FanSpeed) => void;
  setFanAutoMode: (auto: boolean) => void;
  setQuietMode: (quiet: boolean) => void;
  setCoolingEnabled: (enabled: boolean) => void;
  setCoolingSetpoint: (setpointC: number) => void;
  setCompressorState: (state: CompressorState) => void;
  setVirtualLoadState: (loadKg: number, placed: boolean) => void;
  toggleFault: (fault: 'radio' | 'gateway' | 'siren' | 'localAlarm') => void;
  applySimulationStep: (
    nextValues: Partial<{
      simTimeMs: number;
      indoorTempC: number;
      outdoorTempC: number;
      relativeHumidityPct: number;
      comfortScore: number;
      fanSpeed: FanSpeed;
      compressorState: CompressorState;
      currentFanWatts: number;
      currentCoolingWatts: number;
      cumulativeFanKWh: number;
      cumulativeCoolingKWh: number;
      cumulativeTotalKWh: number;
      vacancyTimerRemainingSeconds: number | null;
      careEventDetected: boolean;
    }>,
    emittedEvents?: DomainEvent[],
  ) => void;
  addLogEntry: (event: DomainEvent) => void;
  clearLogs: () => void;
  resetSimulationState: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  roomId: null,
  simTimeMs: 0,
  runState: 'idle',
  speedMultiplier: 1,

  indoorTempC: SYSTEM_DEFAULTS.INDOOR_TEMP_C,
  outdoorTempC: SYSTEM_DEFAULTS.OUTDOOR_TEMP_C,
  relativeHumidityPct: SYSTEM_DEFAULTS.RELATIVE_HUMIDITY_PCT,
  occupancy: 'present',
  vacancyTimerRemainingSeconds: null,

  fanSpeed: 'low',
  fanAutoMode: true,
  quietMode: false,
  coolingEnabled: true,
  coolingSetpointC: SYSTEM_DEFAULTS.SMARTAIR_SETPOINT_C,
  compressorState: 'resting',

  comfortScore: 78,
  currentFanWatts: DEFAULT_FAN_POWER_WATTS.low,
  currentCoolingWatts: DEFAULT_AC_POWER_WATTS.resting,
  cumulativeFanKWh: 0,
  cumulativeCoolingKWh: 0,
  cumulativeTotalKWh: 0,

  loadKg: 0,
  loadPlacedOnFan: false,
  careEventDetected: false,

  radioFault: false,
  gatewayFault: false,
  sirenFault: false,
  localAlarmFault: false,

  timeseries: [],
  logs: [],

  initRoomSimulation: (room: Room) => {
    const isCare = room.edition === 'smart-care';
    const initialFanSpeed = room.config.fanConfig.speed || (isCare ? 'off' : 'low');
    const initialCompressor = room.config.coolingConfig?.compressorState || 'resting';

    set({
      roomId: room.id,
      simTimeMs: 0,
      runState: 'idle',
      indoorTempC: room.config.initialIndoorTempC,
      outdoorTempC: room.config.outdoorTempC,
      relativeHumidityPct: room.config.relativeHumidityPct,
      occupancy: room.config.occupancy,
      vacancyTimerRemainingSeconds: null,
      fanSpeed: initialFanSpeed,
      fanAutoMode: room.config.fanConfig.autoMode,
      quietMode: room.config.fanConfig.quietMode,
      coolingEnabled: room.config.coolingConfig?.enabled ?? false,
      coolingSetpointC: room.config.coolingConfig?.setpointC ?? 26,
      compressorState: initialCompressor,
      currentFanWatts: DEFAULT_FAN_POWER_WATTS[initialFanSpeed],
      currentCoolingWatts: DEFAULT_AC_POWER_WATTS[initialCompressor],
      cumulativeFanKWh: 0,
      cumulativeCoolingKWh: 0,
      cumulativeTotalKWh: 0,
      comfortScore: 78,
      loadKg: room.config.smartCareConfig?.loadKg ?? 0,
      loadPlacedOnFan: room.config.smartCareConfig?.loadPlacedOnFan ?? false,
      careEventDetected: false,
      radioFault: !(room.config.smartCareConfig?.radioOnline ?? true),
      gatewayFault: false,
      sirenFault: !(room.config.smartCareConfig?.sharedSirenEnabled ?? true),
      localAlarmFault: !(room.config.smartCareConfig?.localAlarmAvailable ?? true),
      timeseries: [],
      logs: [
        {
          id: `log-init-${Date.now()}`,
          simTimeMs: 0,
          timestampIso: new Date().toISOString(),
          type: 'SIMULATION_STARTED',
          roomId: room.id,
          deviceId: room.config.fanDeviceId,
          summary: `Simulation initialized for ${room.name} (${room.edition})`,
          severity: 'info',
        },
      ],
    });
  },

  setRunState: (runState) => set({ runState }),
  setSpeedMultiplier: (speedMultiplier) => set({ speedMultiplier }),

  updateInputs: (inputs) =>
    set((state) => ({
      ...state,
      ...inputs,
    })),

  setFanSpeed: (fanSpeed) =>
    set({
      fanSpeed,
      currentFanWatts: DEFAULT_FAN_POWER_WATTS[fanSpeed],
    }),

  setFanAutoMode: (fanAutoMode) => set({ fanAutoMode }),
  setQuietMode: (quietMode) => set({ quietMode }),
  setCoolingEnabled: (coolingEnabled) => set({ coolingEnabled }),
  setCoolingSetpoint: (coolingSetpointC) => set({ coolingSetpointC }),
  setCompressorState: (compressorState) =>
    set({
      compressorState,
      currentCoolingWatts: DEFAULT_AC_POWER_WATTS[compressorState],
    }),

  setVirtualLoadState: (loadKg, loadPlacedOnFan) =>
    set({
      loadKg,
      loadPlacedOnFan,
      careEventDetected: loadPlacedOnFan && loadKg > 10,
    }),

  toggleFault: (fault) =>
    set((state) => {
      switch (fault) {
        case 'radio':
          return { radioFault: !state.radioFault };
        case 'gateway':
          return { gatewayFault: !state.gatewayFault };
        case 'siren':
          return { sirenFault: !state.sirenFault };
        case 'localAlarm':
          return { localAlarmFault: !state.localAlarmFault };
      }
    }),

  applySimulationStep: (nextValues, emittedEvents = []) =>
    set((state) => {
      const nextSimMs = nextValues.simTimeMs ?? state.simTimeMs;
      const nextIndoor = nextValues.indoorTempC ?? state.indoorTempC;
      const nextOutdoor = nextValues.outdoorTempC ?? state.outdoorTempC;
      const nextRh = nextValues.relativeHumidityPct ?? state.relativeHumidityPct;
      const nextComfort = nextValues.comfortScore ?? state.comfortScore;
      const nextFanW = nextValues.currentFanWatts ?? state.currentFanWatts;
      const nextCoolW = nextValues.currentCoolingWatts ?? state.currentCoolingWatts;
      const nextTotalKWh = nextValues.cumulativeTotalKWh ?? state.cumulativeTotalKWh;
      const nextSpeed = nextValues.fanSpeed ?? state.fanSpeed;
      const nextCompressor = nextValues.compressorState ?? state.compressorState;

      // Append to bounded timeseries
      const newPoint: TimeseriesPoint = {
        simTimeMs: nextSimMs,
        simTimeSeconds: Math.floor(nextSimMs / 1000),
        indoorTempC: Math.round(nextIndoor * 10) / 10,
        outdoorTempC: Math.round(nextOutdoor * 10) / 10,
        relativeHumidityPct: Math.round(nextRh),
        comfortScore: Math.round(nextComfort),
        fanWatts: nextFanW,
        coolingWatts: nextCoolW,
        totalWatts: nextFanW + nextCoolW,
        cumulativeKWh: Math.round(nextTotalKWh * 1000) / 1000,
        fanSpeed: nextSpeed,
        compressorState: nextCompressor,
      };

      const updatedTimeseries = [...state.timeseries, newPoint].slice(
        -SYSTEM_DEFAULTS.MAX_TIMESERIES_POINTS,
      );
      const updatedLogs = [...emittedEvents, ...state.logs].slice(
        0,
        SYSTEM_DEFAULTS.MAX_LOG_ENTRIES,
      );

      return {
        ...state,
        ...nextValues,
        timeseries: updatedTimeseries,
        logs: updatedLogs,
      };
    }),

  addLogEntry: (event) =>
    set((state) => ({
      logs: [event, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
    })),

  clearLogs: () => set({ logs: [] }),

  resetSimulationState: () =>
    set({
      simTimeMs: 0,
      runState: 'idle',
      cumulativeFanKWh: 0,
      cumulativeCoolingKWh: 0,
      cumulativeTotalKWh: 0,
      vacancyTimerRemainingSeconds: null,
      timeseries: [],
      careEventDetected: false,
    }),
}));
