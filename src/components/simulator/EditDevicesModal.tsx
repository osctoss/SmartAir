import React, { useState } from 'react';
import { Room } from '@/domain/types';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { DEFAULT_AC_POWER_WATTS } from '@/domain/constants';
import {
  Tv,
  Fan,
  Monitor,
  Droplets,
  Trash2,
  Plus,
  AlertTriangle,
  X,
  Check,
  Cpu,
} from 'lucide-react';

interface EditDevicesModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDevicesModal: React.FC<EditDevicesModalProps> = ({
  room,
  isOpen,
  onClose,
}) => {
  const {
    acInstalled,
    coolerInstalled,
    pcInstalled,
    compressorState,
    highHumidityThresholdPct,
    removeAc,
    addAc,
    setCoolerInstalled,
    setHighHumidityThreshold,
    setPcInstalled,
  } = useSimulationStore();

  const { updateRoom } = useWorkspaceStore();

  const [showAcConfirm, setShowAcConfirm] = useState(false);
  const [localThreshold, setLocalThreshold] = useState(highHumidityThresholdPct || 65);

  if (!isOpen) return null;

  const handleToggleAc = () => {
    if (acInstalled) {
      // If compressor is currently cooling or active, show confirmation
      if (compressorState === 'cooling') {
        setShowAcConfirm(true);
        return;
      }
      executeAcRemoval();
    } else {
      addAc();
      updateRoom(room.id, {
        config: {
          ...room.config,
          acInstalled: true,
          coolingConfig: room.config.coolingConfig || {
            type: 'ac',
            enabled: true,
            setpointC: 26,
            compressorState: 'resting',
            powerWattsByState: DEFAULT_AC_POWER_WATTS,
          },
        },
      });
    }
  };

  const executeAcRemoval = () => {
    removeAc();
    setShowAcConfirm(false);
    updateRoom(room.id, {
      config: {
        ...room.config,
        acInstalled: false,
        coolingConfig: undefined,
      },
    });
  };

  const handleToggleCooler = () => {
    const nextVal = !coolerInstalled;
    setCoolerInstalled(nextVal);
    updateRoom(room.id, {
      config: {
        ...room.config,
        coolerInstalled: nextVal,
        coolerConfig: nextVal
          ? {
              enabled: false,
              highHumidityThresholdPct: localThreshold,
            }
          : undefined,
      },
    });
  };

  const handleTogglePc = () => {
    const nextVal = !pcInstalled;
    setPcInstalled(nextVal);
    updateRoom(room.id, {
      config: {
        ...room.config,
        pcInstalled: nextVal,
      },
    });
  };

  const handleUpdateThreshold = (val: number) => {
    setLocalThreshold(val);
    setHighHumidityThreshold(val);
    if (coolerInstalled) {
      updateRoom(room.id, {
        config: {
          ...room.config,
          coolerConfig: {
            enabled: room.config.coolerConfig?.enabled ?? false,
            highHumidityThresholdPct: val,
          },
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0e141f] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Outfit'] text-white">
                Room Device Management
              </h3>
              <p className="text-xs text-slate-400">
                Configure installed actuators & appliances for {room.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Catalogue List */}
        <div className="space-y-3">
          {/* Ceiling Fan (Core) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Fan className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  Ceiling-Mounted BLDC Fan
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Core device · Occupancy-triggered & standalone operation
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Required
            </span>
          </div>

          {/* Wall-Mounted AC */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  Wall-Mounted Air Conditioner
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Inverter compressor · 5-min delay & step cooling
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleAc}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                acInstalled
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
              }`}
            >
              {acInstalled ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove AC</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Install AC</span>
                </>
              )}
            </button>
          </div>

          {/* Evaporative Cooler */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#131b26] border border-slate-700/60">
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
                    Hot-dry cooling · High-humidity auto protection
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleCooler}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coolerInstalled
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg'
                }`}
              >
                {coolerInstalled ? (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Cooler</span>
                  </>
                )}
              </button>
            </div>

            {coolerInstalled && (
              <div className="pt-2.5 border-t border-slate-700/50 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-300 font-medium">
                  <span>High Humidity Protection Threshold</span>
                  <span className="font-mono text-teal-300 font-bold">{localThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={85}
                  step={1}
                  value={localThreshold}
                  onChange={(e) => handleUpdateThreshold(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg accent-teal-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 block">
                  Turns cooler OFF and fan ON immediately if humidity exceeds this threshold.
                </span>
              </div>
            )}
          </div>

          {/* PC / Desktop Interface */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  PC / Desktop Control Interface
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Desktop widget for Quiet Mode & meeting overrides
                </span>
              </div>
            </div>

            <button
              onClick={handleTogglePc}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pcInstalled
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
              }`}
            >
              {pcInstalled ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add PC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done & Apply</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal when removing active AC */}
      {showAcConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#131b26] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-white">Active AC Removal Warning</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The simulated AC compressor is currently active or cooling. Removing the AC will
              immediately shut down the compressor, cancel all pending activation and cooling
              timers, and revert the room to standalone ceiling fan operation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAcConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeAcRemoval}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg cursor-pointer"
              >
                Confirm AC Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
