import { CareEvent, EventStage } from '@/domain/types';
import { generateEventId } from '@/domain/ids';

export interface LoadEvaluationParams {
  simTimeMs: number;
  currentLoadKg: number;
  thresholdKg: number;
  isPlacedOnFan: boolean;
  wasPreviouslyAboveThreshold: boolean;
  propertyId: string;
  roomId: string;
  fanDeviceId: string;
  assignedGatewayId?: string;
  localAlarmEnabled: boolean;
  localAlarmAvailable: boolean;
  radioOnline: boolean;
}

export interface LoadEvaluationResult {
  isEventTriggered: boolean;
  isNowAboveThreshold: boolean;
  careEvent: CareEvent | null;
  localAlarmActive: boolean;
  radioStatus: 'pending' | 'success' | 'failed' | 'skipped';
}

/**
 * Edge-triggered abnormal load detection.
 *
 * Rules:
 * 1. An event is generated ONLY when loadKg crosses from <= thresholdKg to > thresholdKg while placed on the fan.
 * 2. If load remains > thresholdKg on subsequent ticks, NO duplicate events are created.
 * 3. Removing the load or reducing it <= thresholdKg resets the latch to allow re-arming.
 */
export function evaluateLoadCrossing(params: LoadEvaluationParams): LoadEvaluationResult {
  const isCurrentlyAbove = params.isPlacedOnFan && params.currentLoadKg > params.thresholdKg;

  // Edge detection: Transition from FALSE to TRUE
  if (isCurrentlyAbove && !params.wasPreviouslyAboveThreshold) {
    const eventId = generateEventId();
    const nowIso = new Date().toISOString();

    const stages: EventStage[] = [
      {
        id: 'detection',
        name: 'Sensor Sensing & Validation',
        status: 'success',
        timestampSimMs: params.simTimeMs,
        detail: `Abnormal load of ${params.currentLoadKg} kg detected (exceeded ${params.thresholdKg} kg illustrative threshold).`,
      },
      {
        id: 'local-alarm',
        name: 'Local Room Alarm Output',
        status: params.localAlarmEnabled
          ? params.localAlarmAvailable
            ? 'success'
            : 'failed'
          : 'skipped',
        timestampSimMs: params.simTimeMs,
        detail: params.localAlarmEnabled
          ? params.localAlarmAvailable
            ? 'Local room buzzer activated immediately.'
            : 'Local buzzer output failed or unavailable.'
          : 'Local room alarm is disabled in room policy.',
      },
      {
        id: 'radio-transmission',
        name: 'Virtual Radio Transmission',
        status: params.radioOnline ? 'in-progress' : 'failed',
        timestampSimMs: params.simTimeMs,
        detail: params.radioOnline
          ? 'Radio message dispatched to gateway.'
          : 'Radio link faulted: local transmission failed.',
      },
      {
        id: 'gateway-processing',
        name: 'Gateway Ingestion & Registry Lookup',
        status: 'pending',
      },
      {
        id: 'shared-siren',
        name: 'Shared Building Siren Coordination',
        status: 'pending',
      },
      {
        id: 'acknowledgement',
        name: 'Operator Acknowledgement',
        status: 'pending',
      },
      {
        id: 'resolution',
        name: 'Operator Incident Resolution',
        status: 'pending',
      },
    ];

    const careEvent: CareEvent = {
      id: eventId,
      propertyId: params.propertyId,
      roomId: params.roomId,
      deviceId: params.fanDeviceId,
      gatewayId: params.assignedGatewayId,
      type: 'abnormal-load',
      status: 'active',
      severityLabel: 'attention',
      virtualLoadKg: params.currentLoadKg,
      thresholdKg: params.thresholdKg,
      createdAtSimMs: params.simTimeMs,
      createdAtIso: nowIso,
      stages,
      localAlarmStatus: params.localAlarmEnabled
        ? params.localAlarmAvailable
          ? 'success'
          : 'failed'
        : 'skipped',
      radioStatus: params.radioOnline ? 'in-progress' : 'failed',
      gatewayStatus: 'pending',
      sharedSirenStatus: 'pending',
      simulationOnly: true,
    };

    return {
      isEventTriggered: true,
      isNowAboveThreshold: true,
      careEvent,
      localAlarmActive: params.localAlarmEnabled && params.localAlarmAvailable,
      radioStatus: params.radioOnline ? 'success' : 'failed',
    };
  }

  // Not an edge transition (either remains above, or remains below/removed)
  return {
    isEventTriggered: false,
    isNowAboveThreshold: isCurrentlyAbove,
    careEvent: null,
    localAlarmActive: false,
    radioStatus: 'skipped',
  };
}
