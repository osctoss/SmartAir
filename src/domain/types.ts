/**
 * SmartAir Domain Types & Interfaces
 * Source of truth: PROJECT.md Section 8
 */

export type Edition = 'smart-home' | 'smart-care';
export type RoomStatus = 'ready' | 'running' | 'paused' | 'faulted' | 'offline';
export type DeviceHealth = 'ready' | 'degraded' | 'offline' | 'faulted';
export type FanSpeed = 'off' | 'low' | 'medium' | 'high';
export type OccupancyState = 'present' | 'absent';
export type ClimateProfile = 'balanced' | 'hot-dry' | 'hot-humid';
export type CoolingType = 'ac' | 'evaporative-cooler';
export type CompressorState = 'off' | 'cooling' | 'resting';

export type GatewayStatus = 'online' | 'offline';
export type SirenStatus = 'ready' | 'activating' | 'sounding' | 'silenced' | 'unavailable';

export type EventStatus = 'active' | 'acknowledged' | 'resolved';
export type EventStageStatus = 'pending' | 'in-progress' | 'success' | 'failed' | 'skipped';
export type PacketStatus = 'queued' | 'transmitting' | 'received' | 'failed';
export type SimulationRunState = 'idle' | 'running' | 'paused' | 'completed';

export interface Property {
  id: string;
  name: string;
  createdAt: string;
}

export interface FanConfig {
  speed: FanSpeed;
  autoMode: boolean;
  quietMode: boolean;
  quietSpeedLimit: FanSpeed;
  powerWattsBySpeed: Record<FanSpeed, number>;
}

export interface CoolingConfig {
  type: CoolingType;
  enabled: boolean;
  setpointC: number;
  compressorState: CompressorState;
  powerWattsByState: Record<CompressorState | 'off' | 'low' | 'medium' | 'high', number>;
}

export interface SmartCareConfig {
  illustrativeThresholdKg: number;
  loadKg: number;
  loadPlacedOnFan: boolean;
  radioOnline: boolean;
  localAlarmEnabled: boolean;
  localAlarmAvailable: boolean;
  sharedSirenEnabled: boolean;
  assignedGatewayId: string;
}

export interface RoomConfig {
  initialIndoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  occupancy: OccupancyState;
  occupancyCount: number;
  climateProfile: ClimateProfile;
  fanDeviceId: string;
  fanConfig: FanConfig;
  coolingConfig?: CoolingConfig;
  smartCareConfig?: SmartCareConfig;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  block?: string;
  floor?: string;
  notes?: string;
  edition: Edition;
  deviceIds: string[];
  gatewayId?: string;
  config: RoomConfig;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Gateway {
  id: string;
  propertyId: string;
  name: string;
  status: GatewayStatus;
  radioAvailable: boolean;
  sharedSirenId: string;
  sharedSirenAvailable: boolean;
  createdAt: string;
}

export interface EventStage {
  id: string;
  name: string;
  status: EventStageStatus;
  timestampSimMs?: number;
  detail?: string;
}

export interface EventAcknowledgement {
  acknowledgedAtSimMs: number;
  acknowledgedAtIso: string;
  acknowledgedByLabel: string;
}

export interface EventResolution {
  resolvedAtSimMs: number;
  resolvedAtIso: string;
  resolvedByLabel: string;
  note?: string;
}

export interface CareEvent {
  id: string;
  propertyId: string;
  roomId: string;
  deviceId: string;
  gatewayId?: string;
  type: 'abnormal-load';
  status: EventStatus;
  severityLabel: 'attention';
  virtualLoadKg: number;
  thresholdKg: number;
  createdAtSimMs: number;
  createdAtIso: string;
  stages: EventStage[];
  localAlarmStatus: EventStageStatus;
  radioStatus: EventStageStatus;
  gatewayStatus: EventStageStatus;
  sharedSirenStatus: EventStageStatus;
  acknowledgement?: EventAcknowledgement;
  resolution?: EventResolution;
  simulationOnly: true;
}

export interface SimulatedRadioPacket {
  packetId: string;
  eventId: string;
  sourceDeviceId: string;
  sourceRoomId: string;
  destinationGatewayId: string;
  eventType: 'abnormal-load';
  createdAtSimMs: number;
  transmittedAtSimMs?: number;
  receivedAtSimMs?: number;
  status: PacketStatus;
  failureReason?: 'radio-offline' | 'gateway-offline' | 'unknown-gateway' | 'corrupt-packet';
  simulatedLatencyMs: number;
}

export interface WorkspaceSettings {
  defaultSimulationSpeed: 1 | 5 | 20;
  defaultVacancyDelaySeconds: number;
  defaultSmartCareThresholdKg: number;
  reduceMotion: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface Workspace {
  schemaVersion: number;
  properties: Property[];
  rooms: Room[];
  gateways: Gateway[];
  events: CareEvent[];
  packets: SimulatedRadioPacket[];
  selectedRoomId?: string;
  settings: WorkspaceSettings;
}

export interface LiveRoomState {
  roomId: string;
  simTimeMs: number;
  runState: SimulationRunState;
  speedMultiplier: 1 | 5 | 20;
  indoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  occupancy: OccupancyState;
  vacancyTimerRemainingSeconds: number | null;
  fanSpeed: FanSpeed;
  fanAutoMode: boolean;
  quietMode: boolean;
  coolingEnabled: boolean;
  coolingSetpointC: number;
  compressorState: CompressorState;
  comfortScore: number;
  currentFanWatts: number;
  currentCoolingWatts: number;
  cumulativeFanKWh: number;
  cumulativeCoolingKWh: number;
  cumulativeTotalKWh: number;
  loadKg: number;
  loadPlacedOnFan: boolean;
  careEventDetected: boolean;
  localAlarmSounding: boolean;
}
