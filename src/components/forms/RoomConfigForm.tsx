import React from 'react';
import { Edition, ClimateProfile, CoolingType } from '@/domain/types';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { AlertCircle, Fan, Tv, Droplets, Monitor } from 'lucide-react';

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
  acInstalled: boolean;
  coolerInstalled: boolean;
  coolerThresholdPct: number;
  pcInstalled: boolean;
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
      {/* Device Catalogue & Installed Defaults */}
      <div>
        <h4 className="text-sm font-bold font-['Outfit'] text-white uppercase tracking-wider mb-2">
          Device Catalogue & Installed Defaults ({edition === 'smart-home' ? 'Smart Home' : 'Smart Care'})
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Review default devices for this edition. You can add or remove optional devices.
        </p>

        <div className="space-y-3">
          {/* Ceiling Fan */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Fan className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  Ceiling-Mounted BLDC Fan
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Required device for SmartAir airflow & presence logic
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Default Installed
            </span>
          </div>

          {/* Wall-Mounted AC */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  Wall-Mounted Air Conditioner (AC)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {edition === 'smart-home'
                    ? 'Default for Smart Home · Step cooling & 5-min delay'
                    : 'Optional for Smart Care (Not installed by default)'}
                </span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="cfg-ac-installed"
                checked={data.acInstalled}
                onChange={(e) => onChange({ acInstalled: e.target.checked })}
                className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-600 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                {data.acInstalled ? 'Installed' : 'Absent'}
              </span>
            </label>
          </div>

          {/* Evaporative Cooler */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Evaporative Cooler
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Optional hot-dry cooling with high-humidity automatic protection
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="cfg-cooler-installed"
                  checked={data.coolerInstalled}
                  onChange={(e) => onChange({ coolerInstalled: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-600 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  {data.coolerInstalled ? 'Installed' : 'Absent'}
                </span>
              </label>
            </div>

            {data.coolerInstalled && (
              <div className="pt-2 border-t border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>High Humidity Protection Threshold</span>
                  <span className="font-mono text-teal-400 font-bold">{data.coolerThresholdPct}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={85}
                  step={1}
                  value={data.coolerThresholdPct}
                  onChange={(e) => onChange({ coolerThresholdPct: parseInt(e.target.value, 10) || 65 })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg accent-teal-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* PC Control Interface */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  PC / Desktop Control Interface
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Desktop app controls for study/meeting Quiet Mode & fan commands
                </span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="cfg-pc-installed"
                checked={data.pcInstalled}
                onChange={(e) => onChange({ pcInstalled: e.target.checked })}
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-600 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                {data.pcInstalled ? 'Installed' : 'Absent'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="pt-4 border-t border-slate-800">
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
              onChange={(e) => onChange({ relativeHumidityPct: parseInt(e.target.value, 10) || 45 })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.acInstalled && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Target AC Setpoint (°C)
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
            )}

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
