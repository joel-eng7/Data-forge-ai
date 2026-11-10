import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HistogramBin {
  bin: string;
  count: number;
  range_start: number;
  range_end: number;
}

interface HistogramChartProps {
  data: HistogramBin[];
  columnName?: string;
  stats?: {
    mean?: number;
    median?: number;
    std?: number;
    min?: number;
    max?: number;
  };
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  columnName = 'Feature',
  stats,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {stats && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">
            Mean: <strong className="text-blue-400">{stats.mean}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">
            Median: <strong className="text-emerald-400">{stats.median}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">
            Std: <strong className="text-purple-400">{stats.std}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">
            Range: [{stats.min} – {stats.max}]
          </span>
        </div>
      )}

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="bin"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HistogramBin;
                  return (
                    <div className="p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl text-xs">
                      <p className="font-semibold text-white">{columnName}</p>
                      <p className="text-slate-400">Bin: {item.bin}</p>
                      <p className="text-blue-400 font-mono font-bold mt-1">
                        Frequency: {item.count.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
