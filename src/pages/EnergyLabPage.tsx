import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { TemperatureChart } from '@/components/energy-lab/TemperatureChart';
import { EnergyComparisonChart } from '@/components/energy-lab/EnergyComparisonChart';
import { ComfortOverTimeChart } from '@/components/energy-lab/ComfortOverTimeChart';
import { ModelAssumptionsPanel } from '@/components/energy-lab/ModelAssumptionsPanel';
import { runEnergyLabBenchmark, EnergyLabConfig } from '@/simulation/smart-home/energy-lab-runner';
import { Zap, RotateCcw, TrendingDown, Award } from 'lucide-react';

export const EnergyLabPage: React.FC = () => {
  const [config, setConfig] = useState<EnergyLabConfig>({
    durationMinutes: 60,
    initialIndoorTempC: 29.5,
    outdoorTempC: 38.0,
    relativeHumidityPct: 45,
    occupancySchedule: 'vacates-at-30m',
    coolingType: 'ac',
    baselineSetpointC: 24.0,
    baselineFanSpeed: 'off',
    smartAirSetpointC: 26.0,
  });

  const benchmarkResult = useMemo(() => {
    return runEnergyLabBenchmark(config);
  }, [config]);

  const handleResetDefaults = () => {
    setConfig({
      durationMinutes: 60,
      initialIndoorTempC: 29.5,
      outdoorTempC: 38.0,
      relativeHumidityPct: 45,
      occupancySchedule: 'vacates-at-30m',
      coolingType: 'ac',
      baselineSetpointC: 24.0,
      baselineFanSpeed: 'off',
      smartAirSetpointC: 26.0,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Energy Lab — Comparative Benchmark"
        subtitle="Simulate and compare conventional room cooling vs SmartAir Smart Home under identical environmental schedules."
        actions={
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>
        }
      />

      {/* Scenario Configuration Controls */}
      <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Benchmark Scenario Setup
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Duration */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Duration (Sim Minutes)</label>
            <select
              value={config.durationMinutes}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, durationMinutes: parseInt(e.target.value) }))
              }
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2"
            >
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (Standard)</option>
              <option value={120}>120 Minutes (2 Hours)</option>
            </select>
          </div>

          {/* Occupancy Schedule */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Occupancy Profile</label>
            <select
              value={config.occupancySchedule}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  occupancySchedule: e.target.value as EnergyLabConfig['occupancySchedule'],
                }))
              }
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2"
            >
              <option value="always-present">Occupied Throughout</option>
              <option value="vacates-at-30m">Vacates at 30 min (Tests Auto-off)</option>
            </select>
          </div>

          {/* Conventional Baseline Setpoint */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Conventional Setpoint (°C)
            </label>
            <input
              type="number"
              step={0.5}
              min={18}
              max={28}
              value={config.baselineSetpointC}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  baselineSetpointC: parseFloat(e.target.value) || 24,
                }))
              }
              className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
            />
          </div>

          {/* SmartAir Setpoint */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              SmartAir Target Setpoint (°C)
            </label>
            <input
              type="number"
              step={0.5}
              min={22}
              max={30}
              value={config.smartAirSetpointC}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  smartAirSetpointC: parseFloat(e.target.value) || 26,
                }))
              }
              className="w-full bg-[#131b26] border border-slate-700 text-cyan-300 font-bold rounded-xl px-3 py-2 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Comparative Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Conventional Energy"
          value={benchmarkResult.totalBaselineKWh.toFixed(3)}
          unit="kWh"
          subValue={`At ${config.baselineSetpointC}°C setpoint`}
          icon={<Zap className="w-5 h-5 text-slate-400" />}
        />
        <MetricCard
          label="SmartAir Energy"
          value={benchmarkResult.totalSmartAirKWh.toFixed(3)}
          unit="kWh"
          subValue={`At ${config.smartAirSetpointC}°C + Auto Fan`}
          icon={<Zap className="w-5 h-5 text-emerald-400" />}
          statusVariant="success"
        />
        <MetricCard
          label="Modeled Difference"
          value={
            benchmarkResult.savingsPercentage >= 0
              ? `-${benchmarkResult.savingsPercentage}%`
              : `+${Math.abs(benchmarkResult.savingsPercentage)}%`
          }
          subValue={`Δ ${benchmarkResult.absoluteDiffKWh > 0 ? '-' : '+'}${Math.abs(
            benchmarkResult.absoluteDiffKWh,
          ).toFixed(3)} kWh`}
          icon={<TrendingDown className="w-5 h-5 text-cyan-400" />}
          statusVariant={benchmarkResult.savingsPercentage >= 0 ? 'accent' : 'warning'}
        />
        <MetricCard
          label="Avg Comfort Score"
          value={`${benchmarkResult.avgSmartAirComfort}/100`}
          subValue={`Baseline: ${benchmarkResult.avgBaselineComfort}/100`}
          icon={<Award className="w-5 h-5 text-cyan-400" />}
          statusVariant="accent"
        />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TemperatureChart data={benchmarkResult.points} />
        <EnergyComparisonChart data={benchmarkResult.points} />
      </div>

      <ComfortOverTimeChart data={benchmarkResult.points} />

      {/* Model Parameters & Disclosure */}
      <ModelAssumptionsPanel />
    </div>
  );
};
