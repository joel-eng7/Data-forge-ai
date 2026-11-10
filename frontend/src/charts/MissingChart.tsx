import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MissingItem {
  column: string;
  missing_count: number;
  missing_pct: number;
  valid_count: number;
}

interface MissingChartProps {
  data: MissingItem[];
}

export const MissingChart: React.FC<MissingChartProps> = ({ data }) => {
  const chartData = data.slice(0, 15); // top 15 columns

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="column"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as MissingItem;
                return (
                  <div className="p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl text-xs backdrop-blur-md">
                    <p className="font-semibold text-white mb-1">{item.column}</p>
                    <p className="text-rose-400 font-mono">
                      Missing: {item.missing_count.toLocaleString()} ({item.missing_pct}%)
                    </p>
                    <p className="text-slate-400 font-mono">
                      Valid: {item.valid_count.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="missing_count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.missing_count > 0 ? '#f43f5e' : '#3b82f6'}
                opacity={entry.missing_count > 0 ? 0.9 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
