import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calculator,
  Calendar,
  SplitSquareVertical,
  Loader2,
  Info,
  ArrowRight
} from 'lucide-react';
import { DatasetDetail, api } from '../services/api';
import { useToast } from '../components/Toast';

interface FeatureEngineeringTabProps {
  datasetDetail: DatasetDetail | null;
  onDatasetUpdated: () => void;
}

export const FeatureEngineeringTab: React.FC<FeatureEngineeringTabProps> = ({
  datasetDetail,
  onDatasetUpdated,
}) => {
  const toast = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'preset' | 'custom' | 'rename' | 'drop'>('preset');
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom Feature Form
  const [newColName, setNewColName] = useState('');
  const [opType, setOpType] = useState<'math_binary' | 'math_unary' | 'binning' | 'condition'>('math_unary');
  const [colA, setColA] = useState('');
  const [colB, setColB] = useState('');
  const [operator, setOperator] = useState('log');
  const [binsCount, setBinsCount] = useState(4);
  const [conditionVal, setConditionVal] = useState('');

  // Rename form
  const [renameCol, setRenameCol] = useState('');
  const [renameTarget, setRenameTarget] = useState('');

  // Drop form
  const [dropCols, setDropCols] = useState<string[]>([]);

  const numCols = datasetDetail?.columns.filter((c) => c.is_numerical).map((c) => c.name) || [];
  const allCols = datasetDetail?.columns.map((c) => c.name) || [];

  const handleApplyAdultPresets = async () => {
    if (!datasetDetail) return;
    setIsProcessing(true);
    try {
      const res = await api.applyAdultPresetFeatures(datasetDetail.id);
      toast.success('Domain Features Engineered', `Engineered ${res.features.length} Adult Census features.`);
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Feature Engineering Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCustomColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetDetail || !newColName || !colA) return;

    setIsProcessing(true);
    try {
      await api.createCustomColumn(datasetDetail.id, {
        new_column_name: newColName.trim(),
        operation: opType,
        col_a: colA,
        col_b: opType === 'math_binary' ? colB : undefined,
        operator: operator,
        bins: opType === 'binning' ? Number(binsCount) : undefined,
        condition_val: opType === 'condition' ? conditionVal : undefined,
        if_true_val: 1,
        if_false_val: 0,
      });
      toast.success('Column Created', `Feature '${newColName}' successfully added.`);
      setNewColName('');
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Creation Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetDetail || !renameCol || !renameTarget) return;

    setIsProcessing(true);
    try {
      await api.renameColumns(datasetDetail.id, { [renameCol]: renameTarget.trim() });
      toast.success('Column Renamed', `Renamed '${renameCol}' to '${renameTarget}'.`);
      setRenameTarget('');
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Rename Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async () => {
    if (!datasetDetail || dropCols.length === 0) return;
    if (!confirm(`Are you sure you want to drop ${dropCols.length} columns: ${dropCols.join(', ')}?`)) return;

    setIsProcessing(true);
    try {
      await api.dropColumns(datasetDetail.id, dropCols);
      toast.success('Columns Dropped', `Pruned ${dropCols.length} features.`);
      setDropCols([]);
      onDatasetUpdated();
    } catch (err: any) {
      toast.error('Drop Failed', err.message);
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
            <Sparkles className="w-5 h-5 text-purple-400" />
            Feature Engineering Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct domain features, non-linear mathematical transforms, quantile brackets, and clean schema names.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'preset' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Domain Presets
          </button>
          <button
            onClick={() => setActiveSubTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'custom' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Transforms
          </button>
          <button
            onClick={() => setActiveSubTab('rename')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'rename' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rename
          </button>
          <button
            onClick={() => setActiveSubTab('drop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'drop' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drop Columns
          </button>
        </div>
      </div>

      {/* SubTab 1: Adult Census Domain Presets */}
      {activeSubTab === 'preset' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Curated ML Domain Features
              </div>
              <h2 className="text-base font-bold text-white">
                Adult Census Domain Feature Generator
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Engineers 4 high-value features specifically designed for tabular income classification on the UCI Adult Census Income dataset.
              </p>
            </div>

            <button
              disabled={isProcessing}
              onClick={handleApplyAdultPresets}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate All 4 Domain Features</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-400">age_group</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">
                    Binned Categorical
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">Sociological Career Brackets</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Binned from <code className="text-slate-300">age</code>: Youth (&lt;25), Early-Career (25-44), Mid-Late Career (45-64), Retirement (65+).
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                Target: Captures non-linear lifecycle earning power curves.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-400">work_schedule_type</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                    Binned Categorical
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">Labor Commitment Tiers</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Binned from <code className="text-slate-300">hours_per_week</code>: Part-Time (&lt;35h), Standard Full-Time (35-40h), Extended (41-50h), Overtime (&gt;50h).
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                Target: Distinguishes standard salaried vs hourly overtime workloads.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">has_capital_gain</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Binary Indicator (0 / 1)
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">Capital Market Return Flag</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Indicator flag: 1 if <code className="text-slate-300">capital_gain &gt; 0</code> else 0.
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                Target: Highly predictive binary filter isolating wealth-generation from active assets.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400">has_capital_loss</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                    Binary Indicator (0 / 1)
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">Investment Portfolio Realization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Indicator flag: 1 if <code className="text-slate-300">capital_loss &gt; 0</code> else 0.
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                Target: Realized loss deductions signify significant tax filing and investment assets.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Custom Transforms */}
      {activeSubTab === 'custom' && (
        <form
          onSubmit={handleCreateCustomColumn}
          className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-5 max-w-2xl"
        >
          <div>
            <h2 className="text-base font-bold text-white mb-1">Custom Feature Generator</h2>
            <p className="text-xs text-slate-400">
              Apply mathematical unary / binary transformations, quantile binning, or conditional indicators.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              New Feature Name
            </label>
            <input
              type="text"
              required
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="e.g. log_hours or net_capital"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Operation Type
              </label>
              <select
                value={opType}
                onChange={(e) => setOpType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="math_unary">Unary Math: log(x), sqrt(x), abs(x)</option>
                <option value="math_binary">Binary Math: A + B, A - B, A * B, A / B</option>
                <option value="binning">Quantile Binning (Equal Frequency)</option>
                <option value="condition">Conditional Indicator (Flag if value matches)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Column (A)
              </label>
              <select
                required
                value={colA}
                onChange={(e) => setColA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select column...</option>
                {allCols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {opType === 'math_unary' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Unary Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="log">log1p(x) — Natural Logarithm (De-skews distribution)</option>
                <option value="sqrt">sqrt(x) — Square Root</option>
                <option value="abs">abs(x) — Absolute Value</option>
              </select>
            </div>
          )}

          {opType === 'math_binary' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operator
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="+">Addition (+)</option>
                  <option value="-">Subtraction (-)</option>
                  <option value="*">Multiplication (*)</option>
                  <option value="/">Division (/)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Secondary Column (B)
                </label>
                <select
                  required
                  value={colB}
                  onChange={(e) => setColB(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select column...</option>
                  {numCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {opType === 'binning' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Quantile Bins Count (e.g. 4 for Quartiles, 5 for Quintiles)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={binsCount}
                onChange={(e) => setBinsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {opType === 'condition' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Condition Target Value (Sets 1 if equal, 0 if not)
              </label>
              <input
                type="text"
                value={conditionVal}
                onChange={(e) => setConditionVal(e.target.value)}
                placeholder="e.g. United-States or Private"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || !newColName || !colA}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Create Feature</span>
          </button>
        </form>
      )}

      {/* SubTab 3: Rename Columns */}
      {activeSubTab === 'rename' && (
        <form
          onSubmit={handleRename}
          className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4 max-w-xl"
        >
          <div>
            <h2 className="text-base font-bold text-white mb-1">Rename Feature Column</h2>
            <p className="text-xs text-slate-400">
              Normalize column names into standard machine learning conventions (e.g. lowercase snake_case).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Name
              </label>
              <select
                required
                value={renameCol}
                onChange={(e) => setRenameCol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select column...</option>
                {allCols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                New Column Name
              </label>
              <input
                type="text"
                required
                value={renameTarget}
                onChange={(e) => setRenameTarget(e.target.value)}
                placeholder="e.g. hours_worked_per_week"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !renameCol || !renameTarget}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
            <span>Apply Column Rename</span>
          </button>
        </form>
      )}

      {/* SubTab 4: Drop Columns */}
      {activeSubTab === 'drop' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4 max-w-xl">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Prune Unnecessary Columns</h2>
            <p className="text-xs text-slate-400">
              Eliminate redundant IDs, constant features, or unwanted sensitive attributes before training.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Select Columns to Drop ({dropCols.length} selected)
              </label>
              {dropCols.length > 0 && (
                <button
                  onClick={() => setDropCols([])}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-900 border border-white/10">
              {allCols.map((c) => {
                const isSelected = dropCols.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setDropCols(dropCols.filter((col) => col !== c));
                      } else {
                        setDropCols([...dropCols, c]);
                      }
                    }}
                    className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-mono truncate transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white font-semibold'
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
            disabled={isProcessing || dropCols.length === 0}
            onClick={handleDrop}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Permanently Drop {dropCols.length} Columns</span>
          </button>
        </div>
      )}
    </div>
  );
};
