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
  occupancyCount: number;
  vacancyTimerRemainingSeconds: number | null;
  acActivationDelayRemainingSeconds: number | null;
  coolingStepAccumulatorSeconds: number;

  // Actuator & device states
  fanSpeed: FanSpeed;
  fanAutoMode: boolean;
  quietMode: boolean;
  acInstalled: boolean;
  coolingEnabled: boolean;
  coolingSetpointC: number;
  compressorState: CompressorState;
  coolerInstalled: boolean;
  coolerEnabled: boolean;
  pcInstalled: boolean;
  highHumidityThresholdPct: number;
  humidityTrend: 'rising' | 'stable' | 'recovering';
  humidityProtectionTriggered: boolean;

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
    occupancyCount: number;
    loadKg: number;
  }>) => void;
  addPerson: () => void;
  removePerson: () => void;
  setOccupancyCount: (count: number) => void;
  setFanSpeed: (speed: FanSpeed) => void;
  setFanAutoMode: (auto: boolean) => void;
  setQuietMode: (quiet: boolean) => void;
  setCoolingEnabled: (enabled: boolean) => void;
  setCoolingSetpoint: (setpointC: number) => void;
  setCompressorState: (state: CompressorState) => void;
  removeAc: () => void;
  addAc: () => void;
  setCoolerInstalled: (installed: boolean) => void;
  setCoolerEnabled: (enabled: boolean) => void;
  setHighHumidityThreshold: (thresholdPct: number) => void;
  setPcInstalled: (installed: boolean) => void;
  setHumidityTrend: (trend: 'rising' | 'stable' | 'recovering') => void;
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
      occupancy: OccupancyState;
      occupancyCount: number;
      vacancyTimerRemainingSeconds: number | null;
      acActivationDelayRemainingSeconds: number | null;
      coolingStepAccumulatorSeconds: number;
      coolerEnabled: boolean;
      humidityProtectionTriggered: boolean;
      humidityTrend: 'rising' | 'stable' | 'recovering';
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
  occupancyCount: 1,
  vacancyTimerRemainingSeconds: null,
  acActivationDelayRemainingSeconds: null,
  coolingStepAccumulatorSeconds: 0,

  fanSpeed: 'off',
  fanAutoMode: true,
  quietMode: false,
  acInstalled: true,
  coolingEnabled: true,
  coolingSetpointC: SYSTEM_DEFAULTS.SMARTAIR_SETPOINT_C,
  compressorState: 'off',
  coolerInstalled: false,
  coolerEnabled: false,
  pcInstalled: true,
  highHumidityThresholdPct: SYSTEM_DEFAULTS.HIGH_HUMIDITY_THRESHOLD_PCT,
  humidityTrend: 'stable',
  humidityProtectionTriggered: false,

  comfortScore: 78,
  currentFanWatts: 0,
  currentCoolingWatts: 0,
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
    const isSmartHome = room.edition === 'smart-home';
    const acInstalled =
      room.config.acInstalled ?? (isSmartHome && (room.config.coolingConfig?.enabled !== false));
    const coolerInstalled =
      room.config.coolerInstalled ?? (room.config.coolerConfig !== undefined);
    const coolerEnabled = room.config.coolerConfig?.enabled ?? false;
    const highHumidityThresholdPct =
      room.config.coolerConfig?.highHumidityThresholdPct ??
      SYSTEM_DEFAULTS.HIGH_HUMIDITY_THRESHOLD_PCT;
    const pcInstalled = room.config.pcInstalled ?? isSmartHome;
    const initialOccupancy = room.config.occupancy ?? 'present';
    const initialOccupancyCount = initialOccupancy === 'present' ? 1 : 0;

    set({
      roomId: room.id,
      simTimeMs: 0,
      runState: 'idle',
      indoorTempC: room.config.initialIndoorTempC,
      outdoorTempC: room.config.outdoorTempC,
      relativeHumidityPct: room.config.relativeHumidityPct,
      occupancy: initialOccupancy,
      occupancyCount: initialOccupancyCount,
      vacancyTimerRemainingSeconds: null,
      acActivationDelayRemainingSeconds: null,
      coolingStepAccumulatorSeconds: 0,
      fanSpeed: 'off',
      fanAutoMode: room.config.fanConfig.autoMode,
      quietMode: room.config.fanConfig.quietMode,
      acInstalled,
      coolingEnabled: room.config.coolingConfig?.enabled ?? true,
      coolingSetpointC: room.config.coolingConfig?.setpointC ?? 26,
      compressorState: 'off',
      coolerInstalled,
      coolerEnabled,
      pcInstalled,
      highHumidityThresholdPct,
      humidityTrend: 'stable',
      humidityProtectionTriggered: false,
      currentFanWatts: 0,
      currentCoolingWatts: 0,
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

  addPerson: () =>
    set((state) => {
      const prevCount = state.occupancyCount;
      const nextCount = prevCount + 1;
      const isFirstPerson = prevCount === 0;

      let nextFanSpeed = state.fanSpeed;
      let nextDelay = state.acActivationDelayRemainingSeconds;
      const events: DomainEvent[] = [];

      if (isFirstPerson) {
        // First person enters unoccupied room:
        // 1. Immediately turn fan on at default operating speed if off
        if (nextFanSpeed === 'off') {
          nextFanSpeed = 'medium';
        }

        // 2. If room has AC, start 5-minute simulated delay
        if (state.acInstalled) {
          nextDelay = SYSTEM_DEFAULTS.AC_ACTIVATION_DELAY_SECONDS;
          events.push({
            id: `evt-ac-delay-start-${Date.now()}`,
            simTimeMs: state.simTimeMs,
            timestampIso: new Date().toISOString(),
            type: 'AC_ACTIVATION_TIMER_STARTED',
            summary: 'AC activation scheduled in 5 minutes.',
            severity: 'info',
          });
        }

        events.push({
          id: `evt-person-enter-${Date.now()}`,
          simTimeMs: state.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'PERSON_ENTERED',
          occupancyCount: nextCount,
          summary: 'Occupancy detected — fan switched ON.',
          severity: 'info',
        });
      } else {
        // Subsequent occupants entering: do NOT restart AC timer
        events.push({
          id: `evt-person-enter-${Date.now()}`,
          simTimeMs: state.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'PERSON_ENTERED',
          occupancyCount: nextCount,
          summary: `Person entered room. Occupancy: ${nextCount} persons present.`,
          severity: 'info',
        });
      }

      return {
        occupancyCount: nextCount,
        occupancy: 'present',
        vacancyTimerRemainingSeconds: null,
        fanSpeed: nextFanSpeed,
        currentFanWatts: DEFAULT_FAN_POWER_WATTS[nextFanSpeed],
        acActivationDelayRemainingSeconds: nextDelay,
        logs: [...events, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
      };
    }),

  removePerson: () =>
    set((state) => {
      if (state.occupancyCount <= 0) return state;

      const nextCount = state.occupancyCount - 1;
      const events: DomainEvent[] = [];

      if (nextCount === 0) {
        // Last person leaves:
        // 1. Turn OFF AC immediately if installed
        let nextCompressor = state.compressorState;
        let nextCoolWatts = state.currentCoolingWatts;

        if (state.acInstalled && state.compressorState !== 'off') {
          nextCompressor = 'off';
          nextCoolWatts = 0;
          events.push({
            id: `evt-ac-vac-off-${Date.now()}`,
            simTimeMs: state.simTimeMs,
            timestampIso: new Date().toISOString(),
            type: 'COOLING_STATE_CHANGED',
            oldState: state.compressorState,
            newState: 'off',
            summary: 'Room vacant — AC switched OFF.',
            severity: 'notice',
          });
        }

        // 2. Reduce fan to LOW immediately
        const nextFanSpeed = state.fanSpeed !== 'off' ? 'low' : 'off';
        const nextFanWatts = DEFAULT_FAN_POWER_WATTS[nextFanSpeed];

        events.push({
          id: `evt-person-left-vac-${Date.now()}`,
          simTimeMs: state.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'PERSON_LEFT',
          occupancyCount: 0,
          summary: 'Room vacant — AC switched OFF.',
          severity: 'notice',
        });

        // 3. Start 20-second vacancy countdown
        events.push({
          id: `evt-vac-countdown-${Date.now()}`,
          simTimeMs: state.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'VACANCY_TIMER_STARTED',
          summary: `Vacancy timer: ${SYSTEM_DEFAULTS.VACANCY_DELAY_SECONDS} seconds remaining.`,
          severity: 'notice',
        });

        return {
          occupancyCount: 0,
          occupancy: 'absent',
          compressorState: nextCompressor,
          currentCoolingWatts: nextCoolWatts,
          acActivationDelayRemainingSeconds: null,
          coolingStepAccumulatorSeconds: 0,
          fanSpeed: nextFanSpeed,
          currentFanWatts: nextFanWatts,
          vacancyTimerRemainingSeconds: SYSTEM_DEFAULTS.VACANCY_DELAY_SECONDS,
          logs: [...events, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
        };
      } else {
        events.push({
          id: `evt-person-left-${Date.now()}`,
          simTimeMs: state.simTimeMs,
          timestampIso: new Date().toISOString(),
          type: 'PERSON_LEFT',
          occupancyCount: nextCount,
          summary: `Person left room. Occupancy: ${nextCount} persons present.`,
          severity: 'info',
        });

        return {
          occupancyCount: nextCount,
          logs: [...events, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
        };
      }
    }),

  setOccupancyCount: (count: number) =>
    set((state) => {
      const sanitized = Math.max(0, Math.floor(count));
      if (sanitized === state.occupancyCount) return state;
      if (sanitized === 0) {
        return {
          ...state,
          occupancyCount: 0,
          occupancy: 'absent',
          compressorState: 'off',
          currentCoolingWatts: 0,
          acActivationDelayRemainingSeconds: null,
          coolingStepAccumulatorSeconds: 0,
          fanSpeed: state.fanSpeed !== 'off' ? 'low' : 'off',
          vacancyTimerRemainingSeconds: SYSTEM_DEFAULTS.VACANCY_DELAY_SECONDS,
        };
      } else {
        const wasEmpty = state.occupancyCount === 0;
        return {
          ...state,
          occupancyCount: sanitized,
          occupancy: 'present',
          vacancyTimerRemainingSeconds: null,
          fanSpeed: wasEmpty && state.fanSpeed === 'off' ? 'medium' : state.fanSpeed,
          acActivationDelayRemainingSeconds:
            wasEmpty && state.acInstalled
              ? SYSTEM_DEFAULTS.AC_ACTIVATION_DELAY_SECONDS
              : state.acActivationDelayRemainingSeconds,
        };
      }
    }),

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

  removeAc: () =>
    set((state) => {
      const event: DomainEvent = {
        id: `evt-ac-removed-${Date.now()}`,
        simTimeMs: state.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'AC_REMOVED',
        summary: 'AC removed — AC-specific automation disabled.',
        severity: 'warning',
      };
      return {
        acInstalled: false,
        compressorState: 'off',
        currentCoolingWatts: 0,
        acActivationDelayRemainingSeconds: null,
        coolingStepAccumulatorSeconds: 0,
        logs: [event, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
      };
    }),

  addAc: () =>
    set((state) => {
      const event: DomainEvent = {
        id: `evt-ac-installed-${Date.now()}`,
        simTimeMs: state.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'AC_INSTALLED',
        summary: 'AC installed — automatic cooling logic enabled.',
        severity: 'notice',
      };
      const delay =
        state.occupancyCount > 0 ? SYSTEM_DEFAULTS.AC_ACTIVATION_DELAY_SECONDS : null;
      return {
        acInstalled: true,
        coolingEnabled: true,
        coolingSetpointC: SYSTEM_DEFAULTS.SMARTAIR_SETPOINT_C,
        compressorState: 'off',
        currentCoolingWatts: 0,
        acActivationDelayRemainingSeconds: delay,
        logs: [event, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
      };
    }),

  setCoolerInstalled: (coolerInstalled) => set({ coolerInstalled }),

  setCoolerEnabled: (coolerEnabled) =>
    set((state) => {
      const event: DomainEvent = {
        id: `evt-cooler-${Date.now()}`,
        simTimeMs: state.simTimeMs,
        timestampIso: new Date().toISOString(),
        type: 'COOLER_STATE_CHANGED',
        summary: `Cooler switched ${coolerEnabled ? 'ON' : 'OFF'}.`,
        severity: 'info',
      };
      return {
        coolerEnabled,
        humidityTrend: coolerEnabled ? 'rising' : 'recovering',
        logs: [event, ...state.logs].slice(0, SYSTEM_DEFAULTS.MAX_LOG_ENTRIES),
      };
    }),

  setHighHumidityThreshold: (highHumidityThresholdPct) => set({ highHumidityThresholdPct }),
  setPcInstalled: (pcInstalled) => set({ pcInstalled }),
  setHumidityTrend: (humidityTrend) => set({ humidityTrend }),

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
      fanSpeed: 'off',
      compressorState: 'off',
      currentFanWatts: 0,
      currentCoolingWatts: 0,
      cumulativeFanKWh: 0,
      cumulativeCoolingKWh: 0,
      cumulativeTotalKWh: 0,
      vacancyTimerRemainingSeconds: null,
      acActivationDelayRemainingSeconds: null,
      coolingStepAccumulatorSeconds: 0,
      timeseries: [],
      careEventDetected: false,
    }),
}));

