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

interface TemperatureChartProps {
  data: EnergyLabStepPoint[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold font-['Outfit'] text-white">Indoor Temperature Over Time</h4>
          <span className="text-xs text-slate-400">
            Conventional fixed setpoint vs SmartAir dynamic comfort response
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
            <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131b26',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: unknown, name: unknown) => [`${value}°C`, String(name)]}
              labelFormatter={(val) => `Simulated Time: ${val} minutes`}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="outdoorTempC"
              name="Outdoor Ambient"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="baselineIndoorTempC"
              name="Conventional Baseline"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="smartAirIndoorTempC"
              name="SmartAir Room"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
