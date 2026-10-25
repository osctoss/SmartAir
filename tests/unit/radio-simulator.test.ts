import { describe, it, expect } from 'vitest';
import { processGatewayIngestion } from '@/simulation/smart-care/gateway-simulator';
import { evaluateSirenActivation } from '@/simulation/smart-care/siren-simulator';
import { Gateway, Room, SimulatedRadioPacket } from '@/domain/types';
import { DEFAULT_FAN_POWER_WATTS } from '@/domain/constants';

describe('Radio, Gateway Ingestion & Siren Output Logic (Phase 10)', () => {
  const mockGateway: Gateway = {
    id: 'gw-test-01',
    propertyId: 'prop-1',
    name: 'Test Gateway',
    status: 'online',
    radioAvailable: true,
    sharedSirenId: 'siren-1',
    sharedSirenAvailable: true,
    createdAt: new Date().toISOString(),
  };

  const mockRoom: Room = {
    id: 'room-care-a204',
    propertyId: 'prop-1',
    name: 'Room A-204',
    block: 'Block A',
    floor: '2nd Floor',
    edition: 'smart-care',
    deviceIds: ['SA-CARE-A204'],
    config: {
      initialIndoorTempC: 28,
      outdoorTempC: 38,
      relativeHumidityPct: 45,
      occupancy: 'present',
      occupancyCount: 1,
      climateProfile: 'balanced',
      fanDeviceId: 'SA-CARE-A204',
      fanConfig: {
        speed: 'off',
        autoMode: false,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPacket: SimulatedRadioPacket = {
    packetId: 'PKT-1001',
    eventId: 'EVT-1001',
    sourceDeviceId: 'SA-CARE-A204',
    sourceRoomId: 'room-care-a204',
    destinationGatewayId: 'gw-test-01',
    eventType: 'abnormal-load',
    createdAtSimMs: 1000,
    status: 'transmitting',
    simulatedLatencyMs: 750,
  };

  it('successfully processes gateway packet and resolves room location', () => {
    const res = processGatewayIngestion(mockPacket, [mockGateway], [mockRoom]);
    expect(res.isSuccess).toBe(true);
    expect(res.resolvedRoom?.id).toBe('room-care-a204');
    expect(res.resolvedGateway?.id).toBe('gw-test-01');
    expect(res.logSummary).toContain('Room A-204');
  });

  it('rejects packet if destination gateway is offline', () => {
    const offlineGateway: Gateway = { ...mockGateway, status: 'offline' };
    const res = processGatewayIngestion(mockPacket, [offlineGateway], [mockRoom]);
    expect(res.isSuccess).toBe(false);
    expect(res.failureReason).toBe('gateway-offline');
  });

  it('rejects packet if destination gateway is unknown in registry', () => {
    const res = processGatewayIngestion(
      { ...mockPacket, destinationGatewayId: 'non-existent-gw' },
      [mockGateway],
      [mockRoom],
    );
    expect(res.isSuccess).toBe(false);
    expect(res.failureReason).toBe('unknown-gateway');
  });

  it('evaluates siren activation conditions correctly', () => {
    // Normal success
    const normalSiren = evaluateSirenActivation(true, true, true);
    expect(normalSiren.canSound).toBe(true);
    expect(normalSiren.sirenState).toBe('sounding');

    // Siren output faulted
    const faultedSiren = evaluateSirenActivation(true, false, true);
    expect(faultedSiren.canSound).toBe(false);
    expect(faultedSiren.sirenState).toBe('unavailable');
    expect(faultedSiren.failureReason).toBe('siren-faulted');

    // Gateway never received packet -> siren should not sound
    const unreachedSiren = evaluateSirenActivation(false, true, true);
    expect(unreachedSiren.canSound).toBe(false);
    expect(unreachedSiren.sirenState).toBe('unavailable');
    expect(unreachedSiren.failureReason).toBe('gateway-unreached');
  });
});
