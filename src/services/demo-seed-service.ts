import { Workspace, Room, Gateway, Property } from '@/domain/types';
import { SCHEMA_VERSION, DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';

export function createDemoWorkspace(): Workspace {
  const now = new Date().toISOString();

  const property: Property = {
    id: 'prop-demo-hostel',
    name: 'SmartAir Demo Hostel',
    createdAt: now,
  };

  const gateway: Gateway = {
    id: 'gw-demo-01',
    propertyId: property.id,
    name: 'Hostel Main Gateway (GW-01)',
    status: 'online',
    radioAvailable: true,
    sharedSirenId: 'siren-demo-main',
    sharedSirenAvailable: true,
    createdAt: now,
  };

  const roomCareA204: Room = {
    id: 'room-care-a204',
    propertyId: property.id,
    name: 'Room A-204',
    block: 'Block A',
    floor: '2nd Floor',
    notes: 'Resident study room — virtual load monitoring enabled',
    edition: 'smart-care',
    deviceIds: ['SA-CARE-A204'],
    gatewayId: gateway.id,
    config: {
      initialIndoorTempC: 28,
      outdoorTempC: 38,
      relativeHumidityPct: 45,
      occupancy: 'present',
      occupancyCount: 1,
      climateProfile: 'balanced',
      fanDeviceId: 'SA-CARE-A204',
      fanConfig: {
        speed: 'low',
        autoMode: false,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
      },
      coolingConfig: {
        type: 'ac',
        enabled: true,
        setpointC: 24,
        compressorState: 'resting',
        powerWattsByState: DEFAULT_AC_POWER_WATTS,
      },
      smartCareConfig: {
        illustrativeThresholdKg: 10,
        loadKg: 0,
        loadPlacedOnFan: false,
        radioOnline: true,
        localAlarmEnabled: false,
        localAlarmAvailable: true,
        sharedSirenEnabled: true,
        assignedGatewayId: gateway.id,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  const roomCareB102: Room = {
    id: 'room-care-b102',
    propertyId: property.id,
    name: 'Room B-102',
    block: 'Block B',
    floor: '1st Floor',
    notes: 'Ground floor corner room',
    edition: 'smart-care',
    deviceIds: ['SA-CARE-B102'],
    gatewayId: gateway.id,
    config: {
      initialIndoorTempC: 27,
      outdoorTempC: 38,
      relativeHumidityPct: 50,
      occupancy: 'present',
      occupancyCount: 1,
      climateProfile: 'balanced',
      fanDeviceId: 'SA-CARE-B102',
      fanConfig: {
        speed: 'off',
        autoMode: false,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
      },
      coolingConfig: {
        type: 'ac',
        enabled: false,
        setpointC: 25,
        compressorState: 'off',
        powerWattsByState: DEFAULT_AC_POWER_WATTS,
      },
      smartCareConfig: {
        illustrativeThresholdKg: 10,
        loadKg: 0,
        loadPlacedOnFan: false,
        radioOnline: true,
        localAlarmEnabled: false,
        localAlarmAvailable: true,
        sharedSirenEnabled: true,
        assignedGatewayId: gateway.id,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  const roomHomeH301: Room = {
    id: 'room-home-h301',
    propertyId: property.id,
    name: 'Room H-301 (Comfort Suite)',
    block: 'North Wing',
    floor: '3rd Floor',
    notes: 'Hot afternoon comfort & energy scenario room',
    edition: 'smart-home',
    deviceIds: ['SA-HOME-H301'],
    config: {
      initialIndoorTempC: 29.5,
      outdoorTempC: 38,
      relativeHumidityPct: 45,
      occupancy: 'present',
      occupancyCount: 1,
      climateProfile: 'hot-dry',
      fanDeviceId: 'SA-HOME-H301',
      fanConfig: {
        speed: 'medium',
        autoMode: true,
        quietMode: false,
        quietSpeedLimit: 'low',
        powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
      },
      coolingConfig: {
        type: 'ac',
        enabled: true,
        setpointC: 26,
        compressorState: 'cooling',
        powerWattsByState: DEFAULT_AC_POWER_WATTS,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    properties: [property],
    gateways: [gateway],
    rooms: [roomCareA204, roomCareB102, roomHomeH301],
    events: [],
    packets: [],
    selectedRoomId: roomCareA204.id,
    settings: {
      defaultSimulationSpeed: 1,
      defaultVacancyDelaySeconds: 60,
      defaultSmartCareThresholdKg: 10,
      reduceMotion: false,
      theme: 'dark',
    },
  };
}
