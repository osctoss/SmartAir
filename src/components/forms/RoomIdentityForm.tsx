import React, { useEffect, useState } from 'react';
import { slugify } from '@/domain/ids';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';

export interface RoomIdentityData {
  name: string;
  id: string;
  propertyName: string;
  block?: string;
  floor?: string;
  notes?: string;
}

interface RoomIdentityFormProps {
  data: RoomIdentityData;
  onChange: (data: Partial<RoomIdentityData>) => void;
  errors: Record<string, string>;
}

export const RoomIdentityForm: React.FC<RoomIdentityFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  const { rooms } = useWorkspaceStore();
  const [hasCustomId, setHasCustomId] = useState(false);

  // Auto-generate slug ID if user hasn't typed custom ID
  useEffect(() => {
    if (!hasCustomId && data.name) {
      const generated = `room-${slugify(data.name)}`;
      if (data.id !== generated) {
        onChange({ id: generated });
      }
    }
  }, [data.name, data.id, hasCustomId, onChange]);

  const isDuplicateId = rooms.some((r) => r.id === data.id);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Room Display Name <span className="text-cyan-400">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Room A-205 or Master Bedroom"
            className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Immutable Room ID <span className="text-cyan-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Used for event routing</span>
          </div>
          <input
            type="text"
            value={data.id}
            onChange={(e) => {
              setHasCustomId(true);
              onChange({ id: e.target.value });
            }}
            placeholder="room-a205"
            className={`w-full bg-[#131b26] border rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all ${
              isDuplicateId || errors.id ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
            }`}
          />
          {isDuplicateId && (
            <p className="text-xs text-rose-400 mt-1">This ID is already in use by another room.</p>
          )}
          {errors.id && <p className="text-xs text-rose-400 mt-1">{errors.id}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Property Name
          </label>
          <input
            type="text"
            value={data.propertyName}
            onChange={(e) => onChange({ propertyName: e.target.value })}
            placeholder="Demo Property"
            className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Block / Wing
          </label>
          <input
            type="text"
            value={data.block || ''}
            onChange={(e) => onChange({ block: e.target.value })}
            placeholder="Block A or North"
            className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Floor
          </label>
          <input
            type="text"
            value={data.floor || ''}
            onChange={(e) => onChange({ floor: e.target.value })}
            placeholder="2nd Floor"
            className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Room Notes / Purpose
        </label>
        <textarea
          rows={2}
          value={data.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Non-confidential room purpose or scenario description (do not enter private resident information)."
          className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
        />
      </div>
    </div>
  );
};
