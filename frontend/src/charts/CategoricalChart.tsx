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

interface CatItem {
  category: string;
  count: number;
  percentage: number;
}

interface CategoricalChartProps {
  data: CatItem[];
  columnName?: string;
}

export const CategoricalChart: React.FC<CategoricalChartProps> = ({
  data,
  columnName = 'Category',
}) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CatItem;
                return (
                  <div className="p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl text-xs">
                    <p className="font-semibold text-white">{columnName}: {item.category}</p>
                    <p className="text-purple-400 font-mono font-bold mt-1">
                      Count: {item.count.toLocaleString()} ({item.percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
