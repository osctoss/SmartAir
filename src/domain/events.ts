import { FanSpeed, CompressorState, PacketStatus } from './types';

export type DomainEventType =
  | 'ROOM_CREATED'
  | 'ROOM_UPDATED'
  | 'ROOM_ARCHIVED'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_PAUSED'
  | 'SIMULATION_RESET'
  | 'SENSOR_VALUE_CHANGED'
  | 'OCCUPANCY_CHANGED'
  | 'PERSON_ENTERED'
  | 'PERSON_LEFT'
  | 'FAN_STATE_CHANGED'
  | 'COOLING_STATE_CHANGED'
  | 'QUIET_MODE_TOGGLED'
  | 'VACANCY_TIMER_STARTED'
  | 'VACANCY_TIMER_CANCELLED'
  | 'FAN_AUTO_OFF'
  | 'AC_ACTIVATION_TIMER_STARTED'
  | 'AC_ACTIVATION_TIMER_CANCELLED'
  | 'AC_ACTIVATION_EVALUATED'
  | 'AC_COOLING_STEP'
  | 'FAN_SPEED_REDUCED_LOW_RPM'
  | 'COMPRESSOR_REST'
  | 'AC_REMOVED'
  | 'AC_INSTALLED'
  | 'COOLER_STATE_CHANGED'
  | 'HIGH_HUMIDITY_TRIGGERED'
  | 'HUMIDITY_RECOVERY_STARTED'
  | 'CARE_LOAD_PLACED'
  | 'CARE_LOAD_REMOVED'
  | 'CARE_THRESHOLD_CROSSED'
  | 'CARE_EVENT_CREATED'
  | 'RADIO_PACKET_SENT'
  | 'RADIO_PACKET_RECEIVED'
  | 'RADIO_PACKET_FAILED'
  | 'GATEWAY_PROCESSED_EVENT'
  | 'SIREN_ACTIVATED'
  | 'SIREN_SILENCED'
  | 'EVENT_ACKNOWLEDGED'
  | 'EVENT_RESOLVED'
  | 'SIMULATED_FAULT_TOGGLED';

export interface BaseDomainEvent {
  id: string;
  simTimeMs: number;
  timestampIso: string;
  type: DomainEventType;
  roomId?: string;
  deviceId?: string;
  summary: string;
  severity: 'info' | 'notice' | 'warning' | 'alert';
}

export interface FanStateChangedEvent extends BaseDomainEvent {
  type: 'FAN_STATE_CHANGED';
  oldSpeed: FanSpeed;
  newSpeed: FanSpeed;
  reason: string;
}

export interface CoolingStateChangedEvent extends BaseDomainEvent {
  type: 'COOLING_STATE_CHANGED';
  oldState: CompressorState;
  newState: CompressorState;
  indoorTemp: number;
  targetTemp: number;
}

export interface CareThresholdCrossedEvent extends BaseDomainEvent {
  type: 'CARE_THRESHOLD_CROSSED';
  loadKg: number;
  thresholdKg: number;
}

export interface RadioPacketEvent extends BaseDomainEvent {
  type: 'RADIO_PACKET_SENT' | 'RADIO_PACKET_RECEIVED' | 'RADIO_PACKET_FAILED';
  packetId: string;
  gatewayId: string;
  status: PacketStatus;
  failureReason?: string;
}

export interface SirenStateEvent extends BaseDomainEvent {
  type: 'SIREN_ACTIVATED' | 'SIREN_SILENCED';
  sirenId: string;
  scope: 'local' | 'shared';
}

export interface PersonLifecycleEvent extends BaseDomainEvent {
  type: 'PERSON_ENTERED' | 'PERSON_LEFT';
  occupancyCount?: number;
}

export type DomainEvent =
  | BaseDomainEvent
  | FanStateChangedEvent
  | CoolingStateChangedEvent
  | CareThresholdCrossedEvent
  | RadioPacketEvent
  | SirenStateEvent
  | PersonLifecycleEvent;
