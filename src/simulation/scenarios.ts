import { Edition, OccupancyState } from '@/domain/types';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useUiStore } from '@/state/useUiStore';
import { evaluateLoadCrossing } from '@/simulation/smart-care/load-event';

export interface ScenarioDefinition {
  id: string;
  title: string;
  edition: Edition;
  badge: string;
  tagline: string;
  description: string;
  targetRoomType: string;
  appliedConditions: {
    outdoorTempC?: number;
    indoorTempC?: number;
    relativeHumidityPct?: number;
    occupancy?: OccupancyState;
    coolingSetpointC?: number;
    coolingEnabled?: boolean;
    fanAutoMode?: boolean;
    fanSpeed?: 'off' | 'low' | 'medium' | 'high';
    quietMode?: boolean;
    virtualLoadKg?: number;
    loadPlacedOnFan?: boolean;
    faults?: {
      radioOffline?: boolean;
      gatewayOffline?: boolean;
      sirenUnavailable?: boolean;
    };
  };
  expectedBehavior: string;
}

export const SIMULATION_SCENARIOS: ScenarioDefinition[] = [
  // --- Smart Home Presets ---
  {
    id: 'hostel-hot-afternoon',
    title: 'Hostel Room — Hot Afternoon',
    edition: 'smart-home',
    badge: 'Thermal Comfort',
    tagline: '38°C outdoor peak heat; BLDC auto-fan complements inverter AC set at 26°C.',
    description:
      'Simulates a hot summer afternoon in an Indian student hostel room. Outdoor temp reaches 38°C with starting indoor temp of 28°C. SmartAir auto-selects High fan speed to deliver 2.5°C convective cooling offset while maintaining an energy-efficient 26°C AC setpoint, avoiding power-hungry 21°C chilling.',
    targetRoomType: 'Smart Home with AC & Ceiling Fan',
    appliedConditions: {
      outdoorTempC: 38,
      indoorTempC: 28,
      relativeHumidityPct: 52,
      occupancy: 'present',
      coolingSetpointC: 26,
      coolingEnabled: true,
      fanAutoMode: true,
      fanSpeed: 'high',
      quietMode: false,
    },
    expectedBehavior:
      'BLDC fan runs at High (30W) providing convective airflow, AC cools steadily toward 26°C, comfort score stays above 80/100.',
  },
  {
    id: 'quiet-video-call',
    title: 'Quiet Video Call',
    edition: 'smart-home',
    badge: 'Acoustic Comfort',
    tagline: 'High cooling requirement with quiet mode ceiling cap on fan acoustic noise.',
    description:
      'Student or resident is attending an online lecture or video call. Despite 36°C outdoor heat, Quiet Mode restricts fan speed to Low to prevent wind hum and microphone buffeting, while inverter AC provides quiet thermal compensation.',
    targetRoomType: 'Smart Home with Quiet Mode',
    appliedConditions: {
      outdoorTempC: 36,
      indoorTempC: 27,
      relativeHumidityPct: 55,
      occupancy: 'present',
      coolingSetpointC: 24,
      coolingEnabled: true,
      fanAutoMode: true,
      fanSpeed: 'low',
      quietMode: true,
    },
    expectedBehavior:
      'Fan speed is capped at Low (6W) despite high cooling demand. Decision feed notes "Quiet mode speed limit applied".',
  },
  {
    id: 'room-vacated',
    title: 'Room Vacated — Auto-Off Countdown',
    edition: 'smart-home',
    badge: 'Vacancy Cutoff',
    tagline: 'Student leaves room; 60s auto-off countdown activates to prevent wasted power.',
    description:
      'Student hurriedly leaves the room for class, leaving the fan on High and AC on. The passive occupancy sensor transitions to vacant, arming a 60-second countdown. Once expired, fan and cooling automatically power down.',
    targetRoomType: 'Smart Home with PIR / Occupancy Sensor',
    appliedConditions: {
      outdoorTempC: 34,
      indoorTempC: 25,
      relativeHumidityPct: 50,
      occupancy: 'absent',
      coolingSetpointC: 24,
      coolingEnabled: true,
      fanAutoMode: false,
      fanSpeed: 'high',
      quietMode: false,
    },
    expectedBehavior:
      'Vacancy timer counts down from 60s. Upon zero, fan automatically switches to Off and AC disables.',
  },
  {
    id: 'hot-dry-cooler',
    title: 'Hot-Dry Evaporative Cooler Profile',
    edition: 'smart-home',
    badge: 'Evaporative Sync',
    tagline: '42°C dry outdoor heat; evaporative cooling combined with maximum ceiling airflow.',
    description:
      'Simulates northern Indian dry summer conditions (42°C, 20% RH). Highlights how ceiling fan circulation maximizes perceived cooling in arid environments.',
    targetRoomType: 'Smart Home (Dry Climate)',
    appliedConditions: {
      outdoorTempC: 42,
      indoorTempC: 31,
      relativeHumidityPct: 22,
      occupancy: 'present',
      coolingSetpointC: 27,
      coolingEnabled: true,
      fanAutoMode: true,
      fanSpeed: 'high',
      quietMode: false,
    },
    expectedBehavior:
      'High fan speed provides 2.8°C skin depression; comfort score remains in acceptable green zone.',
  },
  {
    id: 'hot-humid-ac',
    title: 'Hot-Humid Monsoon Profile',
    edition: 'smart-home',
    badge: 'Monsoon Dehumidification',
    tagline: '35°C outdoor, 80% RH; AC dehumidification mode and comfort humidity penalty.',
    description:
      'Simulates coastal monsoon weather (35°C outdoor, 80% RH). High humidity suppresses natural evaporative sweat cooling, penalizing comfort until AC active cooling condenses moisture.',
    targetRoomType: 'Smart Home (Coastal Monsoon)',
    appliedConditions: {
      outdoorTempC: 35,
      indoorTempC: 29,
      relativeHumidityPct: 80,
      occupancy: 'present',
      coolingSetpointC: 24,
      coolingEnabled: true,
      fanAutoMode: true,
      fanSpeed: 'medium',
      quietMode: false,
    },
    expectedBehavior:
      'Humidity penalty lowers initial comfort score. Active AC runtime gradually reduces indoor relative humidity.',
  },

  // --- Smart Care Presets ---
  {
    id: 'care-successful-event',
    title: 'Successful Event — Gateway Online',
    edition: 'smart-care',
    badge: 'Full Path Success',
    tagline: '12 kg abnormal load triggers instant local detection, radio packet, and building siren.',
    description:
      'A 12 kg weight is placed on the ceiling fan in Room A-204 (10 kg threshold). Edge load detection latches instantly, a simulated radio packet propagates to Gateway GW-01 (Hostel Wing A), and the shared building siren sounds.',
    targetRoomType: 'Smart Care Student Hostel Room',
    appliedConditions: {
      virtualLoadKg: 12,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: false,
        gatewayOffline: false,
        sirenUnavailable: false,
      },
    },
    expectedBehavior:
      'Edge latch -> Radio packet (800ms) -> Gateway room resolution -> Shared Siren activates -> Admin alert posted.',
  },
  {
    id: 'care-radio-link-failed',
    title: 'Radio Link Failed',
    edition: 'smart-care',
    badge: 'Fault Simulation',
    tagline: 'Load exceeds threshold with transmitter disabled; local alarm sounds, gateway unaffected.',
    description:
      'Simulates an RF hardware transceiver failure or deliberate radio jammer. The fan detects the 12 kg load and sounds its local piezo buzzer, but packet transmission fails immediately. The central gateway and building siren remain unaware.',
    targetRoomType: 'Smart Care (Fault Test)',
    appliedConditions: {
      virtualLoadKg: 12,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: true,
        gatewayOffline: false,
        sirenUnavailable: false,
      },
    },
    expectedBehavior:
      'Local buzzer activates. Radio packet fails with reason "radio-offline". Gateway & building siren remain silent.',
  },
  {
    id: 'care-gateway-offline',
    title: 'Gateway Offline',
    edition: 'smart-care',
    badge: 'Fault Simulation',
    tagline: 'Packet transmits over radio but gateway is powered down; incident is not centrally logged.',
    description:
      'Simulates a power cut or controller crash at the building floor gateway. The fan transmits the emergency RF packet, but the gateway fails to ingest it. Building siren does not activate.',
    targetRoomType: 'Smart Care (Fault Test)',
    appliedConditions: {
      virtualLoadKg: 12,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: false,
        gatewayOffline: true,
        sirenUnavailable: false,
      },
    },
    expectedBehavior:
      'Packet is transmitted but gateway rejects with "gateway-offline". Central siren does not sound.',
  },
  {
    id: 'care-siren-unavailable',
    title: 'Siren Output Unavailable',
    edition: 'smart-care',
    badge: 'Fault Simulation',
    tagline: 'Gateway successfully receives and maps room, but building siren circuit is disconnected.',
    description:
      'Simulates an emergency where the radio link and gateway function perfectly, recording the incident in the admin console, but the physical relay output to the building siren horn is disconnected.',
    targetRoomType: 'Smart Care (Fault Test)',
    appliedConditions: {
      virtualLoadKg: 12,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: false,
        gatewayOffline: false,
        sirenUnavailable: true,
      },
    },
    expectedBehavior:
      'Incident is registered in Admin console with high severity, but building siren status shows "unavailable".',
  },
  {
    id: 'care-below-threshold',
    title: 'Below Threshold Load (8 kg)',
    edition: 'smart-care',
    badge: 'Normal Operation',
    tagline: '8 kg load on 10 kg threshold fan; normal operation continues without false alarms.',
    description:
      'A normal maintenance pull or heavy decorative item (8 kg) is applied to the fan. Because it is below the 10 kg threshold, no emergency event, radio transmission, or alarm is triggered.',
    targetRoomType: 'Smart Care Room',
    appliedConditions: {
      virtualLoadKg: 8,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: false,
        gatewayOffline: false,
        sirenUnavailable: false,
      },
    },
    expectedBehavior:
      'Weight reads 8.0 kg. Status remains "ARMED (No Abnormal Load)". No alarms or packets triggered.',
  },
  {
    id: 'care-ack-resolution',
    title: 'Warden Acknowledgement & Resolution',
    edition: 'smart-care',
    badge: 'Full Operator Flow',
    tagline: 'Sets up an active alert ready for warden inspection, operator sign-off, and incident close.',
    description:
      'Triggers a full abnormal-load event in Room A-204 and prepares the workspace for demonstrating the institutional protocol: Acknowledging the incident (silencing local horn), inspecting room, and formally resolving with an audit note.',
    targetRoomType: 'Smart Care Institutional Workflow',
    appliedConditions: {
      virtualLoadKg: 14,
      loadPlacedOnFan: true,
      faults: {
        radioOffline: false,
        gatewayOffline: false,
        sirenUnavailable: false,
      },
    },
    expectedBehavior:
      'Active event created in Admin console. Ready for warden operator to click "Acknowledge" then "Resolve".',
  },
];

