import React from 'react';
import { motion } from 'framer-motion';

interface QualityGaugeProps {
  score: number;
  letterGrade: string;
  completeness: number;
  uniqueness: number;
  validity: number;
  consistency: number;
}

export const QualityGauge: React.FC<QualityGaugeProps> = ({
  score,
  letterGrade,
  completeness,
  uniqueness,
  validity,
  consistency,
}) => {
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 90) return '#10b981'; // emerald
    if (val >= 75) return '#3b82f6'; // blue
    if (val >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const primaryColor = getScoreColor(score);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl">
      {/* Circle Gauge */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke={primaryColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white font-mono">{score}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Grade: <span style={{ color: primaryColor }}>{letterGrade}</span>
          </span>
        </div>
      </div>

      {/* Sub-Dimension Breakdown Bars */}
      <div className="flex-1 w-full space-y-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-300">Completeness (Missing Values)</span>
            <span className="font-mono text-slate-200">{completeness}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-300">Uniqueness (Duplicates Rate)</span>
            <span className="font-mono text-slate-200">{uniqueness}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uniqueness}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-300">Validity (Type & Consistency)</span>
            <span className="font-mono text-slate-200">{validity}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${validity}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-300">Consistency (Outliers & Bounds)</span>
            <span className="font-mono text-slate-200">{consistency}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${consistency}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
