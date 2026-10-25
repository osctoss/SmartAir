import React from 'react';
import { Room, Gateway, SimulatedRadioPacket } from '@/domain/types';
import { Fan, Radio, Server, Volume2, Database } from 'lucide-react';

interface NetworkTopologyProps {
  rooms: Room[];
  gateway: Gateway;
  packets: SimulatedRadioPacket[];
  isRadioFaulted: boolean;
  isGatewayFaulted: boolean;
  isSirenFaulted: boolean;
  isSirenSounding: boolean;
  onSelectPacket: (packet: SimulatedRadioPacket) => void;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  rooms,
  gateway,
  packets,
  isRadioFaulted,
  isGatewayFaulted,
  isSirenFaulted,
  isSirenSounding,
  onSelectPacket,
}) => {
  const careRooms = rooms.filter((r) => r.edition === 'smart-care' && !r.archivedAt);
  const activePacket = packets.find((p) => p.status === 'transmitting');

  return (
    <div className="relative p-6 rounded-2xl bg-[#0a0f17] border border-slate-800 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-bold font-['Outfit'] text-white">
            Logical Network & Routing Topology
          </h3>
          <span className="text-xs text-slate-400">
            Fan Modules (ISM Radio) ➔ Shared Building Gateway ➔ Siren & Admin Event Store
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Healthy Link</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Simulated Fault</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas for Network Nodes and Routing Paths */}
      <div className="relative min-h-[360px] flex items-center justify-between gap-6 px-4 py-8">
        {/* Column 1: Care Room Modules */}
        <div className="flex flex-col gap-4 z-10 w-48 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Room Fan Modules
          </span>
          {careRooms.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700 shadow-lg flex items-center gap-3 hover:border-cyan-500/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Fan className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{r.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 block truncate">
                  {r.config.fanDeviceId}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Virtual Radio Transmission Bus */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isRadioFaulted
                ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500 shadow-rose-950/40 shadow-lg'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-lg'
            }`}
          >
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white mt-2 block">Radio Transport Bus</span>
          <span className={`text-[10px] font-semibold mt-0.5 ${isRadioFaulted ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isRadioFaulted ? 'FAULT: Radio Offline' : 'RF 865/868 MHz (Virtual)'}
          </span>

          {/* In-Flight Packet Indicator */}
          {activePacket && (
            <button
              onClick={() => onSelectPacket(activePacket)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-300 rounded-full text-xs font-mono font-bold animate-pulse cursor-pointer shadow-lg"
            >
              <span>{activePacket.packetId}</span>
              <span className="text-[10px] text-cyan-400">({activePacket.simulatedLatencyMs}ms)</span>
            </button>
          )}
        </div>

        {/* Column 3: Shared Gateway Node */}
        <div className="w-52 shrink-0 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-2">
            Building Shared Gateway
          </span>
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isGatewayFaulted
                ? 'bg-rose-950/20 border-rose-500 shadow-rose-950/40 shadow-xl'
                : 'bg-[#131b26] border-slate-700 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isGatewayFaulted
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{gateway.name}</span>
                <span className="text-[10px] font-mono text-slate-400 block">{gateway.id}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Node Status:</span>
              <span className={`font-semibold ${isGatewayFaulted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isGatewayFaulted ? 'Offline (Fault)' : 'Online / Healthy'}
              </span>
            </div>
          </div>
        </div>

        {/* Column 4: Outputs (Siren & Admin Store) */}
        <div className="flex flex-col gap-4 w-48 shrink-0 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Outputs & Audit
          </span>

          {/* Building Siren Output */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isSirenSounding
                ? 'bg-rose-500/25 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 animate-pulse'
                : isSirenFaulted
                ? 'bg-rose-950/20 border-rose-500 text-rose-400'
                : 'bg-[#131b26] border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Building Siren</span>
                <span className="text-[10px] block opacity-80">
                  {isSirenSounding
                    ? 'ACTUATED (SOUNDING)'
                    : isSirenFaulted
                    ? 'Output Faulted'
                    : 'Standby Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Event Store */}
          <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700 text-slate-300 flex items-center gap-2.5 shadow-lg">
            <Database className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Admin Event Store</span>
              <span className="text-[10px] text-slate-400 block">Immutable Audit Log</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
