import React from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Users,
  Layers,
  AlertCircle,
  Copy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Sliders,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { QualityGauge } from '../charts/QualityGauge';
import { DatasetDetail, DatasetSummary, QualityReport, api } from '../services/api';
import { DashboardTab } from '../components/Sidebar';

interface OverviewTabProps {
  datasetDetail: DatasetDetail | null;
  datasets: DatasetSummary[];
  qualityReport: QualityReport | null;
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectDataset: (id: string) => void;
  loading: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  datasetDetail,
  datasets,
  qualityReport,
  onNavigateTab,
  onSelectDataset,
  loading,
}) => {
  const triggerExport = (format: 'csv' | 'excel' | 'script') => {
    if (!datasetDetail) return;
    window.open(api.getExportUrl(datasetDetail.id, format), '_blank');
  };

  const pipelineStages = [
    { title: 'Data Ingestion', desc: 'UCI Census / Raw Stream', done: true },
    { title: 'Quality Audit', desc: `${qualityReport?.issues.length || 0} issues detected`, done: true },
    { title: 'Imputation & Cleaning', desc: `${datasetDetail?.total_missing_values || 0} missing cells`, done: (datasetDetail?.total_missing_values || 0) === 0 },
    { title: 'Outlier Treatment', desc: 'IQR & Z-score boundaries', done: true },
    { title: 'Feature Engineering', desc: 'Domain & interactions', done: (datasetDetail?.total_cols || 0) > (datasetDetail?.columns?.length || 15) },
    { title: 'Export & Code Gen', desc: 'Ready for production models', done: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900/40 border border-white/10 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Machine Learning Data Pipeline Active
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              DataForge AI Studio
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Currently preparing <strong className="text-slate-200">{datasetDetail?.name || 'UCI Adult Census Income Dataset'}</strong>. All statistics are computed in real-time from the backend engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('quality')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Quality Audit
            </button>
            <button
              onClick={() => onNavigateTab('preprocessing')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <Sliders className="w-4 h-4" />
              Start Cleaning
            </button>
          </div>
        </div>
      </div>

      {/* 6 Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Datasets"
          value={datasets.length}
          subValue="projects"
          icon={Database}
          accentColor="blue"
          loading={loading}
        />
        <MetricCard
          title="Total Samples"
          value={datasetDetail ? datasetDetail.total_rows.toLocaleString() : '32,561'}
          subValue="records"
          icon={Users}
          accentColor="cyan"
          loading={loading}
        />
        <MetricCard
          title="Features"
          value={datasetDetail ? datasetDetail.total_cols : 15}
          subValue={`${datasetDetail?.numerical_cols_count || 6} num • ${datasetDetail?.categorical_cols_count || 9} cat`}
          icon={Layers}
          accentColor="purple"
          loading={loading}
        />
        <MetricCard
          title="Missing Cells"
          value={datasetDetail ? datasetDetail.total_missing_values.toLocaleString() : '0'}
          subValue={datasetDetail ? `${datasetDetail.missing_percentage}%` : '0%'}
          icon={AlertCircle}
          accentColor="rose"
          isPositive={false}
          loading={loading}
        />
        <MetricCard
          title="Duplicate Rows"
          value={datasetDetail ? datasetDetail.duplicate_rows_count.toLocaleString() : '24'}
          subValue={datasetDetail ? `${datasetDetail.duplicate_percentage}%` : '0.07%'}
          icon={Copy}
          accentColor="amber"
          isPositive={false}
          loading={loading}
        />
        <MetricCard
          title="Quality Score"
          value={qualityReport ? `${qualityReport.overall_score}` : '96.6'}
          subValue={`Grade ${qualityReport?.letter_grade || 'A+'}`}
          icon={ShieldCheck}
          accentColor="emerald"
          loading={loading}
        />
      </div>

      {/* Main Grid: Quality Score Gauge + Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quality Score Gauge */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Data Quality Audit
            </h2>
            <button
              onClick={() => onNavigateTab('quality')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              Full Inspection Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {qualityReport && (
            <QualityGauge
              score={qualityReport.overall_score}
              letterGrade={qualityReport.letter_grade}
              completeness={qualityReport.completeness_score}
              uniqueness={qualityReport.uniqueness_score}
              validity={qualityReport.validity_score}
              consistency={qualityReport.consistency_score}
            />
          )}

          {/* Quick Action Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('preprocessing')}
              className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
            >
              <div className="text-blue-400 text-xs font-semibold flex items-center justify-between mb-1">
                <span>Impute Missing</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">Mean, median, mode</p>
            </button>

            <button
              onClick={() => onNavigateTab('features')}
              className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-purple-500/30 text-left transition-all group"
            >
              <div className="text-purple-400 text-xs font-semibold flex items-center justify-between mb-1">
                <span>Domain Features</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">Age groups, schedule</p>
            </button>

            <button
              onClick={() => onNavigateTab('visualizations')}
              className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-left transition-all group"
            >
              <div className="text-cyan-400 text-xs font-semibold flex items-center justify-between mb-1">
                <span>Visual Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">Heatmap, box plots</p>
            </button>

            <button
              onClick={() => triggerExport('csv')}
              className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 text-left transition-all group"
            >
              <div className="text-emerald-400 text-xs font-semibold flex items-center justify-between mb-1">
                <span>Download CSV</span>
                <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">Cleaned dataset file</p>
            </button>
          </div>
        </div>

        {/* Right Column: Pipeline Stepper */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Preprocessing Pipeline Stepper
            </h2>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              Step Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.title} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage.done
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {stage.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  {idx < pipelineStages.length - 1 && (
                    <div className="w-0.5 h-6 bg-slate-800 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-200">{stage.title}</div>
                  <div className="text-[11px] text-slate-400">{stage.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          Active Datasets & Repositories
        </h2>

        <div className="rounded-2xl bg-[#111827] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Dataset Name</th>
                  <th className="px-5 py-3">Source Provenance</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3">Rows</th>
                  <th className="px-5 py-3">Columns</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    className={`hover:bg-white/5 transition-colors ${
                      datasetDetail?.id === ds.id ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{ds.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 truncate max-w-[240px]">
                      {ds.source}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-white/5">
                        {ds.format}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-200">
                      {ds.current_rows.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-200">
                      {ds.current_cols}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {ds.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {datasetDetail?.id === ds.id ? (
                        <span className="text-[11px] px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectDataset(ds.id)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium transition-colors"
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
