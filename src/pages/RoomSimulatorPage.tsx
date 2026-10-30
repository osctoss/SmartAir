import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { RoomScene } from '@/components/room-scene/RoomScene';
import { FanControlPanel } from '@/components/smart-home/FanControlPanel';
import { CoolingControlPanel } from '@/components/smart-home/CoolingControlPanel';
import { CoolerControlPanel } from '@/components/smart-home/CoolerControlPanel';
import { OccupancyControl } from '@/components/smart-home/OccupancyControl';
import { EditDevicesModal } from '@/components/simulator/EditDevicesModal';
import { EnvironmentalControlsCard } from '@/components/smart-home/EnvironmentalControlsCard';
import { ComfortScoreCard } from '@/components/smart-home/ComfortScoreCard';
import { EnergyMetricCards } from '@/components/smart-home/EnergyMetricCards';
import { SmartCareLoadControls } from '@/components/smart-care/SmartCareLoadControls';
import { SmartCareDashboard } from '@/components/smart-care/SmartCareDashboard';
import { SimulationToolbar } from '@/components/simulator/SimulationToolbar';
import { DecisionLog } from '@/components/simulator/DecisionLog';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { evaluateLoadCrossing } from '@/simulation/smart-care/load-event';
import { evaluateSmartHomeRules } from '@/simulation/smart-home/control-rules';
import { stepIndoorTemperature } from '@/simulation/smart-home/thermal-model';
import { stepRelativeHumidity } from '@/simulation/smart-home/humidity-model';
import { calculateComfortScore } from '@/simulation/smart-home/comfort';
import { calculatePowerWatts, integrateEnergyStep } from '@/simulation/smart-home/energy-model';
import { processGatewayIngestion } from '@/simulation/smart-care/gateway-simulator';
import { evaluateSirenActivation, SirenAudioPreview } from '@/simulation/smart-care/siren-simulator';
import { Home, Shield, ArrowLeft, Cpu } from 'lucide-react';