/**
 * Applies a scenario preset to the specified room and simulation stores.
 */
export function applyScenario(scenarioId: string, roomId?: string): boolean {
  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return false;
  }

  const workspaceState = useWorkspaceStore.getState();
  const simStore = useSimulationStore.getState();
  const careStore = useCareEventStore.getState();
  const uiStore = useUiStore.getState();

  // Determine target room
  let targetRoom = roomId ? workspaceState.rooms.find((r) => r.id === roomId) : null;
  if (!targetRoom) {
    // Pick first matching edition room that isn't archived
    targetRoom = workspaceState.rooms.find((r) => r.edition === scenario.edition && !r.archivedAt) || null;
  }

  if (!targetRoom) {
    uiStore.addToast({
      title: 'Scenario Failed',
      description: `No active ${scenario.edition} room found in workspace to apply preset.`,
      type: 'alert',
    });
    return false;
  }

  const targetRoomId = targetRoom.id;
  workspaceState.selectRoom(targetRoomId);

  // Apply fault configuration if provided
  if (scenario.appliedConditions.faults) {
    const { radioOffline, gatewayOffline, sirenUnavailable } = scenario.appliedConditions.faults;
    if (radioOffline !== undefined && simStore.radioFault !== radioOffline) {
      simStore.toggleFault('radio');
    }
    if (gatewayOffline !== undefined && simStore.gatewayFault !== gatewayOffline) {
      simStore.toggleFault('gateway');
    }
    if (sirenUnavailable !== undefined && simStore.sirenFault !== sirenUnavailable) {
      simStore.toggleFault('siren');
    }
  }

  // Apply inputs and controls to simulation store
  const cond = scenario.appliedConditions;

  simStore.updateInputs({
    ...(cond.outdoorTempC !== undefined && { outdoorTempC: cond.outdoorTempC }),
    ...(cond.indoorTempC !== undefined && { indoorTempC: cond.indoorTempC }),
    ...(cond.relativeHumidityPct !== undefined && { relativeHumidityPct: cond.relativeHumidityPct }),
    ...(cond.occupancy !== undefined && { occupancy: cond.occupancy }),
    ...(cond.virtualLoadKg !== undefined && { loadKg: cond.virtualLoadKg }),
  });

  if (cond.fanSpeed !== undefined) simStore.setFanSpeed(cond.fanSpeed);
  if (cond.fanAutoMode !== undefined) simStore.setFanAutoMode(cond.fanAutoMode);
  if (cond.quietMode !== undefined) simStore.setQuietMode(cond.quietMode);
  if (cond.coolingEnabled !== undefined) simStore.setCoolingEnabled(cond.coolingEnabled);
  if (cond.coolingSetpointC !== undefined) simStore.setCoolingSetpoint(cond.coolingSetpointC);

  if (cond.virtualLoadKg !== undefined) {
    const placed = cond.loadPlacedOnFan ?? true;
    simStore.setVirtualLoadState(cond.virtualLoadKg, placed);

    if (scenario.edition === 'smart-care') {
      const threshold = targetRoom.config.smartCareConfig?.illustrativeThresholdKg ?? 10;
      const isRadioFaulted = cond.faults?.radioOffline ?? simStore.radioFault;
      const isGatewayFaulted = cond.faults?.gatewayOffline ?? simStore.gatewayFault;
      const isSirenFaulted = cond.faults?.sirenUnavailable ?? simStore.sirenFault;

      const evalResult = evaluateLoadCrossing({
        simTimeMs: simStore.simTimeMs,
        currentLoadKg: cond.virtualLoadKg,
        thresholdKg: threshold,
        isPlacedOnFan: placed,
        wasPreviouslyAboveThreshold: false,
        propertyId: targetRoom.propertyId,
        roomId: targetRoom.id,
        fanDeviceId: targetRoom.config.fanDeviceId,
        assignedGatewayId: targetRoom.config.smartCareConfig?.assignedGatewayId,
        localAlarmEnabled: targetRoom.config.smartCareConfig?.localAlarmEnabled ?? true,
        localAlarmAvailable: true,
        radioOnline: !isRadioFaulted,
      });

      if (evalResult.isEventTriggered && evalResult.careEvent) {
        const newEvt = evalResult.careEvent;
        careStore.recordCareEvent(newEvt);

        if (evalResult.localAlarmActive) {
          careStore.setLocalRoomAlarm(targetRoom.id, true);
        }

        if (!isRadioFaulted) {
          const packetId = `PKT-${Date.now().toString(36).toUpperCase()}`;
          careStore.queueRadioPacket({
            packetId,
            eventId: newEvt.id,
            sourceDeviceId: targetRoom.config.fanDeviceId,
            sourceRoomId: targetRoom.id,
            destinationGatewayId: targetRoom.config.smartCareConfig?.assignedGatewayId || 'gw-01',
            eventType: 'abnormal-load',
            createdAtSimMs: simStore.simTimeMs,
            status: 'transmitting',
            simulatedLatencyMs: 750,
          });

          setTimeout(() => {
            if (!isGatewayFaulted) {
              careStore.updateRadioPacket(packetId, { status: 'received' });
              careStore.updateEventStage(
                newEvt.id,
                'gateway-processing',
                'success',
                'Room ID resolved in building registry.',
              );

              if (!isSirenFaulted) {
                careStore.setSharedSiren(true);
                careStore.updateEventStage(
                  newEvt.id,
                  'shared-siren',
                  'success',
                  'Building siren horn activated.',
                );
              } else {
                careStore.updateEventStage(
                  newEvt.id,
                  'shared-siren',
                  'failed',
                  'Shared siren output circuit unavailable.',
                );
              }
            } else {
              careStore.updateRadioPacket(packetId, {
                status: 'failed',
                failureReason: 'gateway-offline',
              });
              careStore.updateEventStage(
                newEvt.id,
                'gateway-processing',
                'failed',
                'Gateway unresponsive; packet dropped.',
              );
            }
          }, 800);
        }
      }
    }
  }

  // Log decision event
  simStore.addLogEntry({
    id: `log-scenario-${Date.now()}`,
    simTimeMs: simStore.simTimeMs,
    timestampIso: new Date().toISOString(),
    type: 'ROOM_UPDATED',
    roomId: targetRoomId,
    summary: `Applied Scenario Preset: "${scenario.title}"`,
    severity: 'info',
  });

  uiStore.addToast({
    title: `Preset Applied: ${scenario.title}`,
    description: `Configured conditions for ${targetRoom.name}.`,
    type: 'success',
  });

  return true;
}
