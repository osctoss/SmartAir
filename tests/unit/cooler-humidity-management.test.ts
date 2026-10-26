import { describe, it, expect } from 'vitest';
import { evaluateSmartHomeRules } from '@/simulation/smart-home/control-rules';
import { stepRelativeHumidity } from '@/simulation/smart-home/humidity-model';
import { createDemoWorkspace } from '@/services/demo-seed-service';

describe('Cooler, Humidity Protection & Edition Defaults (Requirements 3 & 5)', () => {
  describe('5.2 High-Humidity Cooler Protection', () => {
    it('when cooler is ON, humidity crosses threshold and fan is OFF: cooler switches OFF and fan switches ON immediately', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 1000,
        indoorTempC: 30,
        relativeHumidityPct: 68, // Above 65% threshold!
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: false,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'off', // Fan is OFF
        coolingEnabled: false,
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: false,
        coolerInstalled: true,
        coolerEnabled: true, // Cooler is ON
        highHumidityThresholdPct: 65,
        humidityProtectionTriggered: false,
        deltaSimSeconds: 1,
      });

      // Immediate protection response:
      expect(result.nextCoolerEnabled).toBe(false); // Cooler OFF immediately
      expect(result.nextFanSpeed).toBe('medium'); // Fan ON immediately
      expect(result.humidityProtectionTriggered).toBe(true);

      const alertEvt = result.events.find((e) => e.type === 'HIGH_HUMIDITY_TRIGGERED');
      expect(alertEvt).toBeDefined();
      expect(alertEvt?.summary).toContain('Humidity threshold exceeded (68%) — cooler switched OFF; fan switched ON');
    });

    it('when cooler is ON and humidity crosses threshold while fan is already ON: cooler switches OFF and fan remains ON', () => {
      const result = evaluateSmartHomeRules({
        simTimeMs: 2000,
        indoorTempC: 30,
        relativeHumidityPct: 70, // Exceeds 65%
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'high', // Fan is already ON
        coolingEnabled: false,
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: false,
        coolerInstalled: true,
        coolerEnabled: true,
        highHumidityThresholdPct: 65,
        humidityProtectionTriggered: false,
        deltaSimSeconds: 1,
      });

      expect(result.nextCoolerEnabled).toBe(false);
      expect(result.nextFanSpeed).toBe('high'); // Remains ON
      expect(result.humidityProtectionTriggered).toBe(true);
    });

    it('does not re-emit the threshold event on every subsequent step while humidity remains above threshold', () => {
      const subsequentStep = evaluateSmartHomeRules({
        simTimeMs: 3000,
        indoorTempC: 30,
        relativeHumidityPct: 70,
        occupancy: 'present',
        occupancyCount: 1,
        currentVacancyTimerSeconds: null,
        fanAutoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        currentFanSpeed: 'medium',
        coolingEnabled: false,
        coolingSetpointC: 26,
        currentCompressorState: 'off',
        acInstalled: false,
        coolerInstalled: true,
        coolerEnabled: false,
        highHumidityThresholdPct: 65,
        humidityProtectionTriggered: true, // Already triggered in prior step
        deltaSimSeconds: 1,
      });

      // Must not generate duplicate HIGH_HUMIDITY_TRIGGERED event
      const duplicateEvt = subsequentStep.events.find((e) => e.type === 'HIGH_HUMIDITY_TRIGGERED');
      expect(duplicateEvt).toBeUndefined();
    });
  });

  describe('5.3 Realistic Humidity Recovery Physics', () => {
    it('cooler ON increases relative humidity over time', () => {
      const initialRh = 45;
      const outdoorRh = 35;
      const deltaHours = 0.5; // 30 minutes

      const res = stepRelativeHumidity(
        initialRh,
        outdoorRh,
        true, // cooler active
        false, // ac active
        deltaHours,
      );

      // Humidity must increase
      expect(res.nextRhPct).toBeGreaterThan(initialRh);
      expect(res.trend).toBe('rising');
    });

    it('when cooler is OFF, humidity gradually recovers toward outdoor equilibrium', () => {
      const initialRh = 70;
      const outdoorRh = 40; // Drier outside
      const deltaHours = 1.0;

      const res = stepRelativeHumidity(
        initialRh,
        outdoorRh,
        false, // cooler OFF
        false, // ac OFF
        deltaHours,
      );

      // Must recover downward toward 40%
      expect(res.nextRhPct).toBeLessThan(initialRh);
      expect(res.nextRhPct).toBeGreaterThanOrEqual(outdoorRh);
      expect(res.trend).toBe('recovering');
    });

    it('fan does NOT dehumidify room: humidity never drops below outdoor equilibrium merely because fan is running', () => {
      const initialRh = 40;
      const outdoorRh = 40; // Same as room
      const deltaHours = 5.0; // 5 hours of continuous fan operation

      const res = stepRelativeHumidity(
        initialRh,
        outdoorRh,
        false,
        false,
        deltaHours,
      );

      // Must remain stable at equilibrium, NOT drop below 40%
      expect(res.nextRhPct).toBe(40);
      expect(res.trend).toBe('stable');
    });

    it('relative humidity is always clamped within valid 0–100% range', () => {
      const highRh = stepRelativeHumidity(98, 95, true, false, 10);
      expect(highRh.nextRhPct).toBeLessThanOrEqual(100);

      const lowRh = stepRelativeHumidity(5, 5, false, true, 10);
      expect(lowRh.nextRhPct).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Requirement 3: Edition-Specific Device Defaults', () => {
    it('Smart Home rooms include Fan, Wall AC, and PC by default', () => {
      const workspace = createDemoWorkspace();
      const smartHomeRoom = workspace.rooms.find((r) => r.edition === 'smart-home');

      expect(smartHomeRoom).toBeDefined();
      expect(smartHomeRoom?.config.acInstalled).toBe(true);
      expect(smartHomeRoom?.config.pcInstalled).toBe(true);
      expect(smartHomeRoom?.config.coolingConfig).toBeDefined();
      expect(smartHomeRoom?.config.coolerInstalled ?? false).toBe(false); // Cooler not installed by default
    });

    it('Smart Care rooms include Fan by default, but NEVER include AC by default', () => {
      const workspace = createDemoWorkspace();
      const smartCareRooms = workspace.rooms.filter((r) => r.edition === 'smart-care');

      expect(smartCareRooms.length).toBeGreaterThan(0);
      for (const room of smartCareRooms) {
        expect(room.config.acInstalled).toBe(false);
        expect(room.config.coolingConfig).toBeUndefined();
        expect(room.config.smartCareConfig).toBeDefined();
        expect(room.config.smartCareConfig?.illustrativeThresholdKg).toBe(10);
      }
    });
  });
});
