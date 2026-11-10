import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  accentColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  isPositive = true,
  icon: Icon,
  accentColor = 'blue',
  loading = false,
}) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative p-5 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all shadow-lg overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-wider uppercase text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border transition-colors ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
        ) : (
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        )}
        {subValue && <span className="text-xs text-slate-500 font-medium">{subValue}</span>}
      </div>

      {change && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className={isPositive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {change}
          </span>
          <span className="text-slate-500">vs original snapshot</span>
        </div>
      )}
    </motion.div>
  );
};
