import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Grid,
  Box,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DatasetDetail, api } from '../services/api';
import { MissingChart } from '../charts/MissingChart';
import { HistogramChart } from '../charts/HistogramChart';
import { CategoricalChart } from '../charts/CategoricalChart';
import { CorrelationHeatmap } from '../charts/CorrelationHeatmap';
import { BoxPlotCards } from '../charts/BoxPlotCards';

interface VisualizationsTabProps {
  datasetDetail: DatasetDetail | null;
}

export const VisualizationsTab: React.FC<VisualizationsTabProps> = ({ datasetDetail }) => {
  const [vizData, setVizData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCol, setSelectedCol] = useState<string | undefined>(undefined);
  const [activeViz, setActiveViz] = useState<
    'distribution' | 'categorical' | 'correlation' | 'boxplot' | 'missing' | 'comparison'
  >('distribution');

  useEffect(() => {
    if (datasetDetail) {
      loadVisualizations(selectedCol);
    }
  }, [datasetDetail?.id, selectedCol]);

  const loadVisualizations = async (col?: string) => {
    if (!datasetDetail) return;
    setLoading(true);
    try {
      const data = await api.getVisualizations(datasetDetail.id, col);
      setVizData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const numCols = datasetDetail?.columns.filter((c) => c.is_numerical).map((c) => c.name) || [];
  const catCols = datasetDetail?.columns.filter((c) => c.is_categorical).map((c) => c.name) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Exploratory Data Analytics & Visualizations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive statistical charts computed directly from the Pandas dataframe in the backend.
          </p>
        </div>

        {/* Column selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Inspect Feature:</span>
          <select
            value={selectedCol || ''}
            onChange={(e) => setSelectedCol(e.target.value || undefined)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">Default Feature</option>
            <optgroup label="Numerical Features">
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c} (Numeric)
                </option>
              ))}
            </optgroup>
            <optgroup label="Categorical Features">
              {catCols.map((c) => (
                <option key={c} value={c}>
                  {c} (Categorical)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Visualization Tab Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10">
        {[
          { id: 'distribution', label: 'Numerical Histograms', icon: TrendingUp },
          { id: 'categorical', label: 'Categorical Frequencies', icon: PieChart },
          { id: 'correlation', label: 'Correlation Heatmap', icon: Grid },
          { id: 'boxplot', label: 'Box Plots & Outliers', icon: Box },
          { id: 'missing', label: 'Missing Values Chart', icon: BarChart3 },
          { id: 'comparison', label: 'Before & After Metrics', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViz === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViz(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Viewer */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl min-h-[380px] relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* View 1: Numerical Histogram */}
        {activeViz === 'distribution' && vizData?.histogram && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Continuous Feature Distribution Histogram
                </h3>
                <p className="text-xs text-slate-400">
                  Feature: <code className="text-cyan-400 font-bold">{vizData.histogram.column}</code>
                </p>
              </div>
            </div>

            <HistogramChart
              data={vizData.histogram.data}
              columnName={vizData.histogram.column}
              stats={vizData.histogram.stats}
            />
          </div>
        )}

        {/* View 2: Categorical Frequency */}
        {activeViz === 'categorical' && vizData?.categorical_frequency && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Categorical Frequency Distribution (Top Categories)
                </h3>
                <p className="text-xs text-slate-400">
                  Feature: <code className="text-purple-400 font-bold">{vizData.categorical_frequency.column}</code>
                </p>
              </div>
            </div>

            <CategoricalChart
              data={vizData.categorical_frequency.data}
              columnName={vizData.categorical_frequency.column}
            />
          </div>
        )}

        {/* View 3: Correlation Heatmap */}
        {activeViz === 'correlation' && vizData?.correlation && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Pearson Correlation Matrix Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Pairwise linear relationships between numerical features (-1.0 to +1.0)
              </p>
            </div>

            <CorrelationHeatmap
              columns={vizData.correlation.columns}
              matrix={vizData.correlation.matrix}
            />
          </div>
        )}

        {/* View 4: Box Plots */}
        {activeViz === 'boxplot' && vizData?.box_plots && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Statistical Box Plots & Interquartile Ranges (IQR)
              </h3>
              <p className="text-xs text-slate-400">
                Displays Min, Lower Whisker, Q1 (25th%), Median (50th%), Q3 (75th%), Upper Whisker, and Outliers.
              </p>
            </div>

            <BoxPlotCards plots={vizData.box_plots} />
          </div>
        )}

        {/* View 5: Missing Values Chart */}
        {activeViz === 'missing' && vizData?.missing_chart && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Missing Values per Column
              </h3>
              <p className="text-xs text-slate-400">
                Overview of completeness across all features in current dataset state.
              </p>
            </div>

            <MissingChart data={vizData.missing_chart} />
          </div>
        )}

        {/* View 6: Before & After Pipeline Comparison */}
        {activeViz === 'comparison' && vizData?.before_after && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">
                Before & After Preprocessing Delta Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Comparison of the initial raw dataset snapshot against current processed state.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Row Count Delta</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-slate-400 font-mono text-sm">
                    {vizData.before_after.original_rows.toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <span className="text-2xl font-bold font-mono text-white">
                    {vizData.before_after.current_rows.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {vizData.before_after.original_rows - vizData.before_after.current_rows > 0
                    ? `${(vizData.before_after.original_rows - vizData.before_after.current_rows).toLocaleString()} rows pruned`
                    : 'Zero rows dropped'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Features Count Delta</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-slate-400 font-mono text-sm">
                    {vizData.before_after.original_cols}
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="text-2xl font-bold font-mono text-white">
                    {vizData.before_after.current_cols}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {vizData.before_after.current_cols - vizData.before_after.original_cols > 0
                    ? `+${vizData.before_after.current_cols - vizData.before_after.original_cols} features engineered`
                    : 'Schema preserved'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Remaining Null Cells</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-slate-400 font-mono text-sm">
                    {vizData.before_after.initial_missing.toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {vizData.before_after.current_missing.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {vizData.before_after.current_missing === 0 ? '100% Imputed & Complete' : 'Partially Imputed'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
