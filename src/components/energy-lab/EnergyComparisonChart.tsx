import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { EnergyLabStepPoint } from '@/simulation/smart-home/energy-lab-runner';

interface EnergyComparisonChartProps {
  data: EnergyLabStepPoint[];
}

export const EnergyComparisonChart: React.FC<EnergyComparisonChartProps> = ({ data }) => {
  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold font-['Outfit'] text-white">Cumulative Energy Accumulation</h4>
          <span className="text-xs text-slate-400">
            Integrated kilowatt-hours (kWh = Watts × Hours / 1000)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(val) => `${val}m`}
            />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131b26',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: unknown, name: unknown) => [`${value} kWh`, String(name)]}
              labelFormatter={(val) => `Simulated Time: ${val} minutes`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="baselineCumulativeKWh"
              name="Conventional Baseline (kWh)"
              stroke="#e2e8f0"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="smartAirCumulativeKWh"
              name="SmartAir Strategy (kWh)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
