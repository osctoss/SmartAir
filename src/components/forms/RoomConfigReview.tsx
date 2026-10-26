import React from 'react';
import { Edition } from '@/domain/types';
import { RoomIdentityData } from './RoomIdentityForm';
import { RoomConfigFormData } from './RoomConfigForm';
import { Home, Shield, Thermometer, Wind, Radio, Volume2, Cpu, Check, X } from 'lucide-react';

interface RoomConfigReviewProps {
  edition: Edition;
  identity: RoomIdentityData;
  config: RoomConfigFormData;
  generatedFanId: string;
}

export const RoomConfigReview: React.FC<RoomConfigReviewProps> = ({
  edition,
  identity,
  config,
  generatedFanId,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131b26] border border-slate-700 shadow-xl">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              New Room Preview
            </span>
            <h3 className="text-2xl font-bold font-['Outfit'] text-white mt-1">{identity.name}</h3>
            <span className="text-xs font-mono text-cyan-400 mt-1 block">
              Immutable ID: {identity.id}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
              edition === 'smart-home'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {edition === 'smart-home' ? (
              <>
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Smart Home Edition</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Smart Care Edition</span>
              </>
            )}
          </div>
        </div>

        {/* Location & Sensor Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Property</span>
            <span className="text-sm font-semibold text-white mt-0.5 block truncate">
              {identity.propertyName || 'Demo Property'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Location</span>
            <span className="text-sm font-semibold text-white mt-0.5 block">
              {identity.block || 'Main'} · {identity.floor || 'Floor 1'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Fan Device</span>
            <span className="text-xs font-mono font-semibold text-cyan-400 mt-0.5 block truncate">
              {generatedFanId}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Start Temp / RH</span>
            <span className="text-sm font-semibold text-white mt-0.5 block">
              {config.initialIndoorTempC}°C / {config.relativeHumidityPct}%
            </span>
          </div>
        </div>

        {/* Installed Device Catalogue Review */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Installed Device Catalogue</span>
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Check className="w-3 h-3" /> Ceiling Fan
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                config.acInstalled
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {config.acInstalled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Wall AC ({config.acInstalled ? 'Installed' : 'Absent'})
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                config.coolerInstalled
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {config.coolerInstalled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Cooler ({config.coolerInstalled ? `Installed · ${config.coolerThresholdPct}% cutoff` : 'Absent'})
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                config.pcInstalled
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {config.pcInstalled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              PC Interface ({config.pcInstalled ? 'Installed' : 'Absent'})
            </span>
          </div>
        </div>

        {/* Edition Specific Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          {edition === 'smart-home' ? (
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              {config.acInstalled && (
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span>Setpoint: <strong>{config.setpointC}°C</strong> (AC)</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Climate: <strong className="capitalize">{config.climateProfile}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${config.quietMode ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                <span>Quiet Mode: {config.quietMode ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Abnormal Load Threshold: <strong className="text-amber-400">{config.thresholdKg} kg</strong> (illustrative)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>Gateway Route: <strong className="font-mono">{config.assignedGatewayId}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Shared Siren: {config.sharedSirenEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
