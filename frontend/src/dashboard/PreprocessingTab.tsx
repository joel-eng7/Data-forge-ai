import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  AlertCircle,
  Copy,
  Binary,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';
import { DatasetDetail, api } from '../services/api';
import { useToast } from '../components/Toast';

interface PreprocessingTabProps {
  datasetDetail: DatasetDetail | null;
  onDatasetUpdated: () => void;
}

export const PreprocessingTab: React.FC<PreprocessingTabProps> = ({
  datasetDetail,
  onDatasetUpdated,
}) => {
  const toast = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    'missing' | 'duplicates' | 'types' | 'outliers' | 'scaling' | 'encoding'
  >('missing');

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);

  // Missing values state
  const [missingStrategy, setMissingStrategy] = useState<'mean' | 'median' | 'mode' | 'constant' | 'drop'>('mean');
  const [selectedMissingCols, setSelectedMissingCols] = useState<string[]>([]);
  const [constantVal, setConstantVal] = useState('Unknown');

  // Duplicates state
  const [duplicateKeep, setDuplicateKeep] = useState<'first' | 'last'>('first');

  // Type cast state
  const [selectedCastCol, setSelectedCastCol] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('float64');

  // Outlier state
  const [outlierMethod, setOutlierMethod] = useState<'iqr' | 'zscore'>('iqr');
  const [outlierThreshold, setOutlierThreshold] = useState<number>(1.5);
  const [outlierAction, setOutlierAction] = useState<'cap' | 'remove' | 'retain'>('cap');
  const [selectedOutlierCols, setSelectedOutlierCols] = useState<string[]>([]);

  // Scaling state
  const [scalingMethod, setScalingMethod] = useState<'standard' | 'minmax' | 'robust'>('standard');
  const [selectedScaleCols, setSelectedScaleCols] = useState<string[]>([]);

  // Encoding state
  const [encodingMethod, setEncodingMethod] = useState<'onehot' | 'label'>('onehot');
  const [selectedEncodeCols, setSelectedEncodeCols] = useState<string[]>([]);
  const [dropFirst, setDropFirst] = useState(false);

  const numCols = datasetDetail?.columns.filter((c) => c.is_numerical).map((c) => c.name) || [];
  const catCols = datasetDetail?.columns.filter((c) => c.is_categorical).map((c) => c.name) || [];

  // Helper to execute operations
  const runOperation = async (fn: () => Promise<any>, successMsg: string) => {
    setIsProcessing(true);
    setLastResult(null);
    try {
      const res = await fn();
      setLastResult(res);
      toast.success('Preprocessing Applied', successMsg);
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Operation Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyMissing = () => {
    if (!datasetDetail) return;
    runOperation(
      () =>
        api.handleMissing(datasetDetail.id, {
          strategy: missingStrategy,
          columns: selectedMissingCols.length > 0 ? selectedMissingCols : undefined,
          fill_value: constantVal,
        }),
      `Applied ${missingStrategy} imputation successfully.`
    );
  };

  const handleApplyDuplicates = () => {
    if (!datasetDetail) return;
    runOperation(
      () =>
        api.handleDuplicates(datasetDetail.id, {
          keep: duplicateKeep,
        }),
      `Pruned duplicate records successfully.`
    );
  };

  const handleApplyTypeCast = () => {
    if (!datasetDetail || !selectedCastCol) return;
    runOperation(
      () =>
        api.handleTypeCast(datasetDetail.id, {
          [selectedCastCol]: targetType,
        }),
      `Cast column '${selectedCastCol}' to ${targetType}.`
    );
  };

  const handleApplyOutliers = () => {
    if (!datasetDetail) return;
    runOperation(
      () =>
        api.handleOutliers(datasetDetail.id, {
          method: outlierMethod,
          threshold: outlierThreshold,
          action: outlierAction,
          columns: selectedOutlierCols.length > 0 ? selectedOutlierCols : undefined,
        }),
      `Outlier treatment completed (${outlierAction}).`
    );
  };

  const handleApplyScaling = () => {
    if (!datasetDetail) return;
    runOperation(
      () =>
        api.handleScaling(datasetDetail.id, {
          method: scalingMethod,
          columns: selectedScaleCols.length > 0 ? selectedScaleCols : undefined,
        }),
      `Normalized features with ${scalingMethod} scaler.`
    );
  };

  const handleApplyEncoding = () => {
    if (!datasetDetail) return;
    runOperation(
      () =>
        api.handleEncoding(datasetDetail.id, {
          method: encodingMethod,
          columns: selectedEncodeCols.length > 0 ? selectedEncodeCols : undefined,
          drop_first: dropFirst,
        }),
      `Encoded categorical features with ${encodingMethod}.`
    );
  };

  const handleReset = async () => {
    if (!datasetDetail) return;
    if (!confirm('Are you sure you want to revert all transformations back to the raw dataset state?')) return;
    setIsProcessing(true);
    try {
      await api.resetDataset(datasetDetail.id);
      toast.info('Pipeline Reset', 'Dataset restored to original raw state.');
      setLastResult(null);
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Reset Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Data Preprocessing Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade transformations powered by Pandas & Scikit-learn. Every action is registered in the pipeline audit log.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          title="Prune all pipeline transformations back to initial raw ingestion"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Pipeline</span>
        </button>
      </div>

      {/* Module Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10">
        {[
          { id: 'missing', label: '1. Missing Values', icon: AlertCircle },
          { id: 'duplicates', label: '2. Duplicates', icon: Copy },
          { id: 'types', label: '3. Data Types', icon: Layers },
          { id: 'outliers', label: '4. Outlier Engine', icon: TrendingDown },
          { id: 'scaling', label: '5. Feature Scaling', icon: Maximize2 },
          { id: 'encoding', label: '6. Categorical Encoding', icon: Binary },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Module Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Operation Configuration */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-5">
          {/* SubTab 1: Missing Values */}
          {activeSubTab === 'missing' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Missing Value Imputation Strategy
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Replace missing values or dirty placeholders ('?') with statistical estimates or drop corrupt rows.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Imputation Technique
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'mean', label: 'Mean', desc: 'Continuous averages' },
                    { id: 'median', label: 'Median', desc: 'Robust to outliers' },
                    { id: 'mode', label: 'Mode', desc: 'Most frequent category' },
                    { id: 'constant', label: 'Constant', desc: 'Custom placeholder' },
                    { id: 'drop', label: 'Drop Rows', desc: 'Remove missing rows' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMissingStrategy(s.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        missingStrategy === s.id
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {missingStrategy === 'constant' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Constant Replacement Value
                  </label>
                  <input
                    type="text"
                    value={constantVal}
                    onChange={(e) => setConstantVal(e.target.value)}
                    placeholder="e.g. Unknown or 0"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Apply to Columns (Leave empty for all columns)
                  </label>
                  {selectedMissingCols.length > 0 && (
                    <button
                      onClick={() => setSelectedMissingCols([])}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {datasetDetail?.columns.map((c) => {
                    const isSelected = selectedMissingCols.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMissingCols(selectedMissingCols.filter((col) => col !== c.name));
                          } else {
                            setSelectedMissingCols([...selectedMissingCols, c.name]);
                          }
                        }}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-mono truncate transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {c.name} {c.missing_count > 0 && `(${c.missing_count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleApplyMissing}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                <span>Execute Imputation</span>
              </button>
            </div>
          )}

          {/* SubTab 2: Duplicates */}
          {activeSubTab === 'duplicates' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-400" />
                  Deduplication Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Identify and remove redundant identical records to eliminate bias in gradient estimation and clustering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs">
                <div className="text-slate-400 mb-1">Current Duplicate Records:</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {datasetDetail?.duplicate_rows_count.toLocaleString()} rows
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {datasetDetail?.duplicate_percentage}% of total dataset
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Keep Criterion
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateKeep('first')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      duplicateKeep === 'first'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/5 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Keep First Instance</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Retain earliest chronological record</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateKeep('last')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      duplicateKeep === 'last'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/5 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Keep Last Instance</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Retain latest chronological record</div>
                  </button>
                </div>
              </div>

              <button
                disabled={isProcessing || datasetDetail?.duplicate_rows_count === 0}
                onClick={handleApplyDuplicates}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                <span>Remove Duplicates Now</span>
              </button>
            </div>
          )}

          {/* SubTab 3: Types */}
          {activeSubTab === 'types' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Data Type Coercion
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Safely convert schema datatypes. Handled with numeric coercion to avoid unhandled runtime exceptions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Column
                  </label>
                  <select
                    value={selectedCastCol}
                    onChange={(e) => setSelectedCastCol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select column...</option>
                    {datasetDetail?.columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.dtype})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Type
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="int64">Integer (int64)</option>
                    <option value="float64">Floating Point (float64)</option>
                    <option value="category">Categorical (category)</option>
                    <option value="string">String (string)</option>
                    <option value="datetime">Datetime (datetime64)</option>
                  </select>
                </div>
              </div>

              <button
                disabled={isProcessing || !selectedCastCol}
                onClick={handleApplyTypeCast}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>Convert Column Type</span>
              </button>
            </div>
          )}

          {/* SubTab 4: Outliers */}
          {activeSubTab === 'outliers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                  Outlier Detection & Management
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Detect anomalies using the Interquartile Range (IQR) or Standard Z-Score methods.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Detection Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOutlierMethod('iqr');
                        setOutlierThreshold(1.5);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        outlierMethod === 'iqr'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-slate-900 text-slate-400'
                      }`}
                    >
                      IQR Method (1.5×)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOutlierMethod('zscore');
                        setOutlierThreshold(3.0);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        outlierMethod === 'zscore'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-slate-900 text-slate-400'
                      }`}
                    >
                      Z-Score (|z| &gt; 3)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Treatment Action
                  </label>
                  <select
                    value={outlierAction}
                    onChange={(e) => setOutlierAction(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="cap">Cap / Winsorize (Clamp to IQR Bounds)</option>
                    <option value="remove">Remove Outlier Rows</option>
                    <option value="retain">Retain (Audit only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Numerical Columns (Leave blank for all)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900 border border-white/10 max-h-28 overflow-y-auto">
                  {numCols.map((c) => {
                    const isSelected = selectedOutlierCols.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedOutlierCols(selectedOutlierCols.filter((col) => col !== c));
                          } else {
                            setSelectedOutlierCols([...selectedOutlierCols, c]);
                          }
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleApplyOutliers}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
                <span>Execute Outlier Treatment</span>
              </button>
            </div>
          )}

          {/* SubTab 5: Scaling */}
          {activeSubTab === 'scaling' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  Numerical Feature Scaling
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Normalize feature magnitudes to prevent large numerical scales from dominating gradient descent and distance metrics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Scaler Algorithm
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'standard', name: 'StandardScaler', desc: 'Zero mean, unit variance (z-score)' },
                    { id: 'minmax', name: 'MinMaxScaler', desc: 'Rescale bounded between [0, 1]' },
                    { id: 'robust', name: 'RobustScaler', desc: 'Median & IQR, resistant to anomalies' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setScalingMethod(s.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scalingMethod === s.id
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Columns to Scale (Leave blank for all numericals)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900 border border-white/10 max-h-28 overflow-y-auto">
                  {numCols.map((c) => {
                    const isSelected = selectedScaleCols.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedScaleCols(selectedScaleCols.filter((col) => col !== c));
                          } else {
                            setSelectedScaleCols([...selectedScaleCols, c]);
                          }
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={isProcessing || numCols.length === 0}
                onClick={handleApplyScaling}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize2 className="w-4 h-4" />}
                <span>Execute Feature Scaling</span>
              </button>
            </div>
          )}

          {/* SubTab 6: Encoding */}
          {activeSubTab === 'encoding' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Binary className="w-4 h-4 text-cyan-400" />
                  Categorical Feature Encoding
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transform string and categorical features into model-readable numerical structures.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEncodingMethod('onehot')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    encodingMethod === 'onehot'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/5 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">One-Hot Encoding</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Creates binary indicators for categories</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEncodingMethod('label')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    encodingMethod === 'label'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/5 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Label Encoding</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Maps distinct categories to integers (0..N)</div>
                </button>
              </div>

              {encodingMethod === 'onehot' && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dropFirst}
                    onChange={(e) => setDropFirst(e.target.checked)}
                    className="rounded bg-slate-900 border-white/10 text-blue-500 focus:ring-0"
                  />
                  <span>Drop first category to avoid multicollinearity (dummy variable trap)</span>
                </label>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Categorical Columns
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900 border border-white/10 max-h-28 overflow-y-auto">
                  {catCols.map((c) => {
                    const isSelected = selectedEncodeCols.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedEncodeCols(selectedEncodeCols.filter((col) => col !== c));
                          } else {
                            setSelectedEncodeCols([...selectedEncodeCols, c]);
                          }
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={isProcessing || catCols.length === 0}
                onClick={handleApplyEncoding}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Binary className="w-4 h-4" />}
                <span>Execute Encoding</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Output: Real-Time Execution Diff & Feedback */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Pipeline Execution Feedback
            </h3>
            <p className="text-xs text-slate-400">
              Precise metrics from the latest backend transformation step.
            </p>

            {lastResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs space-y-3"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lastResult.message}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-500 block">Rows:</span>
                    <span className="text-slate-200">
                      {lastResult.rows_before?.toLocaleString()} → {lastResult.rows_after?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-500 block">Columns:</span>
                    <span className="text-slate-200">
                      {lastResult.cols_before} → {lastResult.cols_after}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 col-span-2 flex justify-between items-center">
                    <span className="text-slate-500">Execution Time:</span>
                    <span className="text-blue-400 font-bold">{lastResult.execution_time_ms} ms</span>
                  </div>
                </div>

                {lastResult.details && (
                  <div className="p-2 rounded bg-black/40 border border-white/5 text-[10px] text-slate-400 overflow-x-auto">
                    <span className="text-slate-500 font-semibold block mb-0.5">Operation Details:</span>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(lastResult.details, null, 2)}</pre>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="mt-8 py-12 px-4 rounded-xl bg-slate-900/40 border border-dashed border-white/10 text-center text-xs text-slate-500">
                Configure parameters on the left and click execute. Live diffs, row alterations, and execution latencies will appear here.
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Every applied operation updates the database table and pipeline history, which is compiled directly into the downloadable reproducible Python script and Jupyter Notebook.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
