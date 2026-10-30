import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, BellOff } from 'lucide-react';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { SirenAudioPreview } from '@/simulation/smart-care/siren-simulator';

interface SymbolicSirenProps {
  gatewayId?: string;
}

export const SymbolicSiren: React.FC<SymbolicSirenProps> = ({ gatewayId = 'gw-main' }) => {
  const { sharedSirenActive, setSharedSiren } = useCareEventStore();
  const { runState, sirenFault, gatewayFault } = useSimulationStore();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const isSimulatorRunning = runState === 'running';
  const isSounding = sharedSirenActive && !sirenFault && isSimulatorRunning;

  // Sync Web Audio synthesizer with live simulation siren state
  useEffect(() => {
    SirenAudioPreview.setMuted(isAudioMuted);

    if (isSounding && !isAudioMuted) {
      SirenAudioPreview.startSiren(0.22);
    } else {
      SirenAudioPreview.stopLiveSiren();
    }

    return () => {
      SirenAudioPreview.stopLiveSiren();
    };
  }, [isSounding, isAudioMuted]);

  const handleToggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    SirenAudioPreview.setMuted(nextMuted);
  };

  const handleTestSiren = () => {
    if (isTesting) return;
    setIsTesting(true);
    SirenAudioPreview.playTone(2000, 0.22);
    setTimeout(() => {
      setIsTesting(false);
    }, 2050);
  };

  const handleSilence = () => {
    setSharedSiren(false);
    SirenAudioPreview.stop();
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xl ${
        isSounding
          ? 'bg-gradient-to-b from-rose-950/60 via-[#160b13] to-[#0e141f] border-rose-500/60 shadow-rose-950/50 ring-2 ring-rose-500/30'
          : sirenFault
            ? 'bg-[#121017] border-amber-500/40 shadow-amber-950/20'
            : 'bg-[#0e141f] border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
              isSounding
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : sirenFault
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isSounding ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white flex items-center gap-2">
              <span>Shared Building Siren</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Relay Output
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Hostel/Facility Central Alarm Unit · Gateway Controlled
            </span>
          </div>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleMute}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isAudioMuted
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
          }`}
          title={isAudioMuted ? 'Unmute siren sound' : 'Mute siren sound'}
        >
          {isAudioMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Sound Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Audio On</span>
            </>
          )}
        </button>
      </div>

      {/* Main Siren Strobe & Horn Display */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Beacon SVG Graphic */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {/* Pulsing Acoustic Soundwaves when Sounding */}
            {isSounding && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
                <div className="absolute -inset-2 rounded-full border border-rose-400/25 animate-pulse" />
              </>
            )}

            <svg viewBox="0 0 100 100" className="w-16 h-16">
              {/* Wall Mount Base */}
              <rect x="35" y="75" width="30" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="42" y="65" width="16" height="12" fill="#475569" />

              {/* Siren Housing */}
              <ellipse cx="50" cy="45" rx="30" ry="24" fill={isSounding ? '#b91c1c' : sirenFault ? '#78350f' : '#1e293b'} stroke={isSounding ? '#ef4444' : '#475569'} strokeWidth="2" />

              {/* Inner Strobe Dome */}
              <ellipse cx="50" cy="40" rx="20" ry="16" fill={isSounding ? '#f87171' : sirenFault ? '#f59e0b' : '#334155'} className={isSounding ? 'animate-pulse' : ''} />

              {/* Light Strobe Rays */}
              {isSounding && (
                <g stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="50" y1="12" x2="50" y2="2" />
                  <line x1="25" y1="20" x2="16" y2="12" />
                  <line x1="75" y1="20" x2="84" y2="12" />
                  <line x1="12" y1="42" x2="2" y2="42" />
                  <line x1="88" y1="42" x2="98" y2="42" />
                </g>
              )}

              {/* Center Status Bulb */}
              <circle cx="50" cy="40" r="7" fill={isSounding ? '#ffffff' : sirenFault ? '#fbbf24' : '#10b981'} />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Siren Status:
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isSounding
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                    : sirenFault
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : !isSimulatorRunning
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isSounding
                  ? 'SOUNDING (88 dB Simulated)'
                  : sirenFault
                    ? 'CIRCUIT FAULTED'
                    : !isSimulatorRunning
                      ? 'PAUSED / STANDBY'
                      : 'ARMED & READY'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              {isSounding
                ? 'Building horn actively sounding via Gateway trip signal. High-pitch wail in progress.'
                : sirenFault
                  ? 'Output relay open or physical siren horn unavailable. Gateway signals cannot trip horn.'
                  : !isSimulatorRunning
                    ? 'Simulation clock is paused. Actuators & alarms remain dormant until simulator is running.'
                    : `Monitored via Gateway ${gatewayId}. Ready to sound on abnormal load packet.`}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isSounding ? (
            <button
              onClick={handleSilence}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer active:scale-98"
              title="Silence the active building siren"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Silence Siren</span>
            </button>
          ) : (
            <button
              onClick={handleTestSiren}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#131b26] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Trigger a 2-second test tone"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTesting ? 'Playing 2s Test...' : 'Test Siren'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Signal Chain Diagnostic Bar */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-500 block">1. ISM Radio Link</span>
          <span className="font-semibold text-emerald-400">868 MHz Healthy</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-500 block">2. Gateway Ingestion</span>
          <span className={`font-semibold ${gatewayFault ? 'text-rose-400' : 'text-emerald-400'}`}>
            {gatewayFault ? 'Gateway Faulted' : 'Gateway Online'}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-500 block">3. Horn Relay Output</span>
          <span className={`font-semibold ${sirenFault ? 'text-amber-400' : 'text-emerald-400'}`}>
            {sirenFault ? 'Circuit Faulted' : 'Armed & Soundable'}
          </span>
        </div>
      </div>
    </div>
  );
};
