import React from 'react';
import { Edition } from '@/domain/types';
import { Home, Shield, Check, Zap, Volume2, Wind } from 'lucide-react';

interface EditionSelectorProps {
  selectedEdition: Edition;
  onSelectEdition: (edition: Edition) => void;
}

export const EditionSelector: React.FC<EditionSelectorProps> = ({
  selectedEdition,
  onSelectEdition,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Smart Home Card */}
      <div
        onClick={() => onSelectEdition('smart-home')}
        className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
          selectedEdition === 'smart-home'
            ? 'border-cyan-500 bg-cyan-950/20 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
            : 'border-slate-800 bg-[#0e141f] hover:border-slate-700 hover:bg-[#131b26]'
        }`}
      >
        {selectedEdition === 'smart-home' && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-md">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}

        <div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">SmartAir Smart Home</h3>
          <p className="text-xs uppercase font-semibold text-cyan-400 tracking-wider mt-1">
            Comfort & Energy Intelligence
          </p>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Autonomous multi-appliance coordination between smart ceiling fan and air conditioner / cooler.
          </p>

          <div className="mt-5 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Automatic demand-driven fan speed selection</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>AC compressor cycling & vacancy auto-off</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Quiet mode context cap & Energy Lab comparison</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">Target Segment</span>
          <span className="text-cyan-400">Residential & Co-living</span>
        </div>
      </div>

      {/* Smart Care Card */}
      <div
        onClick={() => onSelectEdition('smart-care')}
        className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
          selectedEdition === 'smart-care'
            ? 'border-indigo-500 bg-indigo-950/20 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
            : 'border-slate-800 bg-[#0e141f] hover:border-slate-700 hover:bg-[#131b26]'
        }`}
      >
        {selectedEdition === 'smart-care' && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}

        <div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">SmartAir Smart Care</h3>
          <p className="text-xs uppercase font-semibold text-indigo-400 tracking-wider mt-1">
            Safety & Care Intelligence
          </p>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Abnormal-load detection workflow, local radio packet delivery, and shared building siren coordination.
          </p>

          <div className="mt-5 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Ceiling anchor virtual load testing & edge trigger</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Visible fan-to-gateway radio packet propagation</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Shared building siren & full warden audit console</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">Target Segment</span>
          <span className="text-indigo-400">Hostels & Student Housing</span>
        </div>
      </div>
    </div>
  );
};
