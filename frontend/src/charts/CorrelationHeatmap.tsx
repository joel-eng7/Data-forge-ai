import React from 'react';

interface CorrelationCell {
  x: string;
  y: string;
  value: number;
}

interface CorrelationHeatmapProps {
  columns: string[];
  matrix: CorrelationCell[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  columns,
  matrix,
}) => {
  if (!columns || columns.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-mono">
        At least 2 numerical features are required to compute correlation.
      </div>
    );
  }

  const getCellColor = (val: number) => {
    // Shading from -1 to 1
    if (val > 0) {
      // Blue/cyan shades
      const alpha = Math.min(1, Math.max(0.1, val));
      return `rgba(59, 130, 246, ${alpha})`;
    } else if (val < 0) {
      // Rose/amber shades
      const alpha = Math.min(1, Math.max(0.1, Math.abs(val)));
      return `rgba(244, 63, 94, ${alpha})`;
    }
    return 'rgba(30, 41, 59, 0.4)';
  };

  return (
    <div className="overflow-x-auto p-2">
      <div className="inline-block min-w-full">
        {/* Header row */}
        <div className="flex items-center">
          <div className="w-28 shrink-0" />
          {columns.map((c) => (
            <div
              key={c}
              className="w-16 h-12 flex items-end justify-center text-[10px] font-mono text-slate-400 rotate-[-45deg] origin-bottom-left truncate select-none"
              title={c}
            >
              {c.length > 8 ? c.substring(0, 7) + '..' : c}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="mt-4 space-y-1">
          {columns.map((rowCol) => (
            <div key={rowCol} className="flex items-center gap-1">
              <div
                className="w-28 shrink-0 text-[11px] font-mono text-slate-300 truncate text-right pr-2"
                title={rowCol}
              >
                {rowCol}
              </div>
              {columns.map((colCol) => {
                const cell = matrix.find((m) => m.x === colCol && m.y === rowCol);
                const val = cell ? cell.value : 0;
                return (
                  <div
                    key={`${rowCol}-${colCol}`}
                    style={{ backgroundColor: getCellColor(val) }}
                    className="w-16 h-10 flex items-center justify-center text-[11px] font-mono font-medium rounded border border-white/5 cursor-pointer hover:scale-105 hover:z-10 transition-all text-white/90 shadow-sm"
                    title={`${rowCol} ↔ ${colCol}: ${val.toFixed(3)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500" /> -1.0 (Strong Negative)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-800" /> 0.0 (Zero Correlation)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500" /> +1.0 (Strong Positive)
          </span>
        </div>
      </div>
    </div>
  );
};
