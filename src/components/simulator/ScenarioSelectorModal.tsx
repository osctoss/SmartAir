import React, { useState } from 'react';
import { SIMULATION_SCENARIOS, applyScenario, ScenarioDefinition } from '@/simulation/scenarios';
import { Edition } from '@/domain/types';
import { X, Play, Sparkles, ShieldAlert, Thermometer } from 'lucide-react';

interface ScenarioSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoomId?: string;
  defaultEditionFilter?: Edition;
}

export const ScenarioSelectorModal: React.FC<ScenarioSelectorModalProps> = ({
  isOpen,
  onClose,
  activeRoomId,
  defaultEditionFilter,
}) => {
  const [filter, setFilter] = useState<'all' | 'smart-home' | 'smart-care'>(
    defaultEditionFilter || 'all',
  );

  if (!isOpen) return null;

  const scenarios = SIMULATION_SCENARIOS.filter(
    (s) => filter === 'all' || s.edition === filter,
  );

  const handleApply = (scenarioId: string) => {
    applyScenario(scenarioId, activeRoomId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0e141f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Preset Scenarios & Interactive Demos
              </h2>
              <p className="text-xs text-slate-400">
                Deterministic demonstration profiles for thermal comfort, edge load detection, and fault injection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-slate-800/50 bg-[#090d14]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All Scenarios ({SIMULATION_SCENARIOS.length})
          </button>
          <button
            onClick={() => setFilter('smart-home')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'smart-home'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Smart Home (5)</span>
          </button>
          <button
            onClick={() => setFilter('smart-care')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'smart-care'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Smart Care (6)</span>
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario: ScenarioDefinition) => {
              const isCare = scenario.edition === 'smart-care';
              return (
                <div
                  key={scenario.id}
                  className="flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          isCare
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {scenario.badge}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isCare ? 'Smart Care' : 'Smart Home'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {scenario.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {scenario.description}
                    </p>

                    <div className="p-2 rounded-lg bg-black/30 border border-slate-800/60 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">Expected: </span>
                      {scenario.expectedBehavior}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      {scenario.targetRoomType}
                    </span>
                    <button
                      onClick={() => handleApply(scenario.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Preset</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090d14] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            SIMULATION ONLY — Deterministic models without real hardware
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
