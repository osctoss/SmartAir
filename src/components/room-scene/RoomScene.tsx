import React, { useState } from 'react';
import { Room } from '@/domain/types';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { RoomShellSvg } from './RoomShellSvg';
import { CeilingFanSvg } from './CeilingFanSvg';
import { WallAcSvg } from './WallAcSvg';
import { EvaporativeCoolerSvg } from './EvaporativeCoolerSvg';
import { OccupantSvg } from './OccupantSvg';
import { AirflowOverlay } from './AirflowOverlay';
import { FanDropTarget } from './FanDropTarget';
import { VirtualLoadObject } from './VirtualLoadObject';
import { SceneLegend } from './SceneLegend';

interface RoomSceneProps {
  room: Room;
}

export const RoomScene: React.FC<RoomSceneProps> = ({ room }) => {
  const isCareMode = room.edition === 'smart-care';
  const {
    runState,
    fanSpeed,
    currentFanWatts,
    compressorState,
    coolingEnabled,
    coolingSetpointC,
    indoorTempC,
    acInstalled,
    coolerInstalled,
    coolerEnabled,
    occupancyCount,
    loadKg,
    loadPlacedOnFan,
    careEventDetected,
    radioFault,
    sirenFault,
    setVirtualLoadState,
  } = useSimulationStore();

  const { sharedSirenActive } = useCareEventStore();
  const isRunning = runState === 'running';
  const isSirenSounding = isCareMode && sharedSirenActive && !sirenFault && isRunning;

  const [isHoveringDropTarget, setIsHoveringDropTarget] = useState(false);

  // Compute subtle ambient hue based on temperature
  // Below 22C: cool blue; 22-27C: neutral; Above 30C: warm amber
  const temperatureHue =
    indoorTempC > 30 ? '#f59e0b' : indoorTempC < 23 ? '#38bdf8' : undefined;

  const handlePlaceLoad = () => {
    // If mass is currently 0, default to 12 kg for demonstrative threshold crossing
    const targetMass = loadKg > 0 ? loadKg : 12;
    setVirtualLoadState(targetMass, true);
  };

  const handleRemoveLoad = () => {
    setVirtualLoadState(loadKg, false);
  };

  return (
    <div className="room-scene-container relative w-full h-[540px] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-[#0a0f17]">
      {/* Dynamic SVG Canvas */}
      <svg
        viewBox="0 0 800 600"
        className="room-svg-root"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Room Architectural Shell */}
        <RoomShellSvg temperatureHue={temperatureHue} />

        {/* Dynamic Airflow Lines - only active when simulator is running */}
        <AirflowOverlay speed={isRunning ? fanSpeed : 'off'} />

        {/* Visual Occupant(s) Representation */}
        <OccupantSvg occupancyCount={occupancyCount} />

        {/* Wall Mounted Air Conditioner (Only when installed in room) */}
        {acInstalled && (
          <WallAcSvg
            type={room.config.coolingConfig?.type}
            enabled={isRunning && coolingEnabled}
            compressorState={isRunning ? compressorState : 'off'}
            setpointC={coolingSetpointC}
          />
        )}

        {/* Evaporative Cooler (Only when installed in room) */}
        {coolerInstalled && (
          <EvaporativeCoolerSvg enabled={isRunning && coolerEnabled} />
        )}

        {/* Ceiling Mounted Fan Assembly - only spins when simulator is running */}
        <CeilingFanSvg
          speed={isRunning ? fanSpeed : 'off'}
          fanDeviceId={room.config.fanDeviceId}
          hasAbnormalLoad={careEventDetected && isRunning}
        />

        {/* Wall-Mounted Building Emergency Strobe Siren (Smart Care only) */}
        {isCareMode && (
          <g id="wall-emergency-siren" transform="translate(680, 80)">
            {/* Siren Mounting Bracket */}
            <rect x="0" y="0" width="46" height="52" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <rect x="6" y="6" width="34" height="24" rx="4" fill={isSirenSounding ? '#b91c1c' : sirenFault ? '#78350f' : '#0f172a'} />

            {/* Strobe Beacon Dome */}
            <ellipse
              cx="23"
              cy="18"
              rx="12"
              ry="8"
              fill={isSirenSounding ? '#f87171' : sirenFault ? '#f59e0b' : '#334155'}
              className={isSirenSounding ? 'animate-pulse' : ''}
            />

            {/* Strobe Rays & Acoustic Arcs when sounding */}
            {isSirenSounding && (
              <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <line x1="23" y1="6" x2="23" y2="1" />
                <line x1="7" y1="11" x2="2" y2="7" />
                <line x1="39" y1="11" x2="44" y2="7" />
                {/* Acoustic sound wave rings */}
                <path d="M -6 10 A 16 16 0 0 0 -6 26" fill="none" stroke="#f87171" strokeWidth="2" className="animate-ping" />
                <path d="M 52 10 A 16 16 0 0 1 52 26" fill="none" stroke="#f87171" strokeWidth="2" className="animate-ping" />
              </g>
            )}

            {/* Industrial Siren Grill */}
            <line x1="12" y1="36" x2="34" y2="36" stroke="#475569" strokeWidth="1.5" />
            <line x1="14" y1="41" x2="32" y2="41" stroke="#475569" strokeWidth="1.5" />
            <line x1="16" y1="46" x2="30" y2="46" stroke="#475569" strokeWidth="1.5" />

            {/* Center Status LED */}
            <circle cx="23" cy="18" r="3.5" fill={isSirenSounding ? '#ffffff' : sirenFault ? '#fbbf24' : '#10b981'} />
            <text x="23" y="60" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="monospace">
              {isSirenSounding ? 'SIREN' : 'ARMED'}
            </text>
          </g>
        )}

        {/* Smart Care Ceiling Drop Target Hook */}
        {isCareMode && (
          <g
            onMouseEnter={() => setIsHoveringDropTarget(true)}
            onMouseLeave={() => setIsHoveringDropTarget(false)}
          >
            <FanDropTarget
              isOver={isHoveringDropTarget}
              isPlaced={loadPlacedOnFan}
              onDrop={handlePlaceLoad}
            />
          </g>
        )}
      </svg>

      {/* Virtual Load Toolbox & Placed Weight (Smart Care only) */}
      {isCareMode && (
        <VirtualLoadObject
          loadKg={loadKg || 12}
          isPlaced={loadPlacedOnFan}
          onRemove={handleRemoveLoad}
          onPlaceKeyboard={handlePlaceLoad}
        />
      )}

      {/* Floating State Legend */}
      <SceneLegend
        fanSpeed={fanSpeed}
        fanWatts={currentFanWatts}
        coolingState={coolingEnabled ? compressorState : 'off'}
        indoorTemp={indoorTempC}
        isCareMode={isCareMode}
        radioOnline={!radioFault}
        acInstalled={acInstalled}
        coolerInstalled={coolerInstalled}
        coolerEnabled={coolerEnabled}
        occupancyCount={occupancyCount}
      />
    </div>
  );
};
