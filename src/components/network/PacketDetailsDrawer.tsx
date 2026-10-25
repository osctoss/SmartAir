import React from 'react';
import { SimulatedRadioPacket } from '@/domain/types';
import { X, Radio, ArrowRight, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface PacketDetailsDrawerProps {
  packet: SimulatedRadioPacket | null;
  onClose: () => void;
}

export const PacketDetailsDrawer: React.FC<PacketDetailsDrawerProps> = ({
  packet,
  onClose,
}) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#131b26] border-l border-slate-700 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold font-['Outfit'] text-white">Radio Packet Inspection</h3>
              <span className="text-xs font-mono text-cyan-300">{packet.packetId}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-5 text-xs">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              packet.status === 'received'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : packet.status === 'failed'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {packet.status === 'received' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : packet.status === 'failed' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4 animate-spin" />
              )}
              <span className="font-bold uppercase tracking-wider">Status: {packet.status}</span>
            </div>
            <span className="font-mono">{packet.simulatedLatencyMs}ms Latency</span>
          </div>

          {packet.failureReason && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <span className="font-bold block">Transmission Failure:</span>
              <span className="font-mono">{packet.failureReason}</span>
            </div>
          )}

          {/* Route Map */}
          <div className="p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Logical Route Path
            </span>
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">{packet.sourceRoomId}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-indigo-400 font-bold">{packet.destinationGatewayId}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Origin Device: <span className="text-slate-300 font-mono">{packet.sourceDeviceId}</span>
            </div>
          </div>

          {/* Raw Payload Inspector */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Packet Payload Dump
            </span>
            <pre className="p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
              {JSON.stringify(packet, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        Simulated network layer. Packet latency and delivery are deterministic.
      </div>
    </div>
  );
};
