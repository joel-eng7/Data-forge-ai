import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Copy,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { QualityReport, DatasetDetail } from '../services/api';
import { QualityGauge } from '../charts/QualityGauge';
import { MissingChart } from '../charts/MissingChart';
import { DashboardTab } from '../components/Sidebar';

interface DataQualityTabProps {
  qualityReport: QualityReport | null;
  datasetDetail: DatasetDetail | null;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({
  qualityReport,
  datasetDetail,
  onNavigateTab,
}) => {
  if (!qualityReport) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Generating comprehensive quality audit report...
      </div>
    );
  }

  const missingChartData = datasetDetail?.columns?.map((c) => ({
    column: c.name,
    missing_count: c.missing_count,
    missing_pct: c.missing_percentage,
    valid_count: (datasetDetail.total_rows || 0) - c.missing_count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Automated Data Quality Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic data integrity, missingness patterns, anomaly distributions, and type consistency.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('preprocessing')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4" />
          <span>Launch Preprocessing Engine</span>
        </button>
      </div>

      {/* Main Gauge & Dimension Scores */}
      <QualityGauge
        score={qualityReport.overall_score}
        letterGrade={qualityReport.letter_grade}
        completeness={qualityReport.completeness_score}
        uniqueness={qualityReport.uniqueness_score}
        validity={qualityReport.validity_score}
        consistency={qualityReport.consistency_score}
      />

      {/* Issues Diagnostic Feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Detected Data Anomalies & Actionable Remediations ({qualityReport.issues.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {qualityReport.issues.map((issue, idx) => {
            const isHigh = issue.severity === 'high';
            const isMedium = issue.severity === 'medium';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 bg-[#111827] ${
                  isHigh
                    ? 'border-rose-500/30'
                    : isMedium
                    ? 'border-amber-500/30'
                    : 'border-blue-500/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-300'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {issue.severity} priority
                    </span>

                    {issue.column && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                        Column: <strong className="text-slate-200">{issue.column}</strong>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-white mb-1">
                    {issue.type.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{issue.suggested_action}</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('preprocessing')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0"
                  >
                    Fix <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Values Chart */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
              Missing Values Distribution per Feature
            </h2>
            <p className="text-[11px] text-slate-400">
              Columns with missing, null, or Sentinel tokens ('?')
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
            Total Missing: {qualityReport.missing_cells_count.toLocaleString()}
          </span>
        </div>

        <MissingChart data={missingChartData} />
      </div>

      {/* Outliers Report Table */}
      {qualityReport.columns_with_outliers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-purple-400" />
            Statistical Outlier Detection Summary (IQR 1.5× & Z-score)
          </h2>

          <div className="rounded-2xl bg-[#111827] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0E1522] border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Feature</th>
                    <th className="px-5 py-3">IQR Outliers</th>
                    <th className="px-5 py-3">% Outliers</th>
                    <th className="px-5 py-3">Z-Score (|z| &gt; 3)</th>
                    <th className="px-5 py-3">Lower Bound</th>
                    <th className="px-5 py-3">Q1</th>
                    <th className="px-5 py-3">Median</th>
                    <th className="px-5 py-3">Q3</th>
                    <th className="px-5 py-3">Upper Bound</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {qualityReport.columns_with_outliers.map((col) => (
                    <tr key={col.column} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{col.column}</td>
                      <td className="px-5 py-3 text-rose-400 font-bold">
                        {col.outlier_count_iqr.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-rose-300">{col.outlier_percentage_iqr}%</td>
                      <td className="px-5 py-3 text-amber-300">{col.outlier_count_zscore}</td>
                      <td className="px-5 py-3 text-slate-400">{col.lower_bound}</td>
                      <td className="px-5 py-3 text-slate-400">{col.q1}</td>
                      <td className="px-5 py-3 text-emerald-300">{col.median}</td>
                      <td className="px-5 py-3 text-slate-400">{col.q3}</td>
                      <td className="px-5 py-3 text-slate-400">{col.upper_bound}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
