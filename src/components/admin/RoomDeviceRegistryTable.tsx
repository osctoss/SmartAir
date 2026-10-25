import React from 'react';
import { Room, Gateway, Property } from '@/domain/types';
import { Shield, Home } from 'lucide-react';

interface RoomDeviceRegistryTableProps {
  properties: Property[];
  gateways: Gateway[];
  rooms: Room[];
}

export const RoomDeviceRegistryTable: React.FC<RoomDeviceRegistryTableProps> = ({
  properties,
  gateways,
  rooms,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0e141f]">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#131b26] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Property & Wing</th>
            <th className="py-3 px-4">Room Name & ID</th>
            <th className="py-3 px-4">Edition</th>
            <th className="py-3 px-4">Mounted Fan ID</th>
            <th className="py-3 px-4">Gateway Mapping</th>
            <th className="py-3 px-4">Output Entity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rooms.map((room) => {
            const prop = properties.find((p) => p.id === room.propertyId);
            const gw = gateways.find((g) => g.id === room.config.smartCareConfig?.assignedGatewayId);
            const isArchived = !!room.archivedAt;

            return (
              <tr
                key={room.id}
                className={`hover:bg-[#131b26]/70 transition-colors ${
                  isArchived ? 'opacity-60 bg-slate-950/40' : ''
                }`}
              >
                <td className="py-3.5 px-4">
                  <span className="font-bold text-white block">
                    {prop?.name || 'Demo Property'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {room.block || 'Main'} · {room.floor || 'Floor 1'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{room.name}</span>
                    {isArchived && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                        Archived
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 block">{room.id}</span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {room.edition === 'smart-home' ? (
                      <Home className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span className="capitalize">{room.edition.replace('-', ' ')}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-cyan-300 font-bold">
                  {room.config.fanDeviceId}
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {gw ? (
                    <span className="text-indigo-300 font-bold">{gw.id}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  {room.edition === 'smart-care' ? (
                    <span>{gw?.sharedSirenId || 'siren-main'}</span>
                  ) : (
                    <span className="text-slate-600">Local Appliance</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
