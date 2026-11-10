import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitCommit,
  Clock,
  Code,
  FileCode,
  CheckCircle2,
  Calendar,
  Layers,
  Download,
  Terminal,
  Info,
  ChevronRight
} from 'lucide-react';
import { DatasetDetail, PipelineStep, api } from '../services/api';

interface PipelineHistoryTabProps {
  datasetDetail: DatasetDetail | null;
}

export const PipelineHistoryTab: React.FC<PipelineHistoryTabProps> = ({ datasetDetail }) => {
  const [history, setHistory] = useState<PipelineStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<PipelineStep | null>(null);

  useEffect(() => {
    if (datasetDetail) {
      loadHistory();
    }
  }, [datasetDetail?.id]);

  const loadHistory = async () => {
    if (!datasetDetail) return;
    setLoading(true);
    try {
      const res = await api.getPipelineHistory(datasetDetail.id);
      setHistory(res.steps);
      if (res.steps.length > 0) {
        setSelectedStep(res.steps[res.steps.length - 1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!datasetDetail) return;
    window.open(api.getExportUrl(datasetDetail.id, 'script'), '_blank');
  };

  const downloadNotebook = () => {
    if (!datasetDetail) return;
    window.open(api.getExportUrl(datasetDetail.id, 'notebook'), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-blue-400" />
            Reproducible Pipeline Execution Audit Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable lineage of every transformation applied to <span className="text-slate-200 font-medium">{datasetDetail?.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadScript}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export preprocess.py</span>
          </button>
          <button
            onClick={downloadNotebook}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Export Jupyter (.ipynb)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sequential Timeline on Left, Step Parameters Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Timeline */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Transformation Sequence ({history.length} stages)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Persistent SQLite Ledger</span>
          </div>

          <div className="space-y-3">
            {history.map((step, idx) => {
              const isSelected = selectedStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/5'
                      : 'border-white/5 bg-slate-900/60 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-white/10">
                      {step.step_number}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{step.step_name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="text-slate-500">{step.created_at}</span>
                        <span>•</span>
                        <span className="text-blue-300">
                          {step.rows_before?.toLocaleString()} → {step.rows_after?.toLocaleString()} rows
                        </span>
                        <span>•</span>
                        <span className="text-emerald-300">{step.execution_time_ms} ms</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-slate-500 mt-1 transition-transform ${
                      isSelected ? 'text-blue-400 translate-x-1' : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspector Pane */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-5 flex flex-col justify-between">
          {selectedStep ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step {selectedStep.step_number} • {selectedStep.operation_type}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{selectedStep.step_name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Executed at: {selectedStep.created_at}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-500 text-[10px] block">Row Transition</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedStep.rows_before?.toLocaleString()} → {selectedStep.rows_after?.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-500 text-[10px] block">Column Dimension</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedStep.cols_before} → {selectedStep.cols_after}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 col-span-2 flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">Processing Latency</span>
                  <span className="text-emerald-400 font-bold">{selectedStep.execution_time_ms} ms</span>
                </div>
              </div>

              {/* Parameters & Details */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Operation Parameters</span>
                <pre className="p-3 rounded-xl bg-slate-900 border border-white/10 text-[11px] font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {JSON.stringify(selectedStep.parameters, null, 2)}
                </pre>
              </div>

              {selectedStep.details && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Execution Metadata</span>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                    {JSON.stringify(selectedStep.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select a pipeline step from the timeline to inspect parameters and execution metadata.
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              All pipeline steps are dynamically compiled into the standalone Python script to ensure 100% scientific reproducibility in external Jupyter or terminal environments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
