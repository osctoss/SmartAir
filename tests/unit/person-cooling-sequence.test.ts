import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateSmartHomeRules } from '@/simulation/smart-home/control-rules';
import { useSimulationStore } from '@/state/useSimulationStore';
import { Room } from '@/domain/types';
import { CoolingStateChangedEvent } from '@/domain/events';
import { DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';

describe('Person Entry, 5-Minute AC Delay & Cooling Progression (Requirements 1 & 4)', () => {
  const baseTestRoom: Room = {
    id: 'room-test-01',
    propertyId: 'prop-1',
    name: 'Master Suite 101',
    edition: 'smart-home',
    deviceIds: ['FAN-101', 'AC-101'],
    config: {
      initialIndoorTempC: 32,
      outdoorTempC: 38,
      relativeHumidityPct: 45,
      occupancy: 'absent',
      occupancyCount: 0,
      climateProfile: 'balanced',
      fanDeviceId: 'FAN-101',
      acInstalled: true,
      pcInstalled: true,
      fanConfig: {
        speed: 'off',
        autoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
      },
      coolingConfig: {
        type: 'ac',
        enabled: true,
        setpointC: 26,
        compressorState: 'off',
        powerWattsByState: { ...DEFAULT_AC_POWER_WATTS, off: 0, resting: 15, cooling: 1200 },
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useSimulationStore.getState().resetSimulationState();
    useSimulationStore.getState().initRoomSimulation(baseTestRoom);
    useSimulationStore.getState().setRunState('running');
  });

  describe('1.1 Occupancy & Person Lifecycle', () => {
    it('entering first person changes occupancy from 0 to 1 and turns fan ON immediately at default speed', () => {
      const store = useSimulationStore.getState();
      expect(store.occupancyCount).toBe(0);
      expect(store.occupancy).toBe('absent');
      expect(store.fanSpeed).toBe('off');

      // First person enters
      store.addPerson();

      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(1);
      expect(updated.occupancy).toBe('present');
      expect(updated.fanSpeed).toBe('medium');
      expect(updated.acActivationDelayRemainingSeconds).toBe(300); // 5 minutes

      const event = updated.logs.find((l) => l.type === 'PERSON_ENTERED');
      expect(event).toBeDefined();
      expect(event?.summary).toContain('Occupancy detected — fan switched ON');
    });

    it('adding a second person increments count to 2 but does NOT restart the 5-minute AC timer', () => {
      const store = useSimulationStore.getState();
      store.addPerson(); // 0 -> 1

      // Advance delay partially (e.g. 50 seconds elapsed, 250s left)
      store.applySimulationStep({ acActivationDelayRemainingSeconds: 250 });
      expect(useSimulationStore.getState().acActivationDelayRemainingSeconds).toBe(250);

      // Second person enters
      store.addPerson(); // 1 -> 2
      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(2);
      expect(updated.occupancy).toBe('present');
      // Delay MUST NOT have reset to 300!
      expect(updated.acActivationDelayRemainingSeconds).toBe(250);
    });

    it('removing one of several occupants does NOT initiate vacancy shutdown', () => {
      const store = useSimulationStore.getState();
      store.addPerson(); // 1
      store.addPerson(); // 2
      expect(useSimulationStore.getState().occupancyCount).toBe(2);

      store.removePerson(); // 2 -> 1
      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(1);
      expect(updated.occupancy).toBe('present');
      expect(updated.vacancyTimerRemainingSeconds).toBeNull();
      expect(updated.fanSpeed).not.toBe('off');
    });

    it('leaving before 5-minute AC activation finishes cancels the timer and shuts off empty room', () => {
      const store = useSimulationStore.getState();
      store.addPerson(); // 1 person, delay 300s
      expect(useSimulationStore.getState().acActivationDelayRemainingSeconds).toBe(300);

      // Person leaves before delay finishes
      store.removePerson(); // 1 -> 0
      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(0);
      expect(updated.occupancy).toBe('absent');
      expect(updated.acActivationDelayRemainingSeconds).toBeNull();
      expect(updated.fanSpeed).toBe('low'); // Reduced to low immediately
      expect(updated.vacancyTimerRemainingSeconds).toBe(20); // 20s countdown started
    });

    it('re-entering during the 20-second vacancy countdown cancels fan auto-off', () => {
      const store = useSimulationStore.getState();
      store.addPerson(); // 1
      store.removePerson(); // 0, vacancy countdown = 20s

      expect(useSimulationStore.getState().vacancyTimerRemainingSeconds).toBe(20);

      // Person re-enters at 12s remaining
      store.applySimulationStep({ vacancyTimerRemainingSeconds: 12 });
      store.addPerson(); // Re-entered!

      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(1);
      expect(updated.occupancy).toBe('present');
      expect(updated.vacancyTimerRemainingSeconds).toBeNull(); // Cancelled
      expect(updated.fanSpeed).not.toBe('off');
    });
  });

  describe('1.2 & 1.3 AC 5-Minute Activation & Exact Step-Cooling Sequence', () => {
    it('does not activate AC compressor before 5 minutes delay completes', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 1000,
        indoorTempC: 32,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: true,
        acActivationDelayRemainingSeconds: 150, // 2.5 minutes left
        coolingStepAccumulatorSeconds: 0,
        deltaSimSeconds: 1,
      });

      // Still counting down, compressor remains off
      expect(result.nextAcActivationDelaySeconds).toBe(149);
      expect(result.nextCompressorState).toBe('off');
    });

    it('when 5-minute delay reaches 0, logs outdoor evaluation and activates AC compressor', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 300000,
        indoorTempC: 32,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: true,
        acActivationDelayRemainingSeconds: 1, // 1 second left before expiry
        coolingStepAccumulatorSeconds: 0,
        deltaSimSeconds: 1,
        outdoorTempC: 38,
      });

      expect(result.nextAcActivationDelaySeconds).toBeNull();
      expect(result.nextCompressorState).toBe('cooling');

      // Outdoor assessment event
      const evalEvt = result.events.find((e) => e.type === 'AC_ACTIVATION_EVALUATED');
      expect(evalEvt).toBeDefined();
      expect(evalEvt?.summary).toContain('Outdoor temperature checked: 38°C; AC setpoint: 26°C');

      // Compressor ON event
      const compEvt = result.events.find(
        (e): e is CoolingStateChangedEvent => e.type === 'COOLING_STATE_CHANGED'
      );
      expect(compEvt).toBeDefined();
      expect(compEvt?.newState).toBe('cooling');
    });

    it('cools room temperature in exact 1°C per 5-second simulation steps', () => {
      // Starting at 30°C with compressor cooling
      let temp = 30;
      let accumulator = 0;

      for (let sec = 1; sec <= 5; sec++) {
        const step = evaluateSmartHomeRules({
          simTimeMs: sec * 1000,
          indoorTempC: temp,
          relativeHumidityPct: 45,
          occupancy: 'present',
          occupancyCount: 1,
          currentVacancyTimerSeconds: null,
          fanAutoMode: true,
          quietMode: false,
          quietSpeedLimit: 'low',
          currentFanSpeed: 'medium',
          coolingEnabled: true,
          coolingType: 'ac',
          coolingSetpointC: 26,
          currentCompressorState: 'cooling',
          acInstalled: true,
          acActivationDelayRemainingSeconds: null,
          coolingStepAccumulatorSeconds: accumulator,
          coolingStepSeconds: 5,
          deltaSimSeconds: 1,
        });

        temp = step.nextIndoorTempC;
        accumulator = step.nextCoolingStepAccumulatorSeconds;

        if (sec < 5) {
          expect(temp).toBe(30); // Not yet 5s
        } else {
          expect(temp).toBe(29); // Exactly 1°C drop at 5s!
          expect(accumulator).toBe(0);
        }
      }
    });

    it('switches fan to LOW RPM immediately when room reaches acSetpoint + 2°C (28°C)', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 10000,
        indoorTempC: 29, // 1 step away from 28°C
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26, // setpoint + 2 = 28°C
        currentCompressorState: 'cooling',
        acInstalled: true,
        acActivationDelayRemainingSeconds: null,
        coolingStepAccumulatorSeconds: 4, // Next second completes step
        coolingStepSeconds: 5,
        deltaSimSeconds: 1,
      });

      expect(result.nextIndoorTempC).toBe(28); // Reached 28°C
      expect(result.nextFanSpeed).toBe('low'); // Fan switches to LOW RPM immediately
      expect(result.nextCompressorState).toBe('cooling'); // Compressor continues cooling

      const lowRpmEvt = result.events.find((e) => e.type === 'FAN_SPEED_REDUCED_LOW_RPM');
      expect(lowRpmEvt).toBeDefined();
      expect(lowRpmEvt?.summary).toContain('Room reached 28°C — fan changed to LOW RPM');
    });

    it('turns OFF AC compressor immediately at setpoint (26°C) and keeps fan running at LOW RPM', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 20000,
        indoorTempC: 27, // 1 step away from setpoint
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'low',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'cooling',
        acInstalled: true,
        acActivationDelayRemainingSeconds: null,
        coolingStepAccumulatorSeconds: 4,
        coolingStepSeconds: 5,
        deltaSimSeconds: 1,
      });

      expect(result.nextIndoorTempC).toBe(26); // Reached setpoint
      expect(result.nextCompressorState).toBe('off'); // Compressor rest!
      expect(result.nextFanSpeed).toBe('low'); // Fan remains at low RPM while occupied

      const restEvt = result.events.find((e) => e.type === 'COMPRESSOR_REST');
      expect(restEvt).toBeDefined();
      expect(restEvt?.summary).toContain('Room reached AC setpoint — compressor switched OFF');
    });

    it('never decreases room temperature below setpoint through unguarded cooling steps', () => {
      // Room already at 26°C with setpoint 26°C
      const result = evaluateSmartHomeRules({
        simTimeMs: 30000,
        indoorTempC: 26,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'low',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'cooling',
        acInstalled: true,
        acActivationDelayRemainingSeconds: null,
        coolingStepAccumulatorSeconds: 10, // excessive time
        coolingStepSeconds: 5,
        deltaSimSeconds: 5,
      });

      // Must not fall to 25 or below
      expect(result.nextIndoorTempC).toBe(26);
      expect(result.nextCompressorState).toBe('off');
    });

    it('re-activates AC compressor from standby/off when indoor temperature exceeds setpoint + 0.5°C', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 40000,
        indoorTempC: 27.5, // 1.5°C above setpoint
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'low',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'off', // currently off after resting
        acInstalled: true,
        acActivationDelayRemainingSeconds: null, // delay already expired
        deltaSimSeconds: 1,
      });

      expect(result.nextCompressorState).toBe('cooling');
      const compEvt = result.events.find(
        (e): e is CoolingStateChangedEvent => e.type === 'COOLING_STATE_CHANGED'
      );
      expect(compEvt).toBeDefined();
      expect(compEvt?.newState).toBe('cooling');
    });

    it('immediately shuts down compressor and clears timers when cooling is disabled (Power OFF)', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 45000,
        indoorTempC: 29,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: false, // User turned AC OFF
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'cooling', // was active
        acInstalled: true,
        acActivationDelayRemainingSeconds: 120,
        coolingStepAccumulatorSeconds: 3,
        deltaSimSeconds: 1,
      });

      expect(result.nextCompressorState).toBe('off');
      expect(result.nextAcActivationDelaySeconds).toBeNull();
      expect(result.nextCoolingStepAccumulatorSeconds).toBe(0);
      const offEvt = result.events.find(
        (e): e is CoolingStateChangedEvent => e.type === 'COOLING_STATE_CHANGED'
      );
      expect(offEvt).toBeDefined();
      expect(offEvt?.newState).toBe('off');
    });

    it('correctly advances countdown and multi-step cooling over simulated 60-second jump (+1 Min)', () => {
      // 1. Advance 60s during 300s countdown
      const countdownStep = evaluateSmartHomeRules({
        simTimeMs: 60000,
        indoorTempC: 30,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: true,
        acActivationDelayRemainingSeconds: 300,
        deltaSimSeconds: 60, // +1 Min jump
      });

      expect(countdownStep.nextAcActivationDelaySeconds).toBe(240); // 4 minutes remaining
      expect(countdownStep.nextCompressorState).toBe('off');

      // 2. Active cooling over 60s: at 5s/degree, 30°C cools down to 26°C setpoint (4°C drop in 20s) and rests
      const coolingStep = evaluateSmartHomeRules({
        simTimeMs: 360000,
        indoorTempC: 30,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingType: 'ac',
        coolingSetpointC: 26,
        currentCompressorState: 'cooling',
        acInstalled: true,
        acActivationDelayRemainingSeconds: null,
        coolingStepAccumulatorSeconds: 0,
        deltaSimSeconds: 60,
      });

      expect(coolingStep.nextIndoorTempC).toBe(26);
      expect(coolingStep.nextCompressorState).toBe('off'); // Reached setpoint and rests
      expect(coolingStep.nextFanSpeed).toBe('low'); // Fan stays at low RPM
    });
  });

  describe('1.4 Strong Constraint: Simulator Running Guard (Inactivity when Paused/Idle)', () => {
    it('when simulator is paused or idle, adding a person updates presence but leaves fan OFF and delay null', () => {
      useSimulationStore.getState().setRunState('paused');
      const store = useSimulationStore.getState();
      store.addPerson();

      const updated = useSimulationStore.getState();
      expect(updated.occupancyCount).toBe(1);
      expect(updated.occupancy).toBe('present');
      expect(updated.fanSpeed).toBe('off');
      expect(updated.currentFanWatts).toBe(0);
      expect(updated.acActivationDelayRemainingSeconds).toBeNull();
    });

    it('clicking Run Sim immediately starts fan and schedules AC delay for already present occupants', () => {
      useSimulationStore.getState().setRunState('idle');
      useSimulationStore.getState().addPerson();
      expect(useSimulationStore.getState().fanSpeed).toBe('off');

      // User starts simulator
      useSimulationStore.getState().setRunState('running');
      const running = useSimulationStore.getState();
      expect(running.fanSpeed).toBe('medium');
      expect(running.currentFanWatts).toBe(28);
      expect(running.acActivationDelayRemainingSeconds).toBe(300);
    });

    it('when simulator is paused, virtual load does not trigger care event until simulator runs', () => {
      useSimulationStore.getState().setRunState('paused');
      useSimulationStore.getState().setVirtualLoadState(15, true);
      expect(useSimulationStore.getState().careEventDetected).toBe(false);

      useSimulationStore.getState().setRunState('running');
      expect(useSimulationStore.getState().careEventDetected).toBe(true);
    });
  });

  describe('Requirement 2: AC Removal Without Breaking Fan Logic', () => {
    it('removing AC sets acInstalled false, turns compressor off, cancels AC timers, and leaves fan functional', () => {
      const store = useSimulationStore.getState();
      store.addPerson(); // Occupied
      store.applySimulationStep({
        compressorState: 'cooling',
        currentCoolingWatts: 1200,
        acActivationDelayRemainingSeconds: 200,
      });

      // User removes AC
      store.removeAc();

      const after = useSimulationStore.getState();
      expect(after.acInstalled).toBe(false);
      expect(after.compressorState).toBe('off');
      expect(after.currentCoolingWatts).toBe(0);
      expect(after.acActivationDelayRemainingSeconds).toBeNull();
      expect(after.fanSpeed).toBe('medium'); // Fan still operating!

      // Rule evaluation on room without AC must never start AC logic
      const step = evaluateSmartHomeRules({
        simTimeMs: 5000,
        indoorTempC: 34,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: true,
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: false, // NO AC!
        deltaSimSeconds: 1,
      });

      expect(step.nextCompressorState).toBe('off');
      expect(step.nextAcActivationDelaySeconds).toBeNull();
      expect(step.nextFanSpeed).toBe('high'); // Standalone fan responds to 34°C demand!
    });
  });
});
