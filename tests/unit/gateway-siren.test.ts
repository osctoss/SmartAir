import { describe, it, expect } from 'vitest';
import { processGatewayIngestion } from '@/simulation/smart-care/gateway-simulator';
import { evaluateSirenActivation } from '@/simulation/smart-care/siren-simulator';
import { Room, Gateway, SimulatedRadioPacket } from '@/domain/types';

describe('Gateway Processing & Building Siren Ingestion', () => {
  const dummyGateway: Gateway = {
    id: 'gw-01',
    propertyId: 'prop-01',
    name: 'Main Block Gateway',
    location: 'Floor 1 Server Room',
    status: 'online',
    lastHeartbeatIso: new Date().toISOString(),
  };

  const dummyRoom: Room = {
    id: 'room-101',
    propertyId: 'prop-01',
    name: 'Room 101',
    edition: 'smart-care',
    block: 'Block A',
    floor: 'Floor 1',
    createdAt: new Date().toISOString(),
    config: {
      initialIndoorTempC: 28,
      outdoorTempC: 35,
      relativeHumidityPct: 50,
      occupancy: 'present',
      fanDeviceId: 'dev-fan-101',
      fanConfig: {
        speed: 'off',
        autoMode: false,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: { off: 0, low: 6, medium: 15, high: 30 },
      },
      smartCareConfig: {
        illustrativeThresholdKg: 10,
        assignedGatewayId: 'gw-01',
        localAlarmEnabled: true,
        localAlarmAvailable: true,
        radioOnline: true,
        sharedSirenEnabled: true,
      },
    },
  };

  const dummyPacket: SimulatedRadioPacket = {
    packetId: 'pkt-test-01',
    eventId: 'evt-test-01',
    sourceDeviceId: 'dev-fan-101',
    sourceRoomId: 'room-101',
    destinationGatewayId: 'gw-01',
    eventType: 'abnormal-load',
    createdAtSimMs: 1000,
    status: 'transmitting',
    simulatedLatencyMs: 800,
  };

  it('successfully resolves room and location when gateway is online', () => {
    const result = processGatewayIngestion(dummyPacket, [dummyGateway], [dummyRoom]);

    expect(result.isSuccess).toBe(true);
    expect(result.resolvedRoom?.id).toBe('room-101');
    expect(result.resolvedGateway?.id).toBe('gw-01');
    expect(result.logSummary).toContain('Room 101');
  });

  it('rejects packet ingestion when destination gateway is offline', () => {
    const offlineGateway: Gateway = { ...dummyGateway, status: 'offline' };
    const result = processGatewayIngestion(dummyPacket, [offlineGateway], [dummyRoom]);

    expect(result.isSuccess).toBe(false);
    expect(result.failureReason).toBe('gateway-offline');
  });

  it('activates building siren ONLY when gateway succeeded and siren output is online', () => {
    // Healthy full path
    const healthySiren = evaluateSirenActivation(true, true, true);
    expect(healthySiren.canSound).toBe(true);
    expect(healthySiren.sirenState).toBe('sounding');

    // Gateway did not receive packet
    const noGateway = evaluateSirenActivation(false, true, true);
    expect(noGateway.canSound).toBe(false);
    expect(noGateway.sirenState).toBe('unavailable');
    expect(noGateway.failureReason).toBe('gateway-unreached');

    // Siren hardware output faulted
    const faultedSiren = evaluateSirenActivation(true, false, true);
    expect(faultedSiren.canSound).toBe(false);
    expect(faultedSiren.sirenState).toBe('unavailable');
    expect(faultedSiren.failureReason).toBe('siren-faulted');

    // Siren disabled by institutional policy
    const disabledSiren = evaluateSirenActivation(true, true, false);
    expect(disabledSiren.canSound).toBe(false);
    expect(disabledSiren.sirenState).toBe('silenced');
  });
});
