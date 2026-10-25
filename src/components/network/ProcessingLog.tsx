import React from 'react';
import { SimulatedRadioPacket } from '@/domain/types';
import { Activity } from 'lucide-react';

interface ProcessingLogProps {
  packets: SimulatedRadioPacket[];
  onSelectPacket: (packet: SimulatedRadioPacket) => void;
}

export const ProcessingLog: React.FC<ProcessingLogProps> = ({
  packets,
  onSelectPacket,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold font-['Outfit'] text-white">
            Radio & Gateway Packet Ingestion Log
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">({packets.length} packets)</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {packets.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            No simulated radio packets dispatched yet. Place load on fan in Care Mode to generate packets.
          </div>
        ) : (
          packets.map((pkt) => (
            <div
              key={pkt.packetId}
              onClick={() => onSelectPacket(pkt)}
              className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    pkt.status === 'received'
                      ? 'bg-emerald-400'
                      : pkt.status === 'failed'
                      ? 'bg-rose-500'
                      : 'bg-cyan-400 animate-ping'
                  }`}
                />
                <div>
                  <span className="font-bold text-white font-mono">{pkt.packetId}</span>
                  <div className="text-[11px] text-slate-400">
                    Route: <span className="text-cyan-300">{pkt.sourceRoomId}</span> ➔{' '}
                    <span className="text-indigo-300">{pkt.destinationGatewayId}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[11px] font-bold uppercase ${
                    pkt.status === 'received'
                      ? 'text-emerald-400'
                      : pkt.status === 'failed'
                      ? 'text-rose-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {pkt.status}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {pkt.simulatedLatencyMs}ms delay
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
