import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { NetworkTopology } from '@/components/network/NetworkTopology';
import { ProcessingLog } from '@/components/network/ProcessingLog';
import { PacketDetailsDrawer } from '@/components/network/PacketDetailsDrawer';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { SimulatedRadioPacket } from '@/domain/types';
import { AlertOctagon } from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const { rooms, gateways } = useWorkspaceStore();
  const { activePackets, sharedSirenActive } = useCareEventStore();
  const { radioFault, gatewayFault, sirenFault, toggleFault } = useSimulationStore();

  const [selectedPacket, setSelectedPacket] = useState<SimulatedRadioPacket | null>(null);

  const mainGateway = gateways[0] || {
    id: 'gw-demo-01',
    propertyId: 'prop-demo',
    name: 'Hostel Main Gateway',
    status: 'online',
    radioAvailable: true,
    sharedSirenId: 'siren-main',
    sharedSirenAvailable: true,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Network & Processing Architecture"
        subtitle="Visual representation of the logical radio packet transmission, gateway resolution, and shared siren outputs."
      />

      {/* Main Interactive Network Topology Diagram */}
      <NetworkTopology
        rooms={rooms}
        gateway={mainGateway}
        packets={activePackets}
        isRadioFaulted={radioFault}
        isGatewayFaulted={gatewayFault}
        isSirenFaulted={sirenFault}
        isSirenSounding={sharedSirenActive}
        onSelectPacket={setSelectedPacket}
      />

      {/* Interactive Fault Injection & Processing Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Fault Injection Controller (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold font-['Outfit'] text-white">
                Network Fault Injection
              </h4>
            </div>
            <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
              Demo Test
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Deliberately break network hops to demonstrate fault resilience. When a hop fails, downstream outputs are safely halted and failure evidence is captured in the incident audit trail.
          </p>

          <div className="space-y-3 pt-2">
            {/* Fault 1: Radio Link */}
            <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Local Radio Link</span>
                <span className="text-[11px] text-slate-400 block">Simulate RF interference or transceiver power loss</span>
              </div>
              <button
                onClick={() => toggleFault('radio')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  radioFault
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {radioFault ? 'Fault Active' : 'Normal'}
              </button>
            </div>

            {/* Fault 2: Gateway */}
            <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Shared Gateway</span>
                <span className="text-[11px] text-slate-400 block">Simulate gateway processor outage or reboot</span>
              </div>
              <button
                onClick={() => toggleFault('gateway')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  gatewayFault
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {gatewayFault ? 'Fault Active' : 'Normal'}
              </button>
            </div>

            {/* Fault 3: Siren */}
            <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Shared Building Siren</span>
                <span className="text-[11px] text-slate-400 block">Simulate siren relay disconnection or horn power cut</span>
              </div>
              <button
                onClick={() => toggleFault('siren')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sirenFault
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {sirenFault ? 'Fault Active' : 'Normal'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Processing Log (7 cols) */}
        <div className="lg:col-span-7">
          <ProcessingLog
            packets={activePackets}
            onSelectPacket={setSelectedPacket}
          />
        </div>
      </div>

      {/* Packet Inspection Drawer */}
      <PacketDetailsDrawer
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />
    </div>
  );
};
