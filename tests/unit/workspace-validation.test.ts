import { describe, it, expect } from 'vitest';
import { generateRoomId, generateDeviceId, generateEventId } from '@/domain/ids';
import { validateWorkspace, RoomSchema } from '@/domain/schemas';
import { DEFAULT_FAN_POWER_WATTS } from '@/domain/constants';

describe('Domain Modeling & Schema Validation', () => {
  it('generates unique, well-formatted IDs', () => {
    const roomId1 = generateRoomId('Room 204');
    const roomId2 = generateRoomId('Room 204');
    expect(roomId1).toMatch(/^room-204-[a-z0-9]{4}$/);
    expect(roomId2).toMatch(/^room-204-[a-z0-9]{4}$/);
    expect(roomId1).not.toBe(roomId2);

    const devId = generateDeviceId('FAN', 'A204');
    expect(devId).toMatch(/^SA-FAN-A204-[A-Z0-9]{4}$/);

    const eventId = generateEventId();
    expect(eventId).toMatch(/^EVT-[A-Z0-9]+-[A-Z0-9]{4}$/);
  });

  it('validates a correct room model with Zod', () => {
    const validRoom = {
      id: 'room-101',
      propertyId: 'prop-1',
      name: 'Room 101',
      edition: 'smart-home',
      deviceIds: ['fan-101'],
      config: {
        initialIndoorTempC: 28,
        outdoorTempC: 38,
        relativeHumidityPct: 45,
        occupancy: 'present',
        occupancyCount: 1,
        climateProfile: 'balanced',
        fanDeviceId: 'fan-101',
        fanConfig: {
          speed: 'low',
          autoMode: true,
          quietMode: false,
          quietSpeedLimit: 'low',
          powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = RoomSchema.safeParse(validRoom);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid temperature or invalid numbers in room config', () => {
    const invalidRoom = {
      id: 'room-101',
      propertyId: 'prop-1',
      name: 'Room 101',
      edition: 'smart-home',
      deviceIds: ['fan-101'],
      config: {
        initialIndoorTempC: 150, // Exceeds max 60C
        outdoorTempC: 38,
        relativeHumidityPct: -5, // Invalid negative humidity
        occupancy: 'present',
        occupancyCount: 1,
        climateProfile: 'balanced',
        fanDeviceId: 'fan-101',
        fanConfig: {
          speed: 'low',
          autoMode: true,
          quietMode: false,
          quietSpeedLimit: 'low',
          powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = RoomSchema.safeParse(invalidRoom);
    expect(parsed.success).toBe(false);
  });

  it('detects dangling gateway foreign key references in workspace', () => {
    const corruptedWorkspace = {
      schemaVersion: 1,
      properties: [{ id: 'prop-demo', name: 'Demo Hostel', createdAt: new Date().toISOString() }],
      gateways: [{ id: 'gw-demo-1', propertyId: 'prop-demo', name: 'Gateway 1', status: 'online', radioAvailable: true, sharedSirenId: 'siren-1', sharedSirenAvailable: true, createdAt: new Date().toISOString() }],
      rooms: [
        {
          id: 'room-care-1',
          propertyId: 'prop-demo',
          name: 'Care Room 1',
          edition: 'smart-care',
          deviceIds: ['fan-care-1'],
          config: {
            initialIndoorTempC: 28,
            outdoorTempC: 38,
            relativeHumidityPct: 45,
            occupancy: 'present',
            occupancyCount: 1,
            climateProfile: 'balanced',
            fanDeviceId: 'fan-care-1',
            fanConfig: {
              speed: 'off',
              autoMode: false,
              quietMode: false,
              quietSpeedLimit: 'low',
              powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
            },
            smartCareConfig: {
              illustrativeThresholdKg: 10,
              loadKg: 0,
              loadPlacedOnFan: false,
              radioOnline: true,
              localAlarmEnabled: false,
              localAlarmAvailable: true,
              sharedSirenEnabled: true,
              assignedGatewayId: 'non-existent-gw-999', // Missing in gateways list
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      events: [],
      packets: [],
      settings: {
        defaultSimulationSpeed: 1,
        defaultVacancyDelaySeconds: 60,
        defaultSmartCareThresholdKg: 10,
        reduceMotion: false,
        theme: 'dark',
      },
    };

    expect(() => validateWorkspace(corruptedWorkspace)).toThrow(/non-existent-gw-999/);
  });
});
