import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { RoomScene } from '@/components/room-scene/RoomScene';
import { SmartHomeDashboard } from '@/components/smart-home/SmartHomeDashboard';
import { SmartCareDashboard } from '@/components/smart-care/SmartCareDashboard';
import { SimulationToolbar } from '@/components/simulator/SimulationToolbar';
import { SimulationTimeline } from '@/components/simulator/SimulationTimeline';
import { DecisionLog } from '@/components/simulator/DecisionLog';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { evaluateLoadCrossing } from '@/simulation/smart-care/load-event';
import { evaluateSmartHomeRules } from '@/simulation/smart-home/control-rules';
import { stepIndoorTemperature } from '@/simulation/smart-home/thermal-model';
import { stepRelativeHumidity } from '@/simulation/smart-home/humidity-model';
import { calculateComfortScore } from '@/simulation/smart-home/comfort';
import { calculatePowerWatts, integrateEnergyStep } from '@/simulation/smart-home/energy-model';
import { Home, Shield, ArrowLeft } from 'lucide-react';

export const RoomSimulatorPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { rooms, selectedRoomId, selectRoom } = useWorkspaceStore();
  const {
    runState,
    simTimeMs,
    indoorTempC,
    outdoorTempC,
    relativeHumidityPct,
    occupancy,
    vacancyTimerRemainingSeconds,
    fanSpeed,
    fanAutoMode,
    quietMode,
    coolingEnabled,
    coolingSetpointC,
    compressorState,
    cumulativeFanKWh,
    cumulativeCoolingKWh,
    cumulativeTotalKWh,
    loadKg,
    loadPlacedOnFan,
    careEventDetected,
    radioFault,
    gatewayFault,
    sirenFault,
    localAlarmFault,
    initRoomSimulation,
    applySimulationStep,
  } = useSimulationStore();

  const {
    recordCareEvent,
    updateEventStage,
    queueRadioPacket,
    updateRadioPacket,
    setSharedSiren,
    setLocalRoomAlarm,
  } = useCareEventStore();

  const activeRoom = rooms.find((r) => r.id === (roomId || selectedRoomId));

  // Initialize room simulation state when activeRoom changes
  useEffect(() => {
    if (activeRoom) {
      if (activeRoom.id !== selectedRoomId) {
        selectRoom(activeRoom.id);
      }
      initRoomSimulation(activeRoom);
    }
  }, [activeRoom?.id]);

  // Simulation Step Evaluation Loop: Smart Home vs Smart Care
  useEffect(() => {
    if (!activeRoom) return;

    if (activeRoom.edition === 'smart-home') {
      if (runState !== 'running') return;

      const deltaSimSeconds = 1;
      const deltaSimHours = deltaSimSeconds / 3600;

      // 1. Advance Thermal and Humidity physics
      const nextIndoor = stepIndoorTemperature(
        indoorTempC,
        outdoorTempC,
        coolingEnabled,
        activeRoom.config.coolingConfig?.type || 'ac',
        compressorState,
        coolingSetpointC,
        deltaSimHours,
      );

      const nextRh = stepRelativeHumidity(
        relativeHumidityPct,
        outdoorTempC > 35 ? 35 : 55,
        coolingEnabled,
        activeRoom.config.coolingConfig?.type || 'ac',
        compressorState,
        deltaSimHours,
      );

      // 2. Evaluate Smart Home Control Rules
      const rules = evaluateSmartHomeRules({
        simTimeMs,
        indoorTempC: nextIndoor,
        relativeHumidityPct: nextRh,
        occupancy,
        currentVacancyTimerSeconds: vacancyTimerRemainingSeconds,
        fanAutoMode,
        quietMode,
        quietSpeedLimit: 'low',
        currentFanSpeed: fanSpeed,
        coolingEnabled,
        coolingType: activeRoom.config.coolingConfig?.type || 'ac',
        coolingSetpointC,
        currentCompressorState: compressorState,
        vacancyDelaySeconds: 60,
        deltaSimSeconds,
      });

      // 3. Compute Power and Integrate Energy
      const power = calculatePowerWatts(rules.nextFanSpeed, rules.nextCompressorState, coolingEnabled);
      const fanEnergyStep = integrateEnergyStep(power.fanWatts, deltaSimHours);
      const coolingEnergyStep = integrateEnergyStep(power.coolingWatts, deltaSimHours);

      const nextCumulativeFanKWh = cumulativeFanKWh + fanEnergyStep;
      const nextCumulativeCoolingKWh = cumulativeCoolingKWh + coolingEnergyStep;
      const nextCumulativeTotalKWh = cumulativeTotalKWh + fanEnergyStep + coolingEnergyStep;

      // 4. Calculate Comfort Score
      const comfort = calculateComfortScore(nextIndoor, nextRh, rules.nextFanSpeed);

      applySimulationStep(
        {
          indoorTempC: nextIndoor,
          relativeHumidityPct: nextRh,
          fanSpeed: rules.nextFanSpeed,
          compressorState: rules.nextCompressorState,
          vacancyTimerRemainingSeconds: rules.nextVacancyTimerSeconds,
          currentFanWatts: power.fanWatts,
          currentCoolingWatts: power.coolingWatts,
          cumulativeFanKWh: nextCumulativeFanKWh,
          cumulativeCoolingKWh: nextCumulativeCoolingKWh,
          cumulativeTotalKWh: nextCumulativeTotalKWh,
          comfortScore: comfort.score,
        },
        rules.events,
      );
    } else {
      // Smart Care Abnormal-Load Evaluation
      const threshold = activeRoom.config.smartCareConfig?.illustrativeThresholdKg || 10;
      const evalResult = evaluateLoadCrossing({
        simTimeMs,
        currentLoadKg: loadKg,
        thresholdKg: threshold,
        isPlacedOnFan: loadPlacedOnFan,
        wasPreviouslyAboveThreshold: careEventDetected,
        propertyId: activeRoom.propertyId,
        roomId: activeRoom.id,
        fanDeviceId: activeRoom.config.fanDeviceId,
        assignedGatewayId: activeRoom.config.smartCareConfig?.assignedGatewayId,
        localAlarmEnabled: activeRoom.config.smartCareConfig?.localAlarmEnabled ?? false,
        localAlarmAvailable: !localAlarmFault,
        radioOnline: !radioFault,
      });

      if (evalResult.isEventTriggered && evalResult.careEvent) {
        const newEvt = evalResult.careEvent;
        recordCareEvent(newEvt);

        if (evalResult.localAlarmActive) {
          setLocalRoomAlarm(activeRoom.id, true);
        }

        // Simulate Radio Packet Transmission
        if (!radioFault) {
          const packetId = `PKT-${Date.now().toString(36).toUpperCase()}`;
          queueRadioPacket({
            packetId,
            eventId: newEvt.id,
            sourceDeviceId: activeRoom.config.fanDeviceId,
            sourceRoomId: activeRoom.id,
            destinationGatewayId: activeRoom.config.smartCareConfig?.assignedGatewayId || 'gw-main',
            eventType: 'abnormal-load',
            createdAtSimMs: simTimeMs,
            status: 'transmitting',
            simulatedLatencyMs: 750,
          });

          // Simulate deterministic delivery after 800ms
          setTimeout(() => {
            if (!gatewayFault) {
              updateRadioPacket(packetId, { status: 'received' });
              updateEventStage(newEvt.id, 'gateway-processing', 'success', 'Room ID resolved in building registry.');

              if (!sirenFault) {
                setSharedSiren(true);
                updateEventStage(newEvt.id, 'shared-siren', 'success', 'Shared hostel siren activated.');
              } else {
                updateEventStage(newEvt.id, 'shared-siren', 'failed', 'Shared siren output unavailable or faulted.');
              }
            } else {
              updateRadioPacket(packetId, { status: 'failed', failureReason: 'gateway-offline' });
              updateEventStage(newEvt.id, 'gateway-processing', 'failed', 'Destination gateway offline. Packet rejected.');
            }
          }, 800);
        } else {
          updateEventStage(newEvt.id, 'radio-transmission', 'failed', 'Radio link faulted.');
        }
      }
    }
  }, [
    simTimeMs,
    runState,
    loadKg,
    loadPlacedOnFan,
    careEventDetected,
    radioFault,
    gatewayFault,
    sirenFault,
    localAlarmFault,
  ]);

  if (!activeRoom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h2 className="text-xl font-bold font-['Outfit'] text-white">No Virtual Room Selected</h2>
        <p className="text-sm text-slate-400 mt-2">
          Select an active room from the registry to launch its digital-twin simulation.
        </p>
        <button
          onClick={() => navigate('/rooms')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Open Room Registry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <PageHeader
        title={activeRoom.name}
        subtitle={`${activeRoom.block || 'Main'} · ${activeRoom.floor || 'Floor 1'} · Device: ${activeRoom.config.fanDeviceId}`}
        badge={
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              activeRoom.edition === 'smart-home'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {activeRoom.edition === 'smart-home' ? (
              <>
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span>Smart Home Edition</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Smart Care Edition</span>
              </>
            )}
          </span>
        }
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge
              status={careEventDetected ? 'alarm' : 'ready'}
              label={careEventDetected ? 'Abnormal Load Alert' : 'System Ready'}
            />
          </div>
        }
      />

      {/* Simulation Master Controls */}
      <SimulationToolbar />
      <SimulationTimeline />

      {/* Main Interactive Grid: Left 2D/3D Room Scene, Right Edition Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Isometric SVG Room Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <RoomScene room={activeRoom} />
        </div>

        {/* Right: Edition-Specific Controls & Panels (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {activeRoom.edition === 'smart-home' ? (
            <SmartHomeDashboard />
          ) : (
            <SmartCareDashboard room={activeRoom} />
          )}
        </div>
      </div>

      {/* Bottom Panel: Live Decision & Event Log */}
      <DecisionLog />
    </div>
  );
};
