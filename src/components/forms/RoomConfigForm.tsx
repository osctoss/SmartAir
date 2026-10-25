import React from 'react';
import { Edition, ClimateProfile, CoolingType } from '@/domain/types';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { AlertCircle } from 'lucide-react';

export interface RoomConfigFormData {
  initialIndoorTempC: number;
  outdoorTempC: number;
  relativeHumidityPct: number;
  occupancy: 'present' | 'absent';
  climateProfile: ClimateProfile;
  coolingType: CoolingType;
  setpointC: number;
  quietMode: boolean;
  assignedGatewayId: string;
  thresholdKg: number;
  localAlarmEnabled: boolean;
  sharedSirenEnabled: boolean;
}

interface RoomConfigFormProps {
  edition: Edition;
  data: RoomConfigFormData;
  onChange: (updates: Partial<RoomConfigFormData>) => void;
}

export const RoomConfigForm: React.FC<RoomConfigFormProps> = ({
  edition,
  data,
  onChange,
}) => {
  const { gateways } = useWorkspaceStore();

  return (
    <div className="space-y-6">
      {/* Environmental Conditions */}
      <div>
        <h4 className="text-sm font-bold font-['Outfit'] text-white uppercase tracking-wider mb-3">
          Starting Environmental Telemetry
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Initial Indoor Temp (°C)
            </label>
            <input
              type="number"
              min={16}
              max={45}
              step={0.5}
              value={data.initialIndoorTempC}
              onChange={(e) => onChange({ initialIndoorTempC: parseFloat(e.target.value) || 28 })}
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Outdoor Temp (°C)
            </label>
            <input
              type="number"
              min={20}
              max={48}
              step={0.5}
              value={data.outdoorTempC}
              onChange={(e) => onChange({ outdoorTempC: parseFloat(e.target.value) || 38 })}
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Relative Humidity (%)
            </label>
            <input
              type="number"
              min={10}
              max={95}
              value={data.relativeHumidityPct}
              onChange={(e) => onChange({ relativeHumidityPct: parseInt(e.target.value) || 45 })}
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Edition-Specific Controls */}
      {edition === 'smart-home' ? (
        <div className="space-y-5 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold font-['Outfit'] text-white uppercase tracking-wider">
            Smart Home Comfort & Appliance Policies
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Cooling Appliance
              </label>
              <select
                value={data.coolingType}
                onChange={(e) => onChange({ coolingType: e.target.value as CoolingType })}
                className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="ac">Air Conditioner (AC)</option>
                <option value="evaporative-cooler">Evaporative Cooler</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Target Setpoint (°C)
              </label>
              <input
                type="number"
                min={18}
                max={30}
                step={0.5}
                value={data.setpointC}
                onChange={(e) => onChange({ setpointC: parseFloat(e.target.value) || 26 })}
                className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Regional Climate Profile
              </label>
              <select
                value={data.climateProfile}
                onChange={(e) => onChange({ climateProfile: e.target.value as ClimateProfile })}
                className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="balanced">Balanced / Moderate</option>
                <option value="hot-dry">Hot & Dry (North/Central)</option>
                <option value="hot-humid">Hot & Humid (Coastal)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#131b26] border border-slate-700">
            <input
              type="checkbox"
              id="quiet-mode-toggle"
              checked={data.quietMode}
              onChange={(e) => onChange({ quietMode: e.target.checked })}
              className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-600 cursor-pointer"
            />
            <label htmlFor="quiet-mode-toggle" className="text-sm text-slate-200 cursor-pointer font-medium">
              Enable Quiet Mode context capability (caps fan speed for study or video calls)
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-5 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold font-['Outfit'] text-white uppercase tracking-wider">
            Smart Care Safety & Radio Link Routing
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Assigned Virtual Gateway
              </label>
              <select
                value={data.assignedGatewayId}
                onChange={(e) => onChange({ assignedGatewayId: e.target.value })}
                className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                {gateways.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Illustrative Load Threshold (kg)
                </label>
                <span className="text-[11px] text-amber-400 font-medium">Demo Only</span>
              </div>
              <input
                type="number"
                min={2}
                max={30}
                step={0.5}
                value={data.thresholdKg}
                onChange={(e) => onChange({ thresholdKg: parseFloat(e.target.value) || 10 })}
                className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 font-mono text-cyan-300"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              <strong>Illustrative Simulation Limit:</strong> The 10 kg threshold is a virtual scenario parameter to test software flow and radio propagation. It does not validate physical fan mechanical tolerance or determine intent. Never hang weights from real fans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
              <input
                type="checkbox"
                id="local-alarm-toggle"
                checked={data.localAlarmEnabled}
                onChange={(e) => onChange({ localAlarmEnabled: e.target.checked })}
                className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-600 cursor-pointer"
              />
              <label htmlFor="local-alarm-toggle" className="text-xs text-slate-200 cursor-pointer">
                Enable Simulated In-Room Local Alarm output
              </label>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
              <input
                type="checkbox"
                id="shared-siren-toggle"
                checked={data.sharedSirenEnabled}
                onChange={(e) => onChange({ sharedSirenEnabled: e.target.checked })}
                className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-600 cursor-pointer"
              />
              <label htmlFor="shared-siren-toggle" className="text-xs text-slate-200 cursor-pointer">
                Enable Building-Level Shared Siren coordination
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