export const RoomSimulatorPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [editDevicesOpen, setEditDevicesOpen] = useState(false);
  const lastSimTimeMsRef = React.useRef<number>(0);
  const simMsAccumulatorRef = React.useRef<number>(0);

  const { rooms, selectedRoomId, selectRoom } = useWorkspaceStore();
  const {
    runState,
    simTimeMs,
    acInstalled,
    coolerInstalled,
    careEventDetected,
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
      lastSimTimeMsRef.current = 0;
      simMsAccumulatorRef.current = 0;
    }
  }, [activeRoom?.id]);

  // Stop siren audio whenever simulation pauses or stops
  useEffect(() => {
    if (runState !== 'running') {
      SirenAudioPreview.stop();
    }
  }, [runState]);

  // Simulation Step Evaluation Loop: Smart Home vs Smart Care
  useEffect(() => {
    if (!activeRoom) return;

    const live = useSimulationStore.getState();

    // Detect reset
    if (live.simTimeMs === 0 && lastSimTimeMsRef.current > 0) {
      lastSimTimeMsRef.current = 0;
      simMsAccumulatorRef.current = 0;
      return;
    }

    const deltaMs = live.simTimeMs - lastSimTimeMsRef.current;
    lastSimTimeMsRef.current = live.simTimeMs;

    // Strong constraint: If paused and time did not advance (no +1 Min click), do not step any activity
    if (runState !== 'running' && deltaMs <= 0) {
      return;
    }

    if (activeRoom.edition === 'smart-home') {
      // Accumulate elapsed virtual time
      simMsAccumulatorRef.current += Math.max(0, deltaMs);

      // Advance by at least 1 second of simulation time
      if (simMsAccumulatorRef.current < 1000) return;

      const deltaSimSeconds = Math.floor(simMsAccumulatorRef.current / 1000);
      simMsAccumulatorRef.current %= 1000;
      const deltaSimHours = deltaSimSeconds / 3600;

      // 1. Advance Relative Humidity physics
      const outdoorRh = live.outdoorTempC > 35 ? 35 : 55;
      const humidityResult = stepRelativeHumidity(
        live.relativeHumidityPct,
        outdoorRh,
        live.coolerInstalled && live.coolerEnabled,
        live.acInstalled && live.compressorState === 'cooling',
        deltaSimHours,
      );
      const nextRh = humidityResult.nextRhPct;
      const trend = humidityResult.trend;

      // Base indoor temperature before AC progression
      const baseIndoor =
        live.compressorState === 'cooling'
          ? live.indoorTempC
          : Math.round(
              stepIndoorTemperature(
                live.indoorTempC,
                live.outdoorTempC,
                false,
                'ac',
                'off',
                live.coolingSetpointC,
                deltaSimHours,
              ) * 10,
            ) / 10;

      // 2. Evaluate Smart Home Control Rules
      const rules = evaluateSmartHomeRules({
        simTimeMs: live.simTimeMs,
        indoorTempC: baseIndoor,
        relativeHumidityPct: nextRh,
        occupancy: live.occupancy,
        occupancyCount: live.occupancyCount,
        currentVacancyTimerSeconds: live.vacancyTimerRemainingSeconds,
        fanAutoMode: live.fanAutoMode,
        quietMode: live.quietMode,
        quietSpeedLimit: 'low',
        currentFanSpeed: live.fanSpeed,
        coolingEnabled: live.acInstalled && live.coolingEnabled,
        coolingType: 'ac',
        coolingSetpointC: live.coolingSetpointC,
        currentCompressorState: live.compressorState,
        vacancyDelaySeconds: 20,
        deltaSimSeconds,
        acInstalled: live.acInstalled,
        acActivationDelayRemainingSeconds: live.acActivationDelayRemainingSeconds,
        coolingStepAccumulatorSeconds: live.coolingStepAccumulatorSeconds,
        coolingStepSeconds: 5,
        outdoorTempC: live.outdoorTempC,
        coolerInstalled: live.coolerInstalled,
        coolerEnabled: live.coolerEnabled,
        highHumidityThresholdPct: live.highHumidityThresholdPct,
        humidityProtectionTriggered: live.humidityProtectionTriggered,
      });

      // 3. Compute Power and Integrate Energy
      const power = calculatePowerWatts(
        rules.nextFanSpeed,
        rules.nextCompressorState,
        live.acInstalled && live.coolingEnabled,
      );
      const fanEnergyStep = integrateEnergyStep(power.fanWatts, deltaSimHours);
      const coolingEnergyStep = integrateEnergyStep(power.coolingWatts, deltaSimHours);

      const nextCumulativeFanKWh = live.cumulativeFanKWh + fanEnergyStep;
      const nextCumulativeCoolingKWh = live.cumulativeCoolingKWh + coolingEnergyStep;
      const nextCumulativeTotalKWh = live.cumulativeTotalKWh + fanEnergyStep + coolingEnergyStep;

      // 4. Calculate Comfort Score
      const comfort = calculateComfortScore(rules.nextIndoorTempC, nextRh, rules.nextFanSpeed);

      applySimulationStep(
        {
          indoorTempC: rules.nextIndoorTempC,
          relativeHumidityPct: nextRh,
          fanSpeed: rules.nextFanSpeed,
          compressorState: rules.nextCompressorState,
          vacancyTimerRemainingSeconds: rules.nextVacancyTimerSeconds,
          acActivationDelayRemainingSeconds: rules.nextAcActivationDelaySeconds,
          coolingStepAccumulatorSeconds: rules.nextCoolingStepAccumulatorSeconds,
          coolerEnabled: rules.nextCoolerEnabled,
          humidityProtectionTriggered: rules.humidityProtectionTriggered,
          humidityTrend: trend,
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
      // Smart Care Abnormal-Load Evaluation (Only when simulator is running)
      if (runState !== 'running') return;

      const threshold = activeRoom.config.smartCareConfig?.illustrativeThresholdKg || 10;
      const evalResult = evaluateLoadCrossing({
        simTimeMs: live.simTimeMs,
        currentLoadKg: live.loadKg,
        thresholdKg: threshold,
        isPlacedOnFan: live.loadPlacedOnFan,
        wasPreviouslyAboveThreshold: live.careEventDetected,
        propertyId: activeRoom.propertyId,
        roomId: activeRoom.id,
        fanDeviceId: activeRoom.config.fanDeviceId,
        assignedGatewayId: activeRoom.config.smartCareConfig?.assignedGatewayId,
        localAlarmEnabled: activeRoom.config.smartCareConfig?.localAlarmEnabled ?? false,
        localAlarmAvailable: !live.localAlarmFault,
        radioOnline: !live.radioFault,
      });

      if (evalResult.isEventTriggered && evalResult.careEvent) {
        const newEvt = evalResult.careEvent;
        recordCareEvent(newEvt);

        if (evalResult.localAlarmActive) {
          setLocalRoomAlarm(activeRoom.id, true);
        }

        // Simulate Radio Packet Transmission
        if (!live.radioFault) {
          const packetId = `PKT-${Date.now().toString(36).toUpperCase()}`;
          queueRadioPacket({
            packetId,
            eventId: newEvt.id,
            sourceDeviceId: activeRoom.config.fanDeviceId,
            sourceRoomId: activeRoom.id,
            destinationGatewayId: activeRoom.config.smartCareConfig?.assignedGatewayId || 'gw-main',
            eventType: 'abnormal-load',
            createdAtSimMs: live.simTimeMs,
            status: 'transmitting',
            simulatedLatencyMs: 750,
          });

          // Simulate deterministic delivery after 800ms
          setTimeout(() => {
            const currentLive = useSimulationStore.getState();
            if (currentLive.runState !== 'running') return;

            const workspaceGateways = useWorkspaceStore.getState().gateways;
            const workspaceRooms = useWorkspaceStore.getState().rooms;

            const currentPacket = {
              packetId,
              eventId: newEvt.id,
              sourceDeviceId: activeRoom.config.fanDeviceId,
              sourceRoomId: activeRoom.id,
              destinationGatewayId: activeRoom.config.smartCareConfig?.assignedGatewayId || 'gw-main',
              eventType: 'abnormal-load' as const,
              createdAtSimMs: live.simTimeMs,
              status: 'transmitting' as const,
              simulatedLatencyMs: 750,
            };

            const effectiveGateways = workspaceGateways.map((g) =>
              currentLive.gatewayFault ? { ...g, status: 'offline' as const } : g,
            );

            const gwResult = processGatewayIngestion(
              currentPacket,
              effectiveGateways,
              workspaceRooms,
            );

            if (gwResult.isSuccess && !currentLive.gatewayFault) {
              updateRadioPacket(packetId, { status: 'received' });
              updateEventStage(newEvt.id, 'gateway-processing', 'success', gwResult.logSummary);

              const sirenResult = evaluateSirenActivation(
                true,
                !currentLive.sirenFault,
                activeRoom.config.smartCareConfig?.sharedSirenEnabled !== false,
              );

              if (sirenResult.canSound) {
                setSharedSiren(true);
                updateEventStage(newEvt.id, 'shared-siren', 'success', sirenResult.summary);
              } else {
                updateEventStage(
                  newEvt.id,
                  'shared-siren',
                  'failed',
                  sirenResult.summary,
                );
              }
            } else {
              updateRadioPacket(packetId, { status: 'failed', failureReason: 'gateway-offline' });
              updateEventStage(newEvt.id, 'gateway-processing', 'failed', gwResult.logSummary);
            }
          }, 800);
        } else {
          updateEventStage(newEvt.id, 'radio-transmission', 'failed', 'Radio link faulted.');
        }
      }
    }
  }, [simTimeMs, runState, activeRoom?.id]);

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
    <div className="space-y-5 animate-in fade-in duration-200">
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
            <button
              id="btn-edit-devices"
              onClick={() => setEditDevicesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#131b26] hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Manage installed appliances and devices in this room"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Devices</span>
            </button>
            <StatusBadge
              status={careEventDetected ? 'alarm' : 'ready'}
              label={careEventDetected ? 'Abnormal Load Alert' : 'System Ready'}
            />
          </div>
        }
      />

      {/* Unified Simulation Master Control & Telemetry Bar */}
      <SimulationToolbar />

      {/* Main Balanced Interactive Grid: Left 3D Room Twin + Hardware, Right Telemetry & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Room Visual Scene + Direct Appliance Controls */}
        <div className="lg:col-span-7 space-y-4">
          <RoomScene room={activeRoom} />

          {/* Under-room Appliance / Hardware Controls */}
          {activeRoom.edition === 'smart-home' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FanControlPanel />
                {acInstalled && <CoolingControlPanel />}
                {coolerInstalled && <CoolerControlPanel />}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SmartCareLoadControls
                thresholdKg={activeRoom.config.smartCareConfig?.illustrativeThresholdKg || 10}
                onUpdateThreshold={(newThreshold) => {
                  useWorkspaceStore.getState().updateRoom(activeRoom.id, {
                    config: {
                      ...activeRoom.config,
                      smartCareConfig: {
                        ...activeRoom.config.smartCareConfig!,
                        illustrativeThresholdKg: newThreshold,
                      },
                    },
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Person Occupancy, Environmental Controls, Comfort & Energy Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          {activeRoom.edition === 'smart-home' ? (
            <>
              {/* Add Person / Presence Control directly adjacent to the Room Scene */}
              <OccupancyControl />

              {/* Environmental Controls placed lower */}
              <EnvironmentalControlsCard />

              <ComfortScoreCard />
              <EnergyMetricCards />
            </>
          ) : (
            <SmartCareDashboard room={activeRoom} />
          )}
        </div>
      </div>

      {/* Bottom Panel: Live Decision & Event Log */}
      <DecisionLog />

      {/* Room Devices Management Modal */}
      <EditDevicesModal
        room={activeRoom}
        isOpen={editDevicesOpen}
        onClose={() => setEditDevicesOpen(false)}
      />
    </div>
  );
};
