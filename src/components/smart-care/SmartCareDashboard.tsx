import React from 'react';
import { Room } from '@/domain/types';
import { SmartCareLoadControls } from './SmartCareLoadControls';
import { EventPipeline } from './EventPipeline';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { Radio, Volume2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartCareDashboardProps {
  room: Room;
}

export const SmartCareDashboard: React.FC<SmartCareDashboardProps> = ({ room }) => {
  const navigate = useNavigate();
  const { events, sharedSirenActive, localAlarmActiveByRoomId } = useCareEventStore();
  const { radioFault, gatewayFault, sirenFault, toggleFault } = useSimulationStore();
  const { updateRoom } = useWorkspaceStore();

  const isLocalAlarmSounding = localAlarmActiveByRoomId[room.id] || false;
  const currentThreshold = room.config.smartCareConfig?.illustrativeThresholdKg || 10;

  const roomEvents = events.filter((e) => e.roomId === room.id);
  const latestRoomEvent = roomEvents[0];

  const handleUpdateThreshold = (newThreshold: number) => {
    updateRoom(room.id, {
      config: {
        ...room.config,
        smartCareConfig: {
          ...room.config.smartCareConfig!,
          illustrativeThresholdKg: newThreshold,
        },
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Real-time Event Pipeline Stepper */}
      <EventPipeline latestEvent={latestRoomEvent} />

      {/* Main Controls: Load Generator & Gateway Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SmartCareLoadControls
          thresholdKg={currentThreshold}
          onUpdateThreshold={handleUpdateThreshold}
        />

        {/* Network & Siren Status Card */}
        <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold font-['Outfit'] text-white">
                  Radio & Siren Network Path
                </h4>
              </div>

              <button
                onClick={() => navigate('/network')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Topology</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gateway</span>
                <span className="font-mono font-bold text-white mt-0.5 block truncate">
                  {room.config.smartCareConfig?.assignedGatewayId || 'gw-main'}
                </span>
                <span className={`text-[10px] font-semibold mt-1 block ${gatewayFault ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {gatewayFault ? '● Offline (Faulted)' : '● Ready / Online'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Shared Siren</span>
                <span className="font-bold text-white mt-0.5 block">
                  {sharedSirenActive ? 'SOUNDING' : 'Standby'}
                </span>
                <span className={`text-[10px] font-semibold mt-1 block ${sirenFault ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sirenFault ? '● Output Faulted' : '● Output Healthy'}
                </span>
              </div>
            </div>

            {/* Local Alarm Indicator */}
            <div className="mt-4 p-3 rounded-xl bg-[#131b26] border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Volume2 className={`w-4 h-4 ${isLocalAlarmSounding ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-slate-300">Local Room Buzzer:</span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isLocalAlarmSounding
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'text-slate-500'
                }`}
              >
                {isLocalAlarmSounding ? 'ACTIVE' : 'Silenced'}
              </span>
            </div>
          </div>

          {/* Fault Toggles Bar */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
              Presenter Fault Injection
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => toggleFault('radio')}
                className={`px-3 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  radioFault
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-[#131b26] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {radioFault ? '❌ Radio Offline' : 'Radio Online'}
              </button>
              <button
                onClick={() => toggleFault('gateway')}
                className={`px-3 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  gatewayFault
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-[#131b26] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {gatewayFault ? '❌ Gateway Offline' : 'Gateway Online'}
              </button>
              <button
                onClick={() => toggleFault('siren')}
                className={`px-3 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  sirenFault
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-[#131b26] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {sirenFault ? '❌ Siren Faulted' : 'Siren Healthy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
