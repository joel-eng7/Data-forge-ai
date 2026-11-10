import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BoxPlotSummary {
  column: string;
  min: number;
  lower_whisker: number;
  q1: number;
  median: number;
  q3: number;
  upper_whisker: number;
  max: number;
  outlier_count: number;
}

interface BoxPlotCardsProps {
  plots: BoxPlotSummary[];
}

export const BoxPlotCards: React.FC<BoxPlotCardsProps> = ({ plots }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plots.map((plot) => {
        const range = Math.max(1, plot.max - plot.min);
        const getPercent = (val: number) => {
          return Math.max(0, Math.min(100, ((val - plot.min) / range) * 100));
        };

        const q1Pct = getPercent(plot.q1);
        const medPct = getPercent(plot.median);
        const q3Pct = getPercent(plot.q3);
        const lowWhiskPct = getPercent(plot.lower_whisker);
        const upWhiskPct = getPercent(plot.upper_whisker);

        return (
          <div
            key={plot.column}
            className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white truncate" title={plot.column}>
                {plot.column}
              </span>
              {plot.outlier_count > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {plot.outlier_count} outliers
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  No outliers
                </span>
              )}
            </div>

            {/* Custom Box Plot Bar Graphic */}
            <div className="relative h-10 w-full flex items-center py-2 select-none">
              {/* Whiskers line */}
              <div
                className="absolute h-0.5 bg-slate-600 top-1/2 -translate-y-1/2"
                style={{
                  left: `${lowWhiskPct}%`,
                  width: `${Math.max(2, upWhiskPct - lowWhiskPct)}%`,
                }}
              />

              {/* Lower Whisker vertical mark */}
              <div
                className="absolute w-0.5 h-3 bg-slate-400 top-1/2 -translate-y-1/2"
                style={{ left: `${lowWhiskPct}%` }}
              />

              {/* Upper Whisker vertical mark */}
              <div
                className="absolute w-0.5 h-3 bg-slate-400 top-1/2 -translate-y-1/2"
                style={{ left: `${upWhiskPct}%` }}
              />

              {/* IQR Box (Q1 to Q3) */}
              <div
                className="absolute h-6 rounded bg-blue-600/30 border border-blue-400/80 top-1/2 -translate-y-1/2 shadow"
                style={{
                  left: `${q1Pct}%`,
                  width: `${Math.max(3, q3Pct - q1Pct)}%`,
                }}
              />

              {/* Median Line */}
              <div
                className="absolute w-1 h-7 bg-amber-400 top-1/2 -translate-y-1/2 rounded"
                style={{ left: `${medPct}%` }}
                title={`Median: ${plot.median}`}
              />
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
              <div>
                <span className="text-slate-500 block">Min</span>
                <span className="text-slate-300">{plot.min}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Q1</span>
                <span className="text-slate-300">{plot.q1}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-amber-400">Median</span>
                <span className="text-amber-300 font-bold">{plot.median}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Q3</span>
                <span className="text-slate-300">{plot.q3}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
