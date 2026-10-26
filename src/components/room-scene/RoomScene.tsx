import React, { useState } from 'react';
import { Room } from '@/domain/types';
import { useSimulationStore } from '@/state/useSimulationStore';
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
    setVirtualLoadState,
  } = useSimulationStore();

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

        {/* Dynamic Airflow Lines */}
        <AirflowOverlay speed={fanSpeed} />

        {/* Visual Occupant(s) Representation */}
        <OccupantSvg occupancyCount={occupancyCount} />

        {/* Wall Mounted Air Conditioner (Only when installed in room) */}
        {acInstalled && (
          <WallAcSvg
            type={room.config.coolingConfig?.type}
            enabled={coolingEnabled}
            compressorState={compressorState}
            setpointC={coolingSetpointC}
          />
        )}

        {/* Evaporative Cooler (Only when installed in room) */}
        {coolerInstalled && (
          <EvaporativeCoolerSvg enabled={coolerEnabled} />
        )}

        {/* Ceiling Mounted Fan Assembly */}
        <CeilingFanSvg
          speed={fanSpeed}
          fanDeviceId={room.config.fanDeviceId}
          hasAbnormalLoad={careEventDetected}
        />

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
